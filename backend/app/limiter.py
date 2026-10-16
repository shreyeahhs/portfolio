"""
Small in-memory sliding-window rate limiter.

Both public endpoints spend real money (a Gemini key, a Brevo sending quota) and
neither is authenticated, so an unthrottled endpoint is a standing invitation.
This runs per process, which is enough for a single Render instance. If the
service is ever scaled to more than one worker, move this to Redis.
"""

from __future__ import annotations

import os
import time
from collections import defaultdict, deque
from threading import Lock

from fastapi import HTTPException, Request

_hits: dict[str, deque[float]] = defaultdict(deque)
_lock = Lock()


def _trusted_proxies() -> int:
    try:
        return max(0, int(os.getenv("TRUSTED_PROXIES", "1")))
    except ValueError:
        return 1


def client_key(request: Request) -> str:
    """
    The address to rate-limit on.

    X-Forwarded-For is a list the client can write to. Whatever a client sends
    arrives at the front of it, and each proxy appends the address it actually
    saw. So only the last TRUSTED_PROXIES entries can be believed, and the
    client's real address is the first of those. Reading the front of the list,
    as this used to, let anyone pick a fresh bucket per request with one header,
    which made every limit in this file decorative.

    Render puts one proxy in front of the app, hence the default of 1. Set
    TRUSTED_PROXIES=0 where nothing sits in front, so the header is ignored.
    """
    hops = _trusted_proxies()
    forwarded = [p.strip() for p in request.headers.get("x-forwarded-for", "").split(",") if p.strip()]
    if hops and forwarded:
        return forwarded[-hops] if len(forwarded) >= hops else forwarded[0]
    return request.client.host if request.client else "unknown"


def enforce(
    request: Request,
    *,
    limit: int,
    window_seconds: int,
    label: str,
    per_client: bool = True,
) -> None:
    """
    Raise 429 when `limit` requests have arrived in the window: from this client,
    or with `per_client=False`, from everyone together. The shared form is a
    ceiling on total spend that holds however many addresses an abuser has.
    """
    key = f"{label}:{client_key(request)}" if per_client else f"{label}:*"
    now = time.monotonic()
    cutoff = now - window_seconds

    with _lock:
        bucket = _hits[key]
        while bucket and bucket[0] < cutoff:
            bucket.popleft()

        if len(bucket) >= limit:
            retry_after = max(1, int(window_seconds - (now - bucket[0])))
            raise HTTPException(
                status_code=429,
                detail="Too many requests. Please wait a moment and try again.",
                headers={"Retry-After": str(retry_after)},
            )

        bucket.append(now)

        # Opportunistic cleanup so idle keys do not accumulate forever.
        if len(_hits) > 2048:
            for stale in [k for k, v in _hits.items() if not v]:
                del _hits[stale]
