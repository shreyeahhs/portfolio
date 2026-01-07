from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, EmailStr, Field
import os
import logging
from typing import Optional
import httpx

router = APIRouter()

BREVO_SEND_URL = "https://api.brevo.com/v3/smtp/email"


class ContactMessage(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    message: str = Field(..., min_length=1, max_length=1000)


def _clean_env(v: Optional[str]) -> str:
    if not v:
        return ""
    return v.strip().strip('"').strip("'")


async def _send_brevo_email(
    client: httpx.AsyncClient,
    to_email: str,
    to_name: Optional[str],
    subject: str,
    html_content: str,
    text_content: str,
) -> bool:
    """Send an email via Brevo using the transactional SMTP API."""
    brevo_api_key = _clean_env(os.getenv("BREVO_API_KEY"))
    contact_from_email = _clean_env(os.getenv("CONTACT_FROM_EMAIL"))
    contact_from_name = _clean_env(os.getenv("CONTACT_FROM_NAME") or "Website Contact")

    if not brevo_api_key or not contact_from_email:
        logging.warning("Brevo email not fully configured; skipping send")
        return False

    payload = {
        "sender": {"name": contact_from_name, "email": contact_from_email},
        "to": [{"email": to_email, "name": (to_name or contact_from_name)}],
        "subject": subject,
        "htmlContent": html_content,
        "textContent": text_content,
    }

    headers = {"api-key": brevo_api_key, "Content-Type": "application/json"}

    try:
        resp = await client.post(BREVO_SEND_URL, json=payload, headers=headers)
        if resp.status_code >= 400:
            logging.error("Brevo API returned %s: %s", resp.status_code, resp.text)
            return False
        return True
    except Exception as e:
        logging.exception("Failed to send email via Brevo: %s", e)
        return False


@router.post("")
async def submit_contact(contact: ContactMessage, request: Request):
    client = request.app.state.http_client
    logging.info("New contact: %s <%s>", contact.name, contact.email)

    # Email templates (Simplified for brevity in the response, but logically the same)
    owner_subject = f"New contact from {contact.name}"
    owner_html = f"""
    <div style="font-family: sans-serif; padding: 20px;">
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> {contact.name}</p>
        <p><strong>Email:</strong> {contact.email}</p>
        <div style="background: #f4f4f4; padding: 15px; border-radius: 4px;">
            <strong>Message:</strong><br/>
            {contact.message.replace('\\n', '<br/>')}
        </div>
    </div>
    """
    owner_text = f"New contact submission\nName: {contact.name}\nEmail: {contact.email}\nMessage:\n{contact.message}"

    contact_to_email = _clean_env(os.getenv("CONTACT_TO_EMAIL"))
    owner_sent = False
    if contact_to_email:
        owner_sent = await _send_brevo_email(client, contact_to_email, None, owner_subject, owner_html, owner_text)

    # Visitor Thank-You Email
    visitor_subject = "Thanks for contacting Shreyas"
    visitor_html = f"""
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee;">
        <h1 style="color: #3b82f6;">Thanks for reaching out!</h1>
        <p>Hi {contact.name}, I've received your message and will get back to you soon.</p>
        <div style="background: #f9fafb; padding: 15px; border-left: 4px solid #3b82f6;">
            "{contact.message}"
        </div>
        <p>Best regards,<br/><strong>Shreyas Gowda</strong></p>
    </div>
    """
    visitor_text = f"Hi {contact.name},\n\nThanks for reaching out! I've received your message and will get back to you soon.\n\nYour message:\n{contact.message}"

    visitor_sent = await _send_brevo_email(client, contact.email, contact.name, visitor_subject, visitor_html, visitor_text)

    return {"ok": True, "owner_notified": owner_sent, "visitor_notified": visitor_sent}
