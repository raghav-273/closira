<div align="center">

<img src="https://img.shields.io/badge/Closira-Enquiry%20Platform-6C63FF?style=for-the-badge&logoColor=white" alt="Closira" />

<h3>AI-Powered Customer Enquiry Handling — Full Stack Internship Assignment</h3>

<p>A production-inspired backend API and mobile dashboard built for Closira's SMB communication platform.</p>

<p>
  <img src="https://img.shields.io/badge/Python-3.9+-3776AB?style=flat-square&logo=python&logoColor=white" />
  <img src="https://img.shields.io/badge/FastAPI-0.111-009688?style=flat-square&logo=fastapi&logoColor=white" />
  <img src="https://img.shields.io/badge/SQLAlchemy-2.0-D71F00?style=flat-square&logo=sqlalchemy&logoColor=white" />
  <img src="https://img.shields.io/badge/React_Native-0.74-61DAFB?style=flat-square&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Expo-51-000020?style=flat-square&logo=expo&logoColor=white" />
  <img src="https://img.shields.io/badge/SQLite-embedded-003B57?style=flat-square&logo=sqlite&logoColor=white" />
</p>

<p>
  <img src="https://img.shields.io/badge/Backend-REST%20API%20%2B%20Async%20Worker-success?style=flat-square" />
  <img src="https://img.shields.io/badge/Frontend-Mobile%20Dashboard-blueviolet?style=flat-square" />
  <img src="https://img.shields.io/badge/Docs-Swagger%20UI-85EA2D?style=flat-square&logo=swagger&logoColor=black" />
</p>

</div>

---

## What This Is

Closira is an AI-powered communication platform that handles inbound customer enquiries across WhatsApp, email, and phone for small and medium businesses.

This repository contains two fully working projects built as part of the engineering intern assessment:

- **Backend** — A FastAPI REST API that receives inbound enquiries, matches them against SOPs asynchronously using a background worker, and exposes status and history endpoints.
- **Frontend** — A React Native mobile dashboard (built with Expo) where business owners monitor conversations, manage escalations, and track follow-ups.

Both are independently runnable. No Docker. No external services. Works out of the box.

---

## Repository Structure

```
closira/
├── backend/                        # Python + FastAPI
│   ├── app/
│   │   ├── api/
│   │   │   ├── enquiries.py        # All 4 enquiry endpoints
│   │   │   └── health.py           # Health check endpoint
│   │   ├── core/
│   │   │   ├── database.py         # SQLAlchemy engine + session factory
│   │   │   ├── logger.py           # Structured JSON logger
│   │   │   └── sop_engine.py       # Keyword-based SOP matcher
│   │   ├── models/
│   │   │   └── enquiry.py          # ORM models (Enquiry + EnquiryEvent)
│   │   ├── schemas/
│   │   │   └── enquiry.py          # Pydantic request/response schemas
│   │   ├── workers/
│   │   │   └── processor.py        # Async background task
│   │   └── main.py                 # App entry point, middleware, routers
│   ├── api_tests.http              # VS Code REST Client test file
│   └── requirements.txt
│
└── frontend/                       # React Native + Expo
    ├── src/
    │   ├── components/
    │   │   ├── common/             # ChannelBadge, StatusBadge, EmptyState
    │   │   ├── dashboard/          # StatCard, ActivityItem
    │   │   ├── leads/              # LeadCard
    │   │   ├── escalations/        # EscalationCard
    │   │   └── followups/          # FollowUpCard
    │   ├── screens/                # 5 screens
    │   ├── navigation/             # Bottom tab + stack navigator
    │   ├── mock/                   # Realistic mock data (API-ready structure)
    │   └── utils/                  # theme.js (design tokens) + helpers.js
    ├── App.js
    └── package.json
```

---

## Backend

### Running Locally

> **Requires:** Python 3.9+

```bash
cd backend

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the server (hot-reloads on file save)
uvicorn app.main:app --reload
```

The server starts at **http://localhost:8000**

Interactive API docs (Swagger UI): **http://localhost:8000/docs**

The SQLite database file (`closira.db`) is created automatically on first startup. Delete it to reset all data.

---

### API Endpoints

| Method | Endpoint | Status | Description |
|--------|----------|--------|-------------|
| `GET` | `/health` | `200` | API and database health check |
| `POST` | `/enquiry/` | `202` | Create a new inbound customer enquiry |
| `POST` | `/enquiry/{id}/followup` | `200` | Schedule a follow-up (accepts delay in minutes) |
| `POST` | `/enquiry/{id}/escalate` | `200` | Escalate to a human agent with reason |
| `GET` | `/enquiry/{id}/history` | `200` | Full conversation history and status timeline |

All endpoints return meaningful HTTP status codes. Bad input returns `422` with a clear message. Missing records return `404`. Nothing unhandled reaches the client.

