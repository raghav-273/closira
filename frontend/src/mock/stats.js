// mock/stats.js
// Dashboard summary statistics — would come from a /stats or /dashboard
// summary API endpoint in production.

export const MOCK_STATS = {
  total_leads_today: 12,
  missed_enquiries: 3,
  open_escalations: 2,
  followups_due: 4,
  // Percentage change vs yesterday — used for trend indicators
  trends: {
    total_leads_today: +20,    // +20% vs yesterday
    missed_enquiries: -10,     // 10% fewer missed (good)
    open_escalations: +100,    // doubled (bad)
    followups_due: +0,
  },
};

// Activity feed on the dashboard — most recent first
export const MOCK_ACTIVITY = [
  {
    id: "act_001",
    type: "escalation",
    customer_name: "Sarah Mitchell",
    channel: "whatsapp",
    description: "Escalated: refund request",
    time: "2 min ago",
  },
  {
    id: "act_002",
    type: "new_lead",
    customer_name: "Aisha Patel",
    channel: "email",
    description: "New enquiry about business hours",
    time: "8 min ago",
  },
  {
    id: "act_003",
    type: "followup",
    customer_name: "James Okafor",
    channel: "email",
    description: "Follow-up due in 45 minutes",
    time: "14 min ago",
  },
  {
    id: "act_004",
    type: "escalation",
    customer_name: "Daniel Chen",
    channel: "whatsapp",
    description: "Auto-escalated: no SOP match",
    time: "32 min ago",
  },
  {
    id: "act_005",
    type: "new_lead",
    customer_name: "Priya Sharma",
    channel: "call",
    description: "Booking enquiry — SOP matched",
    time: "58 min ago",
  },
];
