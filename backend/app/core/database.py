"""
database.py — Database connection and session management.

Using SQLite here because this is a self-contained prototype — no Docker,
no Postgres setup, just a single file that works anywhere. In production
you'd swap the DATABASE_URL for a real Postgres connection string and
nothing else in the codebase needs to change (SQLAlchemy handles it).
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# SQLite file sits in the backend root so it's easy to find / delete during dev
DATABASE_URL = "sqlite:///./closira.db"

engine = create_engine(
    DATABASE_URL,
    # SQLite needs this flag when used with multiple threads (FastAPI runs async)
    connect_args={"check_same_thread": False},
)

# Each request gets its own short-lived session via this factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# All ORM models inherit from this base — keeps migrations clean
Base = declarative_base()


def init_db():
    """Create all tables if they don't already exist. Safe to call on every startup."""
    # Import models here so Base knows about them before create_all
    from app.models import enquiry  # noqa: F401
    Base.metadata.create_all(bind=engine)


def get_db():
    """
    FastAPI dependency that yields a DB session per request and
    guarantees it's closed afterwards — even if the handler raises.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
