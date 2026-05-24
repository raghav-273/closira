"""
processor.py — Async background worker that processes new enquiries.

Why FastAPI BackgroundTasks over Celery?
  - This is a prototype; Celery would require a Redis/RabbitMQ broker,
    a separate worker process, and ~50 lines of boilerplate just to start.
  - FastAPI BackgroundTasks runs in the same process, needs zero extra infra,
    and is plenty for this prototype's throughput.
  - Trade-off: if the server restarts mid-task, the task is lost. In production,
    Celery + Redis would be the right call — documented in the README.

The task flow:
  1. Open a fresh DB session (never reuse the request session — it's already closed)
  2. Mark enquiry as "processing"
  3. Run SOP keyword matcher
  3a. Match found  → update record with SOP + suggested response, set status = open
  3b. No match     → auto-escalate and log the event
"""

import time
from datetime import datetime, timezone

from app.core.database import SessionLocal
from app.core.logger import get_logger
from app.core.sop_engine import match_sop
from app.models.enquiry import Enquiry, EnquiryEvent, EnquiryStatus, EventType

logger = get_logger(__name__)


def process_enquiry(enquiry_id: str) -> None:
    """
    Main background task. Called immediately after POST /enquiry returns.
    Opens its own DB session — the request-scoped session is already closed
    by the time this runs, so reusing it would cause DetachedInstanceError.
    """
    logger.info(f"event=processing_started enquiry_id={enquiry_id}")

    # Brief pause so callers polling /history can observe the pending state
    time.sleep(1)

    db = SessionLocal()
    try:
        # ------------------------------------------------------------------ #
        # 1. Fetch the enquiry                                                #
        # ------------------------------------------------------------------ #
        enquiry: Enquiry = db.query(Enquiry).filter(Enquiry.id == enquiry_id).first()

        if not enquiry:
            logger.error(f"event=enquiry_not_found enquiry_id={enquiry_id}")
            return

        # Mark as in-progress
        enquiry.status = EnquiryStatus.processing
        _add_event(db, enquiry_id, EventType.processing_started,
                   "Background worker picked up the enquiry.")
        db.commit()

        # ------------------------------------------------------------------ #
        # 2. Run the SOP matcher                                              #
        # ------------------------------------------------------------------ #
        result = match_sop(enquiry.message)

        if result.matched:
            # Happy path — we know how to handle this
            enquiry.matched_sop = result.sop_name
            enquiry.suggested_response = result.suggested_response
            enquiry.status = EnquiryStatus.open
            enquiry.updated_at = datetime.now(timezone.utc)

            _add_event(
                db, enquiry_id, EventType.sop_matched,
                f"SOP matched: '{result.sop_name}'. Suggested response generated.",
            )

            logger.info(
                f"event=sop_matched enquiry_id={enquiry_id} "
                f"sop='{result.sop_name}' customer='{enquiry.customer_name}'"
            )

        else:
            # No SOP match — auto-escalate so a human can review
            enquiry.status = EnquiryStatus.escalated
            enquiry.escalation_reason = "No SOP matched the inbound message. Manual review required."
            enquiry.updated_at = datetime.now(timezone.utc)

            _add_event(
                db, enquiry_id, EventType.escalated,
                "No SOP matched. Enquiry auto-escalated for human review.",
            )

            logger.warning(
                f"event=auto_escalated enquiry_id={enquiry_id} "
                f"customer='{enquiry.customer_name}' "
                f"message_preview='{enquiry.message[:60]}'"
            )

        db.commit()
        logger.info(
            f"event=processing_complete enquiry_id={enquiry_id} "
            f"final_status={enquiry.status}"
        )

    except Exception as exc:
        logger.error(
            f"event=processing_error enquiry_id={enquiry_id} error={str(exc)}"
        )
        db.rollback()
    finally:
        db.close()


# ---------------------------------------------------------------------------
# Private helper
# ---------------------------------------------------------------------------

def _add_event(db, enquiry_id: str, event_type: EventType, description: str) -> None:
    """Append an immutable timeline event. Caller commits the session."""
    event = EnquiryEvent(
        enquiry_id=enquiry_id,
        event_type=event_type,
        description=description,
    )
    db.add(event)
