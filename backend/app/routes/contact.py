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
    owner_html = f"""
    <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
        <h2 style="color: #3b82f6; margin-top: 0;">New Contact Form Submission</h2>
        <p><strong>Name:</strong> {contact.name}</p>
        <p><strong>Email:</strong> <a href="mailto:{contact.email}">{contact.email}</a></p>
        <div style="background: #f4f4f4; padding: 15px; border-radius: 4px; margin-top: 20px;">
            <strong>Message:</strong><br/>
            {contact.message.replace('\\n', '<br/>')}
        </div>
    </div>
    """
    owner_text = f"New contact submission\nName: {contact.name}\nEmail: {contact.email}\nMessage:\n{contact.message}"

    owner_sent = False
    contact_to_email = (os.getenv("CONTACT_TO_EMAIL") or "").strip().strip('"').strip("'")
    if contact_to_email:
        owner_sent = await _send_brevo_email(contact_to_email, None, owner_subject, owner_html, owner_text)
    else:
        logging.warning("CONTACT_TO_EMAIL not configured; owner will not be emailed")

    # Send thank-you email to visitor (from your CONTACT_FROM_EMAIL)
    visitor_subject = "Thanks for contacting Shreyas"

    # Professional HTML Template for Visitor
    visitor_html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }}
            .container {{ max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #ffffff; }}
            .header {{ background-color: #3b82f6; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }}
            .content {{ padding: 20px; }}
            .message-box {{ background-color: #f9fafb; padding: 15px; border-left: 4px solid #3b82f6; margin: 20px 0; font-style: italic; }}
            .footer {{ padding: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; text-align: center; }}
            .social-links a {{ color: #3b82f6; text-decoration: none; margin: 0 10px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Thanks for reaching out!</h1>
            </div>
            <div class="content">
                <p>Hi <strong>{contact.name}</strong>,</p>
                <p>I've received your message and will get back to you as soon as possible. It's great to connect!</p>
                
                <p>Here's a copy of what you sent:</p>
                <div class="message-box">
                    "{contact.message}"
                </div>
                
                <p>Best regards,<br/><strong>Shreyas Gowda</strong></p>
            </div>
            <div class="footer">
                <p>This is an automated confirmation from my portfolio contact form.</p>
                <div class="social-links">
                    <a href="https://github.com/shreyeahhs">GitHub</a> |
                    <a href="https://www.linkedin.com/in/shreyas-gowda-5316b51b1/">LinkedIn</a> |
                    <a href="https://www.instagram.com/shreyeahhs/">Instagram</a>
                </div>
            </div>
        </div>
    </body>
    </html>
    """
    visitor_text = f"Hi {contact.name},\n\nThanks for reaching out! I've received your message and will get back to you as soon as possible.\n\nYour message:\n{contact.message}\n\nBest regards,\nShreyas Gowda"

    visitor_sent = await _send_brevo_email(contact.email, contact.name, visitor_subject, visitor_html, visitor_text)

    return {"ok": True, "owner_notified": owner_sent, "visitor_notified": visitor_sent}
