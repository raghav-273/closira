"""
health.py — Simple health check endpoint.

Returns API status and whether the database is reachable.
Useful for container health checks and uptime monitors.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.core.database import get_db
from app.core.logger import get_logger

router = APIRouter()
logger = get_logger(__name__)


@router.get(
    "/health",
    summary="API health check",
    description="Returns API status and database connectivity. Use this for uptime monitoring.",
    response_description="Health status of the API and its dependencies.",
)
async def health_check(db: Session = Depends(get_db)):
    """Check that the API is up and the database is reachable."""
    db_status = "ok"
    db_detail = None

    try:
        # A lightweight query that works on both SQLite and PostgreSQL
        db.execute(text("SELECT 1"))
    except Exception as e:
        db_status = "error"
        db_detail = str(e)
        logger.error(f"event=health_check_failed db_error={str(e)}")

    return {
        "api": "ok",
        "database": db_status,
        "database_detail": db_detail,
        "version": "1.0.0",
    }
