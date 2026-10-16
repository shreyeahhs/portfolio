"""
The two emails the contact form sends: the one Shreyas gets, and the receipt the
visitor gets. Each comes as HTML and as plain text.

Email HTML is its own dialect. Layout is tables, every style is inline, and the
message has to read properly with no stylesheet at all. A <style> block adds dark
mode and narrow-screen padding for the clients that honour it (Apple Mail, iOS
Mail, Outlook on the web); everyone else gets the light version, which is the
whole design anyway.

The look follows the site: zinc neutrals, the one burnt-orange accent, small
uppercase mono labels, and the "plate", a bordered sheet with a caption bar under
a hairline, holding the message itself.
"""

from __future__ import annotations

import html
from datetime import datetime, timedelta, timezone
from urllib.parse import quote

# The site's palette (src/index.css). Light, then dark.
PAGE, SURFACE, RAISED = "#fafafa", "#ffffff", "#f4f4f5"
INK, SOFT, FAINT = "#17171a", "#52525b", "#63636b"
LINE, ACCENT, ACCENT_INK = "#e4e4e7", "#b83d0a", "#ffffff"

D_PAGE, D_SURFACE, D_RAISED = "#0c0c0d", "#121214", "#19191c"
D_INK, D_SOFT, D_FAINT = "#f4f4f5", "#a1a1aa", "#93939c"
D_LINE, D_ACCENT, D_ACCENT_INK = "#26262a", "#fb8244", "#1a0d05"

SANS = "-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif"
MONO = "ui-monospace,SFMono-Regular,Menlo,Consolas,'Liberation Mono',monospace"

LINKS = [
    ("Prompt Corpus", "https://prompt-corpus.vercel.app"),
    ("GitHub", "https://github.com/shreyeahhs"),
    ("LinkedIn", "https://www.linkedin.com/in/shreyas-gowda-5316b51b1/"),
]


# --------------------------------------------------------------------- time


def _uk_offset(utc: datetime) -> tuple[timedelta, str]:
    """
    British Summer Time runs from 01:00 UTC on the last Sunday in March to 01:00
    UTC on the last Sunday in October. Used when the system has no time zone
    database, which is the case on a bare Windows Python.
    """

    def last_sunday(month: int) -> datetime:
        d = datetime(utc.year, month, 31, 1, tzinfo=timezone.utc)
        return d - timedelta(days=(d.weekday() + 1) % 7)

    if last_sunday(3) <= utc < last_sunday(10):
        return timedelta(hours=1), "BST"
    return timedelta(0), "GMT"


def uk_time(utc: datetime | None = None) -> str:
    """'16 Oct 2026, 14:32 BST': when the message arrived, on Shreyas's clock."""
    utc = (utc or datetime.now(timezone.utc)).astimezone(timezone.utc)
    try:
        from zoneinfo import ZoneInfo

        local = utc.astimezone(ZoneInfo("Europe/London"))
        zone = local.tzname() or ""
    except Exception:
        offset, zone = _uk_offset(utc)
        local = utc + offset
    return f"{local.day} {local:%b %Y, %H:%M} {zone}".strip()


# ------------------------------------------------------------------ helpers


def _esc(value: str) -> str:
    return html.escape(value, quote=True)


def _body_text(raw: str) -> str:
    """Escape what the visitor typed, then keep their line breaks."""
    return _esc(raw).replace("\r\n", "\n").replace("\n", "<br>")


def first_name(name: str) -> str:
    """The first word of the name they gave, capped, for greetings and buttons."""
    word = name.strip().split()[0] if name.strip() else name
    return word[:40]


def _preview(text: str, limit: int = 110) -> str:
    flat = " ".join(text.split())
    return flat if len(flat) <= limit else flat[: limit - 1].rstrip() + "…"


def _quoted(text: str) -> str:
    """Plain-text quote: every line prefixed, the way mail clients quote."""
    return "\n".join(f"> {line}" if line.strip() else ">" for line in text.strip().splitlines())


# ------------------------------------------------------------------- pieces


def _label(text: str, cls: str = "faint", colour: str = FAINT) -> str:
    """The site's .meta voice: small, wide, uppercase mono."""
    return (
        f'<span class="{cls}" style="font-family:{MONO};font-size:11px;line-height:16px;'
        f'letter-spacing:0.09em;text-transform:uppercase;color:{colour};">{text}</span>'
    )


