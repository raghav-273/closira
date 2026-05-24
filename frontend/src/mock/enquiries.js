// mock/enquiries.js
// Realistic mock data structured exactly as the backend API would return it.
// Field names match the Enquiry ORM model so swapping to real API calls
// later is just replacing the import path — nothing else changes.

export const MOCK_ENQUIRIES = [
  {
    id: "enq_001",
    customer_name: "Sarah Mitchell",
    channel: "whatsapp",
    status: "escalated",
    message: "Hi, I placed an order last week and it still hasn't arrived. This is really unacceptable and I want a refund immediately.",
    matched_sop: "Complaint",
    suggested_response: "We're really sorry to hear about your experience. A team member will reach out within the hour.",
    escalation_reason: "Customer requested refund and is highly dissatisfied.",
    followup_due_at: null,
    followup_message: null,
    created_at: "2025-05-20T09:14:00Z",
    updated_at: "2025-05-20T09:15:30Z",
    events: [
      { id: "evt_001a", event_type: "created", description: "Enquiry received via whatsapp from Sarah Mitchell.", created_at: "2025-05-20T09:14:00Z" },
      { id: "evt_001b", event_type: "processing_started", description: "Background worker picked up the enquiry.", created_at: "2025-05-20T09:14:01Z" },
      { id: "evt_001c", event_type: "sop_matched", description: "SOP matched: 'Complaint'. Suggested response generated.", created_at: "2025-05-20T09:14:02Z" },
      { id: "evt_001d", event_type: "escalated", description: "Manually escalated. Reason: Customer requested refund and is highly dissatisfied.", created_at: "2025-05-20T09:15:30Z" },
    ],
  },
  {
    id: "enq_002",
    customer_name: "James Okafor",
    channel: "email",
    status: "open",
    message: "Hello, could you send me a quote for your premium package? I want to understand the pricing before committing.",
    matched_sop: "Pricing Question",
    suggested_response: "Thanks for your interest! Our pricing depends on the specific service. Could you share more details so we can send an accurate quote?",
    escalation_reason: null,
    followup_due_at: "2025-05-20T11:00:00Z",
    followup_message: "Hi James, just following up on your pricing enquiry — can we help further?",
    created_at: "2025-05-20T08:45:00Z",
    updated_at: "2025-05-20T08:46:10Z",
    events: [
      { id: "evt_002a", event_type: "created", description: "Enquiry received via email from James Okafor.", created_at: "2025-05-20T08:45:00Z" },
      { id: "evt_002b", event_type: "processing_started", description: "Background worker picked up the enquiry.", created_at: "2025-05-20T08:45:01Z" },
      { id: "evt_002c", event_type: "sop_matched", description: "SOP matched: 'Pricing Question'. Suggested response generated.", created_at: "2025-05-20T08:45:02Z" },
      { id: "evt_002d", event_type: "follow_up_scheduled", description: "Follow-up scheduled for 2025-05-20T11:00:00Z (60 minutes from now).", created_at: "2025-05-20T08:46:10Z" },
    ],
  },
  {
    id: "enq_003",
    customer_name: "Priya Sharma",
    channel: "call",
    status: "open",
    message: "Hi, I'd like to book an appointment for next Monday morning if there's a slot available.",
    matched_sop: "Booking Enquiry",
    suggested_response: "We'd love to help you book! Could you let us know your preferred time? We'll confirm availability right away.",
    escalation_reason: null,
    followup_due_at: null,
    followup_message: null,
    created_at: "2025-05-20T10:02:00Z",
    updated_at: "2025-05-20T10:02:45Z",
    events: [
      { id: "evt_003a", event_type: "created", description: "Enquiry received via call from Priya Sharma.", created_at: "2025-05-20T10:02:00Z" },
      { id: "evt_003b", event_type: "processing_started", description: "Background worker picked up the enquiry.", created_at: "2025-05-20T10:02:01Z" },
      { id: "evt_003c", event_type: "sop_matched", description: "SOP matched: 'Booking Enquiry'. Suggested response generated.", created_at: "2025-05-20T10:02:02Z" },
    ],
  },
  {
    id: "enq_004",
    customer_name: "Daniel Chen",
    channel: "whatsapp",
    status: "escalated",
    message: "Can someone call me back? I've been waiting for 3 days and nobody has responded. This is a waste of time.",
    matched_sop: null,
    suggested_response: null,
    escalation_reason: "No SOP matched the inbound message. Manual review required.",
    followup_due_at: null,
    followup_message: null,
    created_at: "2025-05-20T07:30:00Z",
    updated_at: "2025-05-20T07:30:05Z",
    events: [
      { id: "evt_004a", event_type: "created", description: "Enquiry received via whatsapp from Daniel Chen.", created_at: "2025-05-20T07:30:00Z" },
      { id: "evt_004b", event_type: "processing_started", description: "Background worker picked up the enquiry.", created_at: "2025-05-20T07:30:01Z" },
      { id: "evt_004c", event_type: "escalated", description: "No SOP matched. Enquiry auto-escalated for human review.", created_at: "2025-05-20T07:30:05Z" },
    ],
  },
  {
    id: "enq_005",
    customer_name: "Aisha Patel",
    channel: "email",
    status: "pending",
    message: "Hello! What are your business hours and do you have a physical store location I can visit?",
    matched_sop: null,
    suggested_response: null,
    escalation_reason: null,
    followup_due_at: null,
    followup_message: null,
    created_at: "2025-05-20T10:55:00Z",
    updated_at: "2025-05-20T10:55:00Z",
    events: [
      { id: "evt_005a", event_type: "created", description: "Enquiry received via email from Aisha Patel.", created_at: "2025-05-20T10:55:00Z" },
    ],
  },
];

// Quick-access derived lists — same data, different filters
export const ESCALATED_ENQUIRIES = MOCK_ENQUIRIES.filter(e => e.status === "escalated");
export const OPEN_ENQUIRIES = MOCK_ENQUIRIES.filter(e => e.status === "open");
export const PENDING_ENQUIRIES = MOCK_ENQUIRIES.filter(e => e.status === "pending");
export const ENQUIRIES_WITH_FOLLOWUP = MOCK_ENQUIRIES.filter(e => e.followup_due_at !== null);
