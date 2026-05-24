"""
enquiry.py — SQLAlchemy ORM models for the enquiry pipeline.

Two tables:
  - Enquiry      : one row per inbound customer message
  - EnquiryEvent : append-only timeline of everything that happens to an enquiry
                   (created, sop_matched, escalated, follow_up_scheduled, etc.)

Keeping events in a separate table makes the history endpoint trivial and gives
us a full audit trail without mutating the main record.
"""

from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
import enum
import uuid

from app.core.database import Base


# ---------------------------------------------------------------------------
# Enums — stored as strings in SQLite so they're human-readable in the DB file
# ---------------------------------------------------------------------------

class Channel(str, enum.Enum):
    whatsapp = "whatsapp"
    email = "email"
    call = "call"


class EnquiryStatus(str, enum.Enum):
    pending    = "pending"     # just created, background task hasn't run yet
    processing = "processing"  # background task is running
    open       = "open"        # SOP matched, response suggested, waiting on customer
    escalated  = "escalated"   # handed off to a human agent
    resolved   = "resolved"    # closed out


class EventType(str, enum.Enum):
    created            = "created"
    processing_started = "processing_started"
    sop_matched        = "sop_matched"
    escalated          = "escalated"
    follow_up_scheduled = "follow_up_scheduled"
    resolved           = "resolved"
    note               = "note"


# ---------------------------------------------------------------------------
# Enquiry table
# ---------------------------------------------------------------------------

class Enquiry(Base):
    __tablename__ = "enquiries"

    id               = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    customer_name    = Column(String(120), nullable=False)
    channel          = Column(Enum(Channel), nullable=False)
    message          = Column(Text, nullable=False)
    status           = Column(Enum(EnquiryStatus), default=EnquiryStatus.pending, nullable=False)

    # Populated by the background task after SOP matching
    matched_sop      = Column(String(80), nullable=True)
    suggested_response = Column(Text, nullable=True)

    # Set when the enquiry is escalated
    escalation_reason = Column(Text, nullable=True)

    # Follow-up fields
    followup_due_at  = Column(DateTime(timezone=True), nullable=True)
    followup_message = Column(Text, nullable=True)

    created_at       = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at       = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
                              onupdate=lambda: datetime.now(timezone.utc))

    # One enquiry has many timeline events
    events = relationship("EnquiryEvent", back_populates="enquiry",
                          order_by="EnquiryEvent.created_at", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Enquiry id={self.id} customer={self.customer_name} status={self.status}>"


# ---------------------------------------------------------------------------
# EnquiryEvent table — immutable timeline entries
# ---------------------------------------------------------------------------

class EnquiryEvent(Base):
    __tablename__ = "enquiry_events"

    id          = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    enquiry_id  = Column(String, ForeignKey("enquiries.id"), nullable=False)
    event_type  = Column(Enum(EventType), nullable=False)
    description = Column(Text, nullable=False)
    created_at  = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    enquiry = relationship("Enquiry", back_populates="events")

    def __repr__(self):
        return f"<EnquiryEvent type={self.event_type} enquiry_id={self.enquiry_id}>"
