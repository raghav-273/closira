"""
sop_engine.py — Keyword-based SOP (Standard Operating Procedure) matcher.

In a real Closira deployment this would call an LLM or a trained classifier.
For this prototype we use keyword matching — simple, transparent, and easy
to extend. The logic lives here (not in the background task) so it can be
unit-tested independently.

SOPs defined:
  1. Booking Enquiry    — customer wants to book / schedule / reserve
  2. Pricing Question   — customer asking about cost / price / quote
  3. Complaint          — customer expressing unhappiness / issue / problem
  4. After-Hours        — message received outside business hours
  5. General Info       — product / service / details / hours questions
"""

from __future__ import annotations

import re
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Optional


@dataclass
class SOPResult:
    matched: bool
    sop_name: Optional[str]
    suggested_response: Optional[str]


# ---------------------------------------------------------------------------
# SOP definitions — each entry has a name, keywords, and a canned response
# ---------------------------------------------------------------------------
SOPS = [
    {
        "name": "Booking Enquiry",
        "keywords": ["book", "booking", "schedule", "appointment", "reserve", "reservation", "slot", "availability", "available"],
        "response": (
            "Hi! Thanks for reaching out. We'd love to help you book an appointment. "
            "Could you let us know your preferred date and time? We'll confirm availability right away."
        ),
    },
    {
        "name": "Pricing Question",
        "keywords": ["price", "pricing", "cost", "how much", "quote", "charges", "fee", "rates", "rate", "budget", "expensive", "cheap"],
        "response": (
            "Thanks for your interest! Our pricing depends on the specific service you need. "
            "Could you share a few more details so we can send you an accurate quote?"
        ),
    },
    {
        "name": "Complaint",
        "keywords": ["complaint", "unhappy", "disappointed", "issue", "problem", "wrong", "bad", "terrible", "worst", "refund", "broken", "not working", "angry", "frustrated"],
        "response": (
            "We're really sorry to hear about your experience — that's not the standard we hold ourselves to. "
            "A member of our team will reach out to you within the hour to make this right."
        ),
    },
    {
        "name": "After-Hours Message",
        "keywords": ["urgent", "emergency", "asap", "immediately", "right now", "tonight", "midnight", "late night"],
        "response": (
            "Thanks for getting in touch. Our team is currently outside business hours (9 AM – 6 PM). "
            "We've logged your message and will respond first thing tomorrow morning."
        ),
    },
    {
        "name": "General Info",
        "keywords": ["info", "information", "details", "tell me", "what is", "how does", "service", "product", "hours", "location", "address", "offer", "provide"],
        "response": (
            "Thanks for reaching out! We're happy to help with any questions about our services. "
            "Could you be a bit more specific about what you'd like to know? We'll get back to you shortly."
        ),
    },
]


def match_sop(message: str) -> SOPResult:
    """
    Scan the inbound message for keyword matches against each SOP definition.
    Returns the first match found, or a no-match result if nothing fits.

    We normalise to lowercase and strip punctuation before matching so that
    "Booking??" still hits the Booking SOP.
    """
    normalised = re.sub(r"[^\w\s]", "", message.lower())

    for sop in SOPS:
        for keyword in sop["keywords"]:
            if keyword in normalised:
                return SOPResult(
                    matched=True,
                    sop_name=sop["name"],
                    suggested_response=sop["response"],
                )

    # No SOP matched — this needs a human to look at it
    return SOPResult(matched=False, sop_name=None, suggested_response=None)


def is_after_hours(dt: Optional[datetime] = None) -> bool:
    """Returns True if the given time (defaults to now) is outside 9 AM – 6 PM UTC."""
    if dt is None:
        dt = datetime.now(timezone.utc)
    return dt.hour < 9 or dt.hour >= 18