def _plate(body_html: str, caption_left: str, caption_right: str) -> str:
    """A bordered sheet holding the message, a hairline, then a caption bar."""
    return f"""\
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="line"
       style="border:1px solid {LINE};border-radius:10px;border-collapse:separate;">
  <tr>
    <td class="ink" style="padding:20px 22px;font-family:{SANS};font-size:15px;line-height:25px;
               color:{INK};word-break:break-word;overflow-wrap:anywhere;">
      {body_html}
    </td>
  </tr>
  <tr>
    <td class="bg-raised line" style="padding:10px 22px;background:{RAISED};border-top:1px solid {LINE};
               border-radius:0 0 10px 10px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="text-align:left;">{caption_left}</td>
          <td style="text-align:right;white-space:nowrap;">{caption_right}</td>
        </tr>
      </table>
    </td>
  </tr>
</table>"""


def _button(label: str, href: str) -> str:
    """A pill that survives Outlook: the colour sits on the cell, not just the link."""
    return f"""\
<table role="presentation" cellpadding="0" cellspacing="0" border="0">
  <tr>
    <td class="btn" style="border-radius:999px;background:{ACCENT};">
      <a href="{href}" class="btn-text"
         style="display:inline-block;padding:12px 22px;font-family:{SANS};font-size:14px;
                line-height:18px;font-weight:600;color:{ACCENT_INK};text-decoration:none;
                border-radius:999px;">{label}</a>
    </td>
  </tr>
</table>"""


def _document(*, title: str, preheader: str, eyebrow: str, content: str, footer: str) -> str:
    return f"""\
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>{_esc(title)}</title>
  <style>
    :root {{ color-scheme: light dark; supported-color-schemes: light dark; }}
    a {{ text-decoration: none; }}
    @media (max-width: 600px) {{
      .pad {{ padding: 26px 20px !important; }}
      .outer {{ padding: 20px 10px !important; }}
      .title {{ font-size: 21px !important; line-height: 28px !important; }}
    }}
    @media (prefers-color-scheme: dark) {{
      .bg-page {{ background: {D_PAGE} !important; }}
      .bg-surface {{ background: {D_SURFACE} !important; }}
      .bg-raised {{ background: {D_RAISED} !important; }}
      .ink {{ color: {D_INK} !important; }}
      .soft {{ color: {D_SOFT} !important; }}
      .faint {{ color: {D_FAINT} !important; }}
      .line {{ border-color: {D_LINE} !important; }}
      .accent {{ color: {D_ACCENT} !important; }}
      .btn {{ background: {D_ACCENT} !important; }}
      .btn-text {{ color: {D_ACCENT_INK} !important; }}
    }}
  </style>
</head>
<body class="bg-page" style="margin:0;padding:0;background:{PAGE};-webkit-text-size-adjust:100%;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;">
    {_esc(preheader)}{"&#8199;&#65279;&#847; " * 40}
  </div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="bg-page"
         style="background:{PAGE};">
    <tr>
      <td align="center" class="outer" style="padding:36px 16px;">
        <!--[if mso]><table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0"><tr><td><![endif]-->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
               style="max-width:560px;">
          <tr>
            <td style="padding:0 4px 14px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td class="ink" style="font-family:{SANS};font-size:15px;line-height:20px;font-weight:600;
                             letter-spacing:-0.01em;color:{INK};">Shreyas</td>
                  <td style="text-align:right;">{_label(eyebrow)}</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td class="bg-surface line" style="background:{SURFACE};border:1px solid {LINE};border-radius:14px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td class="pad" style="padding:34px 34px 32px;font-family:{SANS};color:{INK};">
                    {content}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td class="faint" style="padding:18px 12px 0;font-family:{SANS};font-size:12px;line-height:18px;
                       color:{FAINT};text-align:center;">
              {footer}
            </td>
          </tr>
        </table>
        <!--[if mso]></td></tr></table><![endif]-->
      </td>
    </tr>
  </table>
</body>
</html>"""


def _title(text: str) -> str:
    return (
        f'<h1 class="title ink" style="margin:0;font-family:{SANS};font-size:23px;line-height:30px;'
        f'font-weight:600;letter-spacing:-0.02em;color:{INK};">{text}</h1>'
    )


