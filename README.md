# Closira — Engineering Intern Assignment

A full-stack implementation of Closira's customer enquiry-handling platform, built as part of the engineering intern assessment.

> **What's included:** A FastAPI backend with async SOP matching + a React Native mobile dashboard — two separate, independently runnable projects in a single repo.

---

## Repository Structure

```
closira/
├── backend/          ← Python + FastAPI REST API + async worker
└── frontend/         ← React Native (Expo) mobile dashboard
```

---

## Quick Start

### Backend (5 minutes)
```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```
API runs at **http://localhost:8000** · Docs at **http://localhost:8000/docs**

### Frontend (5 minutes)
```bash
cd frontend
npm install
npx expo start
```
Scan the QR code with the **Expo Go** app (iOS/Android) or press `w` for browser.

---

---

# Part 1 — Backend

## 1.1 What It Does

The backend simulates Closira's core enquiry pipeline:

1. A customer message arrives via POST `/enquiry` (WhatsApp, email, or call)
2. The API returns a job ID **immediately** — it does not block
3. A background task picks up the enquiry, matches it against 5 hardcoded SOPs using keyword logic, and updates the record
4. If no SOP matches, the enquiry is auto-escalated for human review
5. Business staff can manually follow up, escalate, or read the full history via the other endpoints

## 1.2 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/health` | API and database health check |
| `POST` | `/enquiry/` | Create a new inbound customer enquiry |
| `POST` | `/enquiry/{id}/followup` | Schedule a follow-up (accepts delay in minutes) |
| `POST` | `/enquiry/{id}/escalate` | Manually escalate to a human agent |
| `GET`  | `/enquiry/{id}/history` | Full conversation history + status timeline |

Full interactive docs with example payloads are at `/docs` (Swagger UI) and `/redoc`.

## 1.3 Running the Backend

**Prerequisites:** Python 3.9+

```bash
cd backend

# 1. Create and activate a virtual environment
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Start the server (hot-reloads on file changes)
uvicorn app.main:app --reload

# 4. Open the interactive docs
open http://localhost:8000/docs
```

The SQLite database file (`closira.db`) is created automatically on first startup. Delete it to start fresh.

## 1.4 Testing the API

Open `api_tests.http` in VS Code with the **REST Client** extension and run each request in order.

Or use curl:

```bash
# Health check
curl http://localhost:8000/health

# Create a booking enquiry
curl -X POST http://localhost:8000/enquiry/ \
  -H "Content-Type: application/json" \
  -d '{"customer_name": "Sarah Mitchell", "channel": "whatsapp", "message": "I would like to book an appointment for Monday."}'

# The response includes a job_id — use it in the next commands
# Replace ENQUIRY_ID below with the id from the response above

# Get full history
curl http://localhost:8000/enquiry/ENQUIRY_ID/history

# Schedule a follow-up
curl -X POST http://localhost:8000/enquiry/ENQUIRY_ID/followup \
  -H "Content-Type: application/json" \
  -d '{"delay_minutes": 60}'

# Escalate
curl -X POST http://localhost:8000/enquiry/ENQUIRY_ID/escalate \
  -H "Content-Type: application/json" \
  -d '{"reason": "Customer is requesting a manager."}'
```

## 1.5 Database Schema

**Table: `enquiries`**

| Column | Type | Notes |
|--------|------|-------|
| `id` | TEXT (UUID) | Primary key, auto-generated |
| `customer_name` | TEXT | Required |
| `channel` | ENUM | `whatsapp`, `email`, `call` |
| `message` | TEXT | Raw inbound message |
| `status` | ENUM | `pending` → `processing` → `open` / `escalated` |
| `matched_sop` | TEXT (nullable) | Populated by background task |
| `suggested_response` | TEXT (nullable) | AI-generated response from matched SOP |
| `escalation_reason` | TEXT (nullable) | Set on manual or auto-escalation |
| `followup_due_at` | DATETIME (nullable) | Scheduled follow-up time |
| `followup_message` | TEXT (nullable) | Personalised follow-up message |
| `created_at` | DATETIME | UTC timestamp |
| `updated_at` | DATETIME | Auto-updated on every write |

**Table: `enquiry_events`** *(append-only timeline)*

