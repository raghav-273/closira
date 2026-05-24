"""
logger.py — Structured JSON logging for every key event in the system.

JSON logs are easier to parse with tools like grep, jq, or any log
aggregator (Datadog, CloudWatch, etc.) compared to plain-text logs.
Every important action (enquiry created, SOP matched, escalation triggered)
emits a JSON line that can be queried without regex gymnastics.
"""

import json
import logging
import sys
from datetime import datetime, timezone


class JSONFormatter(logging.Formatter):
    """
    Formats each log record as a single JSON line.
    Fields: timestamp, level, logger, message, plus any extras passed via extra={}.
    """

    def format(self, record: logging.LogRecord) -> str:
        log_entry = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }

        # Attach any extra context the caller passed in
        for key, value in record.__dict__.items():
            if key not in (
                "args", "asctime", "created", "exc_info", "exc_text",
                "filename", "funcName", "id", "levelname", "levelno",
                "lineno", "message", "module", "msecs", "msg", "name",
                "pathname", "process", "processName", "relativeCreated",
                "stack_info", "thread", "threadName",
            ):
                log_entry[key] = value

        return json.dumps(log_entry)


def get_logger(name: str) -> logging.Logger:
    """Return a logger that writes structured JSON to stdout."""
    logger = logging.getLogger(name)

    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        handler.setFormatter(JSONFormatter())
        logger.addHandler(handler)
        logger.setLevel(logging.INFO)
        # Don't bubble up to the root logger (avoids duplicate lines)
        logger.propagate = False

    return logger