def _para(text: str, *, top: int = 12, cls: str = "soft", colour: str = SOFT, size: int = 15) -> str:
    return (
        f'<p class="{cls}" style="margin:{top}px 0 0;font-family:{SANS};font-size:{size}px;'
        f'line-height:{round(size * 1.65)}px;color:{colour};">{text}</p>'
    )


def _gap(px: int) -> str:
    return f'<div style="height:{px}px;line-height:{px}px;font-size:1px;">&nbsp;</div>'


# ------------------------------------------------------------------- emails


def owner_email(*, name: str, email: str, message: str, received: str) -> tuple[str, str, str]:
    """What lands in Shreyas's inbox. Returns (subject, html, text)."""
    first = first_name(name)
    safe_name, safe_email, safe_first = _esc(name), _esc(email), _esc(first)
    reply = f"mailto:{quote(email, safe='@+')}?subject={quote('Re: your message')}"

    content = (
        _title(f"{safe_name} sent you a message")
        + _para(
            f'From <a href="mailto:{safe_email}" class="accent" style="color:{ACCENT};">{safe_email}</a>',
            top=8,
            size=14,
        )
        + _gap(22)
        + _plate(_body_text(message), _label("Message"), _label(_esc(received)))
        + _gap(26)
        + _button(f"Reply to {safe_first}", _esc(reply))
        + _para("Or just hit reply. It goes straight to them.", top=12, cls="faint", colour=FAINT, size=13)
    )
    html_body = _document(
        title=f"New message from {name}",
        preheader=_preview(message),
        eyebrow="Contact form",
        content=content,
        footer=f"Sent from the contact form on your website. Replies go to {safe_email}.",
    )
    text_body = (
        f"New message from {name} <{email}>\n"
        f"Received {received}\n\n"
        f"{message.strip()}\n\n"
        "---\n"
        f"Hit reply to answer {first} directly.\n"
    )
    return f"New message from {name}", html_body, text_body


def visitor_email(*, name: str, message: str, received: str, can_reply: bool) -> tuple[str, str, str]:
    """
    The receipt for whoever wrote in. Returns (subject, html, text).

    The subject never carries anything the visitor typed, and the greeting uses
    only the first word of their name: this goes to whatever address was entered,
    so it should carry as little of a stranger's text as it can.
    """
    first = first_name(name)
    safe_first = _esc(first)
    reply_line = " If you want to add anything, just reply to this email." if can_reply else ""

    links = "&nbsp;&nbsp;·&nbsp;&nbsp;".join(
        f'<a href="{href}" class="accent" style="color:{ACCENT};text-decoration:none;">{_esc(label)}</a>'
        for label, href in LINKS
    )

    content = (
        _title(f"Thanks, {safe_first}.")
        + _para(
            "Your message got through, and I&rsquo;ll get back to you soon."
            f"{reply_line} There&rsquo;s a copy of what you sent below, for your records.",
            top=12,
        )
        + _gap(24)
        + _plate(_body_text(message), _label("Your message"), _label(_esc(received)))
        + _gap(28)
        + f'<p class="ink" style="margin:0;font-family:{SANS};font-size:15px;line-height:22px;'
        f'font-weight:600;color:{INK};">Shreyas</p>'
        + f'<p class="faint" style="margin:8px 0 0;font-family:{SANS};font-size:13px;line-height:20px;'
        f'color:{FAINT};">{links}</p>'
    )
    html_body = _document(
        title="Thanks for getting in touch",
        preheader="Your message got through. Here's a copy for your records.",
        eyebrow="Message received",
        content=content,
        footer=(
            "You&rsquo;re getting this because this address was entered in the contact form on "
            "Shreyas&rsquo;s website. If that wasn&rsquo;t you, you can ignore it; nothing else will be sent."
        ),
    )
    text_body = (
        f"Hi {first},\n\n"
        "Thanks for getting in touch. Your message got through, and I'll get back to you soon."
        f"{reply_line} Here's a copy of what you sent, for your records.\n\n"
        f"{_quoted(message)}\n"
        f"(sent {received})\n\n"
        "Shreyas\n\n"
        + "".join(f"{label}: {href}\n" for label, href in LINKS)
        + "\n---\n"
        "You're getting this because this address was entered in the contact form on "
        "Shreyas's website. If that wasn't you, you can ignore it; nothing else will be sent.\n"
    )
    return "Thanks for getting in touch", html_body, text_body
