"""
enquiries.py — All enquiry-related API endpoints.

Routes:
  POST   /enquiry                    Create a new inbound enquiry
  POST   /enquiry/{id}/followup      Schedule a follow-up
  POST   /enquiry/{id}/escalate      Manually escalate to a human agent
  GET    /enquiry/{id}/history       Full conversation history + status timeline
"""

from datetime import datetime, timezone, timedelta

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Path
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.logger import get_logger
from app.models.enquiry import (
    Enquiry, EnquiryEvent, EnquiryStatus, EventType, Channel
)
from app.schemas.enquiry import (
    EnquiryCreate, EnquiryCreateResponse,
    FollowUpRequest, FollowUpResponse,
    EscalationRequest, EscalationResponse,
    EnquiryOut,
)
from app.workers.processor import process_enquiry

router = APIRouter()
logger = get_logger(__name__)


# ---------------------------------------------------------------------------
# POST /enquiry — Create a new enquiry
# ---------------------------------------------------------------------------

@router.post(
    "/",
    response_model=EnquiryCreateResponse,
    status_code=202,  # 202 Accepted: we've got it, processing is async
    summary="Create a new customer enquiry",
    description=(
        "Accepts an inbound customer message from WhatsApp, email, or phone. "
        "Returns a job ID immediately — SOP matching happens in the background "
        "so the client is never left waiting."
    ),
)
async def create_enquiry(
    payload: EnquiryCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    # Validate the channel value
    try:
        channel = Channel(payload.channel.lower())
    except ValueError:
        raise HTTPException(
            status_code=422,
            detail=f"Invalid channel '{payload.channel}'. Must be one of: whatsapp, email, call.",
        )

    # Persist the new enquiry record
    enquiry = Enquiry(
        customer_name=payload.customer_name,
        channel=channel,
        message=payload.message,
        status=EnquiryStatus.pending,
    )
    db.add(enquiry)
    # flush() writes the row and populates enquiry.id without committing the transaction.
    # We need the ID before we can insert the related EnquiryEvent row.
    db.flush()

    # Record the creation event in the timeline
    db.add(EnquiryEvent(
        enquiry_id=enquiry.id,
        event_type=EventType.created,
        description=f"Enquiry received via {channel.value} from {payload.customer_name}.",
    ))

    db.commit()
    db.refresh(enquiry)

    # Kick off SOP matching in the background — this returns instantly
    background_tasks.add_task(process_enquiry, enquiry.id)

    logger.info(
        f"event=enquiry_created enquiry_id={enquiry.id} "
        f"customer='{enquiry.customer_name}' channel={channel.value}"
    )

    return EnquiryCreateResponse(
        job_id=enquiry.id,
        message="Enquiry received. Processing in background.",
        status=enquiry.status.value,
    )


# ---------------------------------------------------------------------------
# POST /enquiry/{id}/followup — Schedule a follow-up
# ---------------------------------------------------------------------------

@router.post(
    "/{enquiry_id}/followup",
    response_model=FollowUpResponse,
    summary="Schedule a follow-up for an open enquiry",
    description="Set a follow-up reminder on an open enquiry. Accepts a delay in minutes and an optional message template.",
)
async def schedule_followup(
    enquiry_id: str = Path(..., description="The enquiry ID returned from POST /enquiry"),
    payload: FollowUpRequest = ...,
    db: Session = Depends(get_db),
):
    enquiry = _get_enquiry_or_404(db, enquiry_id)

    # Only allow follow-ups on enquiries that are still active
    if enquiry.status in (EnquiryStatus.resolved,):
        raise HTTPException(
            status_code=409,
            detail="Cannot schedule a follow-up on a resolved enquiry.",
        )

    due_at = datetime.now(timezone.utc) + timedelta(minutes=payload.delay_minutes)

    # Personalise the template if provided
    message = payload.message_template or (
        f"Hi {enquiry.customer_name}, just following up on your recent enquiry. "
        "Is there anything else we can help with?"
    )
    message = message.replace("{name}", enquiry.customer_name)

    enquiry.followup_due_at = due_at
    enquiry.followup_message = message
    enquiry.updated_at = datetime.now(timezone.utc)

    db.add(EnquiryEvent(
        enquiry_id=enquiry_id,
        event_type=EventType.follow_up_scheduled,
        description=f"Follow-up scheduled for {due_at.isoformat()} ({payload.delay_minutes} minutes from now).",
    ))

    db.commit()

    logger.info(f"event=followup_scheduled enquiry_id={enquiry_id} due_at={due_at.isoformat()}")

    return FollowUpResponse(
        enquiry_id=enquiry_id,
        follow_up_due_at=due_at,
        message=f"Follow-up scheduled successfully for {due_at.strftime('%Y-%m-%d %H:%M UTC')}.",
    )


# ---------------------------------------------------------------------------
# POST /enquiry/{id}/escalate — Manually escalate to a human agent
# ---------------------------------------------------------------------------

@router.post(
    "/{enquiry_id}/escalate",
    response_model=EscalationResponse,
    summary="Escalate an enquiry to a human agent",
    description="Marks the enquiry as escalated and records the reason. Once escalated, it stays escalated until resolved.",
)
async def escalate_enquiry(
    enquiry_id: str = Path(..., description="The enquiry ID to escalate"),
    payload: EscalationRequest = ...,
    db: Session = Depends(get_db),
):
    enquiry = _get_enquiry_or_404(db, enquiry_id)

    if enquiry.status == EnquiryStatus.escalated:
        raise HTTPException(
            status_code=409,
            detail="This enquiry is already escalated.",
        )

    if enquiry.status == EnquiryStatus.resolved:
        raise HTTPException(
            status_code=409,
            detail="Cannot escalate a resolved enquiry.",
        )

    enquiry.status = EnquiryStatus.escalated
    enquiry.escalation_reason = payload.reason
    enquiry.updated_at = datetime.now(timezone.utc)

    db.add(EnquiryEvent(
        enquiry_id=enquiry_id,
        event_type=EventType.escalated,
        description=f"Manually escalated. Reason: {payload.reason}",
    ))

    db.commit()

    logger.warning(
        f"event=escalation_triggered enquiry_id={enquiry_id} "
        f"customer='{enquiry.customer_name}' reason='{payload.reason}'"
    )

    return EscalationResponse(
        enquiry_id=enquiry_id,
        status="escalated",
        message="Enquiry has been escalated to a human agent.",
    )


# ---------------------------------------------------------------------------
# GET /enquiry/{id}/history — Full history + status timeline
# ---------------------------------------------------------------------------

@router.get(
    "/{enquiry_id}/history",
    response_model=EnquiryOut,
    summary="Get full conversation history and status timeline",
    description=(
        "Returns the enquiry record along with every event in the status timeline "
        "in chronological order. Use this to power the conversation detail screen."
    ),
)
async def get_enquiry_history(
    enquiry_id: str = Path(..., description="The enquiry ID to retrieve"),
    db: Session = Depends(get_db),
):
    enquiry = _get_enquiry_or_404(db, enquiry_id)
    logger.info(f"event=history_fetched enquiry_id={enquiry_id}")
    return enquiry


# ---------------------------------------------------------------------------
# Private helper
# ---------------------------------------------------------------------------

def _get_enquiry_or_404(db: Session, enquiry_id: str) -> Enquiry:
    """Fetch an enquiry by ID or raise a clean 404."""
    enquiry = db.query(Enquiry).filter(Enquiry.id == enquiry_id).first()
    if not enquiry:
        raise HTTPException(
            status_code=404,
            detail=f"Enquiry with ID '{enquiry_id}' was not found.",
        )
    return enquiry
