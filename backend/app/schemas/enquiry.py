"""
schemas.py — Pydantic models that define the shape of every API request and response.

Keeping schemas separate from ORM models is a deliberate choice:
  - ORM models own persistence logic
  - Pydantic schemas own validation and serialisation
  - This separation makes it easy to evolve the DB schema without breaking the API contract
"""

from __future__ import annotations

from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Enquiry — create
# ---------------------------------------------------------------------------

class EnquiryCreate(BaseModel):
    customer_name: str = Field(
        ...,
        min_length=1,
        max_length=120,
        examples=["Sarah Mitchell"],
        description="Full name of the customer submitting the enquiry.",
    )
    channel: str = Field(
        ...,
        examples=["whatsapp"],
        description="Inbound channel. One of: whatsapp, email, call.",
    )
    message: str = Field(
        ...,
        min_length=1,
        examples=["Hi, I'd like to book an appointment for next Monday if possible."],
        description="The raw message text from the customer.",
    )

    model_config = {
        "json_schema_extra": {
            "example": {
                "customer_name": "Sarah Mitchell",
                "channel": "whatsapp",
                "message": "Hi, I'd like to book an appointment for next Monday if possible.",
            }
        }
    }


class EnquiryCreateResponse(BaseModel):
    job_id: str = Field(..., description="Use this ID to track the enquiry through the system.")
    message: str
    status: str


# ---------------------------------------------------------------------------
# Follow-up — schedule
# ---------------------------------------------------------------------------

class FollowUpRequest(BaseModel):
    delay_minutes: int = Field(
        ...,
        ge=1,
        le=10080,  # max 1 week
        examples=[60],
        description="How many minutes from now to schedule the follow-up.",
    )
    message_template: Optional[str] = Field(
        None,
        examples=["Hi {name}, just following up on your recent enquiry. Can we help further?"],
        description="Optional message template. Use {name} as a placeholder for customer name.",
    )

    model_config = {
        "json_schema_extra": {
            "example": {
                "delay_minutes": 60,
                "message_template": "Hi {name}, just following up — can we assist further?",
            }
        }
    }


class FollowUpResponse(BaseModel):
    enquiry_id: str
    follow_up_due_at: datetime
    message: str


# ---------------------------------------------------------------------------
# Escalation
# ---------------------------------------------------------------------------

class EscalationRequest(BaseModel):
    reason: str = Field(
        ...,
        min_length=3,
        examples=["Customer is very angry and requesting a manager urgently."],
        description="Why this enquiry is being escalated to a human agent.",
    )

    model_config = {
        "json_schema_extra": {
            "example": {
                "reason": "Customer is very angry and requesting a manager urgently."
            }
        }
    }


class EscalationResponse(BaseModel):
    enquiry_id: str
    status: str
    message: str


# ---------------------------------------------------------------------------
# History — read
# ---------------------------------------------------------------------------

class EventOut(BaseModel):
    id: str
    event_type: str
    description: str
    created_at: datetime

    model_config = {"from_attributes": True}


class EnquiryOut(BaseModel):
    id: str
    customer_name: str
    channel: str
    message: str
    status: str
    matched_sop: Optional[str]
    suggested_response: Optional[str]
    escalation_reason: Optional[str]
    followup_due_at: Optional[datetime]
    followup_message: Optional[str]
    created_at: datetime
    updated_at: datetime
    events: List[EventOut] = []

    model_config = {"from_attributes": True}
