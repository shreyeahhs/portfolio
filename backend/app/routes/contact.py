from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr, Field
import os
import logging
from typing import Optional
import random
import html as _html
import httpx

router = APIRouter()

BREVO_SEND_URL = "https://api.brevo.com/v3/smtp/email"


class ContactMessage(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    message: str = Field(..., min_length=1, max_length=1000)


async def _send_brevo_email(to_email: str, to_name: Optional[str], subject: str, html_content: str, text_content: str) -> bool:
    """Send an email via Brevo (formerly Sendinblue) using the transactional SMTP API.

    Returns True on success, False on failure.
    """
    # Read sender and API key at call time so changes to env are picked up
    # Normalize env values (strip whitespace and surrounding quotes)
    def _clean(v: Optional[str]) -> str:
        if not v:
            return ""
        return v.strip().strip('"').strip("'")

    brevo_api_key = _clean(os.getenv("BREVO_API_KEY"))
    contact_from_email = _clean(os.getenv("CONTACT_FROM_EMAIL"))
    contact_from_name = _clean(os.getenv("CONTACT_FROM_NAME") or "Website Contact")

    if not brevo_api_key:
        logging.warning("BREVO_API_KEY not configured; skipping email send")
        return False

    if not contact_from_email:
        logging.warning("CONTACT_FROM_EMAIL not configured; cannot send email")
        return False

    payload = {
        "sender": {"name": contact_from_name, "email": contact_from_email},
        # Brevo requires a non-empty `name` in the `to` object; provide a sensible fallback
        "to": [{"email": to_email, "name": (to_name or contact_from_name or to_email.split('@')[0])}],
        "subject": subject,
        "htmlContent": html_content,
        "textContent": text_content,
    }

    headers = {"api-key": brevo_api_key, "Content-Type": "application/json"}

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(BREVO_SEND_URL, json=payload, headers=headers)
            # If Brevo returns a non-2xx response, log body to help debugging
            if resp.status_code >= 400:
                logging.error("Brevo API returned %s: %s", resp.status_code, resp.text)
                return False
        return True
    except Exception as e:
        logging.exception("Failed to send email via Brevo: %s", e)
        return False


@router.post("")
async def submit_contact(contact: ContactMessage):
    # Log to console for local visibility
    logging.info("New contact: %s <%s> - %s", contact.name, contact.email, contact.message[:120])

    # Notify site owner with visitor info
    owner_subject = f"New contact from {contact.name}"
    owner_html = f"<h3>New contact submission</h3><p><strong>Name:</strong> {contact.name}</p><p><strong>Email:</strong> {contact.email}</p><p><strong>Message:</strong><br/>{contact.message}</p>"
    owner_text = f"New contact submission\nName: {contact.name}\nEmail: {contact.email}\nMessage:\n{contact.message}"

    owner_sent = False
    contact_to_email = (os.getenv("CONTACT_TO_EMAIL") or "").strip().strip('"').strip("'")
    if contact_to_email:
        owner_sent = await _send_brevo_email(contact_to_email, None, owner_subject, owner_html, owner_text)
    else:
        logging.warning("CONTACT_TO_EMAIL not configured; owner will not be emailed")

    # Send thank-you email to visitor (from your CONTACT_FROM_EMAIL)
    visitor_subject = "Thanks for contacting Shreyas"

    # Randomized visitor thank-you templates (user-provided). We'll replace {{name}} and {{message}}.
    visitor_templates = [
        "Hi {{name}},\nThanks for reaching out! I’ve passed your message to Shreyas and he’ll reply as soon as he stops pretending to take a “short break.”\n\nYour message:\n{{message}}\n\nShreyas’s virtual assistant",
        "Hey {{name}},\nThanks for the message! Shreyas has been notified and will get back to you soon. I promise I nudged him gently… maybe twice.\n\nYour message:\n{{message}}\n\nShreyas’s virtual assistant",
        "Hi {{name}},\nThanks for getting in touch! I’ve already poked Shreyas about your message and he’ll respond shortly (assuming he’s not buried under code).\n\nYour message:\n{{message}}\n\nShreyas’s virtual assistant",
        "Hello {{name}},\nYour message has been delivered to Shreyas. He’ll get back to you soon unless he’s debugging something dramatic, in which case… still soon.\n\nYour message:\n{{message}}\n\nShreyas’s virtual assistant",
    ]

    chosen = random.choice(visitor_templates)
    visitor_text = chosen.replace("{{name}}", contact.name).replace("{{message}}", contact.message)
    # Simple HTML version: escape then convert newlines to <br/>
    visitor_html = _html.escape(visitor_text).replace("\n", "<br/>")

    visitor_sent = await _send_brevo_email(contact.email, contact.name, visitor_subject, visitor_html, visitor_text)

    return {"ok": True, "owner_notified": owner_sent, "visitor_notified": visitor_sent}
