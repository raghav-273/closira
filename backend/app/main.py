"""
main.py — Entry point for the Closira backend API.

Spins up the FastAPI app, registers all routers, sets up the database
on startup, and wires in structured JSON logging for every request.
"""

import time
import uuid
import logging

from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.logger import get_logger
from app.core.database import init_db
from app.api import enquiries, health

logger = get_logger(__name__)


# ---------------------------------------------------------------------------
# Lifespan: runs once on startup and once on shutdown
# ---------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize the database tables before the server starts accepting traffic."""
    logger.info("event=startup message='Closira API is starting up'")
    init_db()
    yield
    logger.info("event=shutdown message='Closira API is shutting down'")


# ---------------------------------------------------------------------------
# App instance
# ---------------------------------------------------------------------------
app = FastAPI(
    title="Closira Enquiry API",
    description=(
        "Backend service that handles inbound customer enquiries for Closira. "
        "Supports async SOP matching, follow-up scheduling, escalations, and "
        "conversation history — all in one lightweight FastAPI service."
    ),
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# Allow requests from the React Native dev server and any local tooling
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Request-ID middleware — every request gets a trace ID for easy log grepping
# ---------------------------------------------------------------------------
@app.middleware("http")
async def attach_request_id(request: Request, call_next):
    request_id = str(uuid.uuid4())[:8]
    start = time.time()

    response = await call_next(request)

    duration_ms = round((time.time() - start) * 1000, 2)
    logger.info(
        f"event=request request_id={request_id} "
        f"method={request.method} path={request.url.path} "
        f"status={response.status_code} duration_ms={duration_ms}"
    )

    response.headers["X-Request-ID"] = request_id
    return response


# ---------------------------------------------------------------------------
# Global exception handler — nothing unhandled should reach the client
# ---------------------------------------------------------------------------
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"event=unhandled_exception path={request.url.path} error={str(exc)}")
    return JSONResponse(
        status_code=500,
        content={"detail": "An unexpected error occurred. Please try again later."},
    )


# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------
app.include_router(health.router, tags=["Health"])
app.include_router(enquiries.router, prefix="/enquiry", tags=["Enquiries"])