| Column | Type | Notes |
|--------|------|-------|
| `id` | TEXT (UUID) | Primary key |
| `enquiry_id` | TEXT (FK) | References `enquiries.id` |
| `event_type` | ENUM | `created`, `processing_started`, `sop_matched`, `escalated`, etc. |
| `description` | TEXT | Human-readable description of what happened |
| `created_at` | DATETIME | UTC timestamp |

The events table is intentionally append-only — we never update or delete rows. This gives us a full audit trail and powers the history endpoint without any additional query complexity.

## 1.6 Async Processing: BackgroundTasks vs Celery

**Decision: FastAPI BackgroundTasks**

For this prototype, `BackgroundTasks` is the right tool:

| | BackgroundTasks | Celery |
|---|---|---|
| **Setup** | Zero extra dependencies | Requires Redis/RabbitMQ broker + separate worker process |
| **Visibility** | Task runs in same process | Tasks run in separate worker, visible in Flower dashboard |
| **Persistence** | Lost on server restart | Persists across restarts |
| **Scalability** | Tied to API process | Horizontally scalable |

**When to switch to Celery:** In production, if the API is handling hundreds of concurrent enquiries, or if tasks need retry logic (e.g. external API calls that might fail), Celery is the right call. The SOP matching logic is already isolated in `workers/processor.py` — moving it to a Celery task would require changing only the task invocation in `api/enquiries.py`, not the matching logic itself.

## 1.7 Database Choice: SQLite vs PostgreSQL

**Decision: SQLite**

For a prototype that runs on a single machine with no Docker dependency, SQLite is ideal:
- Zero setup — just a file
- No credentials, no connection strings, no migrations to run
- Easily inspectable with any SQLite browser (DB Browser for SQLite is free)

**In production:** Swap `DATABASE_URL` in `core/database.py` to a Postgres connection string. SQLAlchemy abstracts the driver — nothing else in the codebase changes.

## 1.8 SOP Definitions

Five SOPs are defined in `core/sop_engine.py`:

| SOP | Trigger Keywords |
|-----|-----------------|
| Booking Enquiry | book, schedule, appointment, reserve, availability |
| Pricing Question | price, cost, quote, how much, fee, rates |
| Complaint | complaint, unhappy, issue, problem, refund, angry |
| After-Hours Message | urgent, emergency, asap, tonight, midnight |
| General Info | info, details, service, product, hours, location |

If none match, the enquiry is auto-escalated and flagged for manual review.

## 1.9 Known Limitations / Trade-offs

- **No authentication:** In production, every endpoint would require a bearer token. Skipped here to keep the focus on the pipeline logic.
- **No tenant isolation:** The schema has no `business_id` field. Real Closira would be multi-tenant; adding a `business_id` FK to `enquiries` and filtering every query by it would be the first production change.
- **BackgroundTasks + SQLite threading:** SQLite's write locking can cause occasional delays under concurrent load. Acceptable for a prototype, not for production.
- **SOP matching is naive:** Real Closira would use an LLM or a trained text classifier. The keyword approach is transparent, testable, and easy to swap out.
- **No follow-up scheduler:** The follow-up endpoint stores a `followup_due_at` timestamp but doesn't actually send a message at that time. A Celery beat scheduler or a cron job reading the DB would handle this in production.

---

---

# Part 2 — Frontend

## 2.1 What It Does

A React Native mobile app (built with Expo) that gives a business owner a full view of their Closira activity:

| Screen | Purpose |
|--------|---------|
| **Dashboard** | Stats overview, quick actions, activity feed |
| **Leads** | All inbound leads with filter tabs, tappable cards |
| **Escalations** | Active escalation alerts with resolve action |
| **Follow-ups** | Scheduled follow-up tasks with mark-as-done |
| **Conversation Detail** | Full thread, SOP match, AI summary, status timeline |

## 2.2 Running the Frontend

**Prerequisites:** Node.js 18+, the **Expo Go** app on your phone (free on iOS/Android)

```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Start the Expo dev server
npx expo start

# 3. Scan the QR code in your terminal with:
#    - iOS:     Camera app
#    - Android: Expo Go app
#    - Browser: Press 'w' in the terminal
```

## 2.3 Project Structure