---

### How the Pipeline Works

```
Customer Message
      │
      ▼
POST /enquiry/  ──── returns job_id immediately (202 Accepted)
      │
      ▼
Background Task starts (FastAPI BackgroundTasks)
      │
      ├── Opens its own DB session
      ├── Sets status = "processing"
      ├── Runs SOP keyword matcher against message
      │
      ├── Match found?
      │     ├── YES → sets matched_sop + suggested_response, status = "open"
      │     └── NO  → auto-escalates, status = "escalated"
      │
      └── Logs every state change as an immutable EnquiryEvent
```

---

### SOP Matching Engine

The SOP engine (`core/sop_engine.py`) matches inbound messages against 5 predefined Standard Operating Procedures using keyword detection. Messages are normalised (lowercased, punctuation stripped) before matching, so `"Booking??"` and `"booking"` both trigger the same SOP.

| SOP | Trigger Keywords |
|-----|-----------------|
| Booking Enquiry | book, schedule, appointment, reserve, availability, slot |
| Pricing Question | price, cost, quote, how much, fee, rates, budget |
| Complaint | complaint, unhappy, issue, problem, refund, angry, frustrated |
| After-Hours Message | urgent, emergency, asap, tonight, midnight |
| General Info | info, details, service, product, hours, location, address |

If no SOP matches, the enquiry is automatically escalated for human review and logged accordingly.

In a production system this would be replaced with an LLM call or a trained text classifier. The engine is isolated in its own module precisely so it can be swapped without touching any other file.

---

### Database Schema

Two tables. Both use UUID primary keys.

**`enquiries`** — one row per inbound message

| Column | Type | Notes |
|--------|------|-------|
| `id` | TEXT (UUID) | Primary key, auto-generated |
| `customer_name` | TEXT | Max 120 chars |
| `channel` | ENUM | `whatsapp` · `email` · `call` |
| `message` | TEXT | Raw inbound message |
| `status` | ENUM | `pending` → `processing` → `open` / `escalated` / `resolved` |
| `matched_sop` | TEXT | Set by background task, nullable |
| `suggested_response` | TEXT | Canned response for matched SOP, nullable |
| `escalation_reason` | TEXT | Set on manual or auto-escalation, nullable |
| `followup_due_at` | DATETIME | UTC, nullable |
| `followup_message` | TEXT | Personalised message, nullable |
| `created_at` | DATETIME | UTC, set on insert |
| `updated_at` | DATETIME | UTC, auto-updated on every write |

**`enquiry_events`** — append-only status timeline

| Column | Type | Notes |
|--------|------|-------|
| `id` | TEXT (UUID) | Primary key |
| `enquiry_id` | TEXT (FK) | References `enquiries.id` |
| `event_type` | ENUM | `created` · `processing_started` · `sop_matched` · `escalated` · `follow_up_scheduled` · `resolved` |
| `description` | TEXT | Human-readable description |
| `created_at` | DATETIME | UTC, set on insert |

The events table is intentionally immutable — rows are only ever inserted, never updated or deleted. This gives a complete audit trail without any extra query complexity and directly powers the `/history` endpoint.

---

### Design Decisions & Trade-offs

**BackgroundTasks vs Celery**

I chose FastAPI's built-in `BackgroundTasks` over Celery for this prototype. Celery requires a running Redis or RabbitMQ broker, a separate worker process, and meaningful configuration overhead — none of which is justified for a single-machine prototype.

The trade-off is persistence: if the server restarts while a task is running, the task is lost. In production, Celery + Redis would be the right call. The processing logic is fully isolated in `workers/processor.py`, so migrating to Celery later means changing exactly one line in the router.

The background task opens its own `SessionLocal()` database session rather than reusing the request-scoped one. The request session is closed the moment the HTTP response is sent — reusing it would raise a `DetachedInstanceError`. This was a real bug found and fixed during development.

**SQLite vs PostgreSQL**

SQLite for the prototype. Zero setup, no credentials, works everywhere, and the single file is easy to inspect or reset. The `DATABASE_URL` in `core/database.py` is the only thing that changes when moving to Postgres — SQLAlchemy abstracts the rest.

**Structured JSON logging**

Every key event emits a JSON log line to stdout. JSON logs are grep-friendly, parseable by `jq`, and ingestible by any log aggregator (Datadog, CloudWatch, etc.) without parsing rules. Plain-text logs don't survive at scale.

---

### Testing the API

Open `api_tests.http` in VS Code with the [REST Client extension](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) and run each request in sequence. Or use curl:

```bash
# 1. Health check
curl http://localhost:8000/health

# 2. Create a booking enquiry
curl -X POST http://localhost:8000/enquiry/ \
  -H "Content-Type: application/json" \
  -d '{"customer_name": "Sarah Mitchell", "channel": "whatsapp", "message": "I would like to book an appointment for Monday morning."}'
# → returns job_id immediately

# 3. Fetch history (replace with actual job_id)
curl http://localhost:8000/enquiry/{job_id}/history
# → shows SOP matched, status = open

# 4. Schedule a follow-up
curl -X POST http://localhost:8000/enquiry/{job_id}/followup \
  -H "Content-Type: application/json" \
  -d '{"delay_minutes": 60, "message_template": "Hi {name}, just following up!"}'

# 5. Escalate
curl -X POST http://localhost:8000/enquiry/{job_id}/escalate \
  -H "Content-Type: application/json" \
  -d '{"reason": "Customer requested a manager."}'
```

---

## Frontend

### Running Locally

> **Requires:** Node.js 18+ and the [Expo Go](https://expo.dev/go) app on your phone

```bash
cd frontend
npm install
npx expo start
```

Scan the QR code in your terminal with the Expo Go app (iOS or Android). The app loads in about 30 seconds.

**No phone?** Press `w` after starting — opens a web version in your browser.

---

### Screens

| Screen | Description |
|--------|-------------|
| **Dashboard** | Summary stats (leads, missed, escalations, follow-ups due), quick action buttons, live activity feed |
| **Leads** | All inbound leads with filter tabs (All / New / Qualified / Escalated), channel badges, tappable cards |
| **Escalations** | Active escalation alerts with urgency indicator and per-card resolve button |
| **Follow-ups** | Scheduled follow-up tasks sorted by due time, with mark-as-done action |
| **Conversation Detail** | Full message thread, SOP match label, suggested response, status timeline — opens as stack screen from Leads or Escalations |

Navigation is a bottom tab navigator (Home · Leads · Escalations · Follow-ups) with badge counts on the Escalations and Follow-ups tabs. Conversation Detail slides in as a stack screen on top.

---

### Component Architecture

Every section of the UI is a standalone reusable component. No monolithic screen files. Screens are thin — they hold state and pass data down; components own rendering.

```
components/
├── common/
│   ├── ChannelBadge      WhatsApp (green) · Email (blue) · Call (amber)
│   ├── StatusBadge       New (blue) · Qualified (green) · Escalated (red)
│   └── EmptyState        Contextual empty list placeholder (no blank screens)
├── dashboard/
│   ├── StatCard          Metric card with value, icon, trend indicator
│   └── ActivityItem      Single row in the activity feed
├── leads/
│   └── LeadCard          Tappable card with avatar, status, SOP tag, message preview
├── escalations/
│   └── EscalationCard    Urgency strip, reason box, resolve button
└── followups/
    └── FollowUpCard      Due time indicator, message preview, mark-as-done
```

Channel and status colours are defined once in `utils/theme.js` and consumed via `utils/helpers.js`. Changing a colour updates every screen simultaneously.

---

### Mock Data

All mock data lives in `src/mock/` and is structured identically to what the backend API returns — same field names, same date formats (ISO 8601 UTC), same enum values. Replacing a mock import with a real `fetch()` call is the only change needed to wire up the live API. This was a deliberate choice to demonstrate API-readiness thinking.

---

### Styling

React Native `StyleSheet` with a centralised design token file (`utils/theme.js`). All colours, font sizes, spacing values, border radii, and shadows are defined there and nowhere else.

I chose StyleSheet over NativeWind because it requires no compiler, works out of the box with Expo, and the token file provides the same single-source-of-truth benefit that Tailwind's config would. For a prototype with one developer, the trade-off is clearly in favour of fewer moving parts.

---

## Known Limitations

These are acknowledged trade-offs, not oversights.

| Limitation | Production Fix |
|-----------|----------------|
| No authentication | JWT bearer tokens on every endpoint; login screen in the app |
| No tenant isolation | Add `business_id` FK to `enquiries`, filter every query by it |
| Follow-up scheduler stores the time but doesn't send | Celery Beat job polling `followup_due_at` on a schedule |
| Frontend uses mock data | Replace mock imports with `fetch()` calls to the backend |
| BackgroundTasks lost on server restart | Celery + Redis for persistent task queue |
| SOP matching is keyword-based | Replace `sop_engine.py` with an LLM call or trained classifier |

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| API Framework | FastAPI | 0.111 |
| Server | Uvicorn | 0.29 |
| ORM | SQLAlchemy | 2.0 |
| Validation | Pydantic | 2.7 |
| Database | SQLite (dev) / PostgreSQL (prod) | — |
| Async Tasks | FastAPI BackgroundTasks | built-in |
| Mobile Framework | React Native + Expo | 0.74 / SDK 51 |
| Navigation | React Navigation | v6 |
| Styling | StyleSheet + design tokens | built-in |

---

<div align="center">
<sub>Built as part of the Closira Engineering Intern Assessment · Full-stack submission (Backend + Frontend)</sub>
</div>
