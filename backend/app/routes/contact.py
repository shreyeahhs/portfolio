from __future__ import annotations

import logging
import os
from typing import Optional

import httpx
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, EmailStr, Field

from app.emails import first_name, owner_email, uk_time, visitor_email
from app.limiter import enforce

router = APIRouter()

BREVO_SEND_URL = "https://api.brevo.com/v3/smtp/email"


class ContactMessage(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    message: str = Field(..., min_length=1, max_length=1000)


def _clean_env(value: Optional[str]) -> str:
    if not value:
        return ""
    return value.strip().strip('"').strip("'")


async def _send(
    client: httpx.AsyncClient,
    *,
    to_email: str,
    to_name: Optional[str],
    subject: str,
    html_body: str,
    text_body: str,
    reply_to: Optional[dict] = None,
) -> bool:
    api_key = _clean_env(os.getenv("BREVO_API_KEY"))
    from_email = _clean_env(os.getenv("CONTACT_FROM_EMAIL"))
    from_name = _clean_env(os.getenv("CONTACT_FROM_NAME")) or "Shreyas"

    if not api_key or not from_email:
        logging.warning("Brevo is not configured; skipping send to %s", to_email)
        return False

    payload: dict = {
        "sender": {"name": from_name, "email": from_email},
        "to": [{"email": to_email, "name": to_name or to_email}],
        "subject": subject,
        "htmlContent": html_body,
        "textContent": text_body,
    }
    if reply_to:
        payload["replyTo"] = reply_to

    try:
        response = await client.post(
            BREVO_SEND_URL,
            json=payload,
            headers={"api-key": api_key, "Content-Type": "application/json"},
        )
        if response.is_error:
            logging.error("Brevo returned %s: %s", response.status_code, response.text)
            return False
        return True
    except Exception:
        logging.exception("Could not reach Brevo")
        return False


@router.post("")
async def submit_contact(payload: ContactMessage, request: Request):
    enforce(request, limit=5, window_seconds=600, label="contact")
    # Each message sends two emails, one of them to an address the visitor typed.
    # Per-address limits cannot stop someone with many addresses, so the form as a
    # whole is also capped. A personal site gets nowhere near this in a day; if it
    # is ever hit, the email address on the page still works.
    enforce(request, limit=50, window_seconds=86_400, label="contact", per_client=False)

    client: httpx.AsyncClient = request.app.state.http_client
    name = payload.name.strip()
    sender = str(payload.email)
    message = payload.message.strip()

    logging.info("Contact form submission from %s", sender)

    received = uk_time()
    owner_to = _clean_env(os.getenv("CONTACT_TO_EMAIL"))

    owner_subject, owner_html, owner_text = owner_email(
        name=name, email=sender, message=message, received=received
    )
    visitor_subject, visitor_html, visitor_text = visitor_email(
        name=name, message=message, received=received, can_reply=bool(owner_to)
    )

    owner_sent = False
    if owner_to:
        owner_sent = await _send(
            client,
            to_email=owner_to,
            to_name="Shreyas",
            subject=owner_subject,
            html_body=owner_html,
            text_body=owner_text,
            reply_to={"email": sender, "name": name},
        )

    visitor_sent = await _send(
        client,
        to_email=sender,
        to_name=first_name(name),
        subject=visitor_subject,
        html_body=visitor_html,
        text_body=visitor_text,
        # Replies to the receipt reach Shreyas, whatever address it was sent from.
        reply_to={"email": owner_to, "name": "Shreyas"} if owner_to else None,
    )

    if not owner_sent and not visitor_sent:
        raise HTTPException(
            status_code=502,
            detail="The message could not be delivered. Please email directly instead.",
        )

    return {"ok": True, "owner_notified": owner_sent, "visitor_notified": visitor_sent}