```
frontend/
├── App.js                          ← Root entry point
└── src/
    ├── navigation/
    │   └── AppNavigator.jsx        ← Bottom tab + stack navigator
    ├── screens/
    │   ├── DashboardScreen.jsx
    │   ├── LeadsScreen.jsx
    │   ├── EscalationsScreen.jsx
    │   ├── FollowUpsScreen.jsx
    │   └── ConversationDetailScreen.jsx
    ├── components/
    │   ├── common/
    │   │   ├── ChannelBadge.jsx    ← WhatsApp/Email/Call badge
    │   │   ├── StatusBadge.jsx     ← New/Qualified/Escalated badge
    │   │   └── EmptyState.jsx      ← Empty list placeholder
    │   ├── dashboard/
    │   │   ├── StatCard.jsx        ← Metric card with trend indicator
    │   │   └── ActivityItem.jsx    ← Activity feed row
    │   ├── leads/
    │   │   └── LeadCard.jsx        ← Tappable lead card
    │   ├── escalations/
    │   │   └── EscalationCard.jsx  ← Escalation card with resolve button
    │   └── followups/
    │       └── FollowUpCard.jsx    ← Follow-up task card
    ├── mock/
    │   ├── enquiries.js            ← Realistic mock enquiry data
    │   └── stats.js                ← Mock dashboard stats + activity feed
    └── utils/
        ├── theme.js                ← Design tokens (colours, spacing, fonts)
        └── helpers.js              ← Date formatting, badge config utilities
```

## 2.4 Styling Choice: StyleSheet

**Decision: React Native StyleSheet** (not NativeWind/Tailwind)

Reasons:
- No compiler or additional tooling required — works out of the box with Expo
- Styles are co-located with components, making each file self-contained
- `theme.js` provides the same single-source-of-truth benefit that Tailwind's config would
- StyleSheet.create() gives a minor performance benefit via style ID caching on native

**When NativeWind makes more sense:** Large teams where designers and developers share a Tailwind vocabulary, or projects with heavy responsive design requirements. For a focused prototype, the overhead isn't justified.

## 2.5 Design Decisions

- **Colour system:** Deep navy primary with purple accent, semantic colours for status and channels (green = WhatsApp, blue = email, amber = call)
- **Consistent badges:** `ChannelBadge` and `StatusBadge` are used identically across every screen — changing a badge's colour means changing it in one place
- **Empty states:** Every list has a `<EmptyState>` component with a contextual message — no blank screens
- **Resolve / Mark Done:** Escalation and follow-up cards remove themselves from the list on action, giving immediate visual feedback without a backend round-trip

## 2.6 Mock Data Design

Mock data in `/src/mock/` is structured identically to what the backend API returns — same field names, same date formats, same enum values. This means replacing the mock import with a real `fetch()` call is the only change needed to wire up the real API.

## 2.7 Known Limitations

- **No real API integration:** All data is hardcoded in `/mock`. Adding `useEffect` + `fetch` to each screen would connect to the backend.
- **No authentication:** A login screen and JWT storage would precede this in production.
- **Badge counts are static:** The tab bar badge numbers are derived from mock data at app start and don't update when cards are resolved. A state management solution (Zustand or Context) would fix this.
- **No push notifications:** Expo Notifications would handle real-time escalation alerts in production.

---

---

# Combined: Running Both Together

```bash
# Terminal 1 — start the backend
cd closira/backend
source venv/bin/activate
uvicorn app.main:app --reload

# Terminal 2 — start the frontend
cd closira/frontend
npx expo start
```

The frontend currently uses mock data. To point it at the real backend, replace the mock imports in each screen with `fetch('http://YOUR_LOCAL_IP:8000/...')` calls. Use your machine's local network IP (not `localhost`) so the Expo Go app on your phone can reach it.

---

# Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Backend framework | FastAPI | Modern, fast, excellent DX, auto-docs |
| Database | SQLite + SQLAlchemy | Zero setup, swap-in Postgres for prod |
| Async tasks | FastAPI BackgroundTasks | Sufficient for prototype, no broker needed |
| Validation | Pydantic v2 | First-class FastAPI integration |
| Logging | Custom JSON formatter | Machine-parseable, production-ready format |
| Mobile framework | React Native + Expo | Fast iteration, runs on iOS + Android |
| Navigation | React Navigation v6 | Industry standard for RN |
| Styling | StyleSheet + theme.js | No tooling overhead, consistent tokens |

---

*Questions? Reach out — happy to walk through any decision in more detail.*
