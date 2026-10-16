/**
 * The two emails the contact form sends: the one Shreyas gets, and the receipt
 * the visitor gets. Each comes as HTML and as plain text.
 *
 * Email HTML is its own dialect. Layout is tables, every style is inline, and
 * the message has to read properly with no stylesheet at all. A <style> block
 * adds dark mode and narrow-screen padding for the clients that honour it (Apple
 * Mail, iOS Mail, Outlook on the web); everyone else gets the light version,
 * which is the whole design anyway.
 *
 * The look follows the site: zinc neutrals, the one burnt-orange accent, small
 * uppercase mono labels, and the "plate", a bordered sheet with a caption bar
 * under a hairline, holding the message itself.
 */

// The site's palette (src/index.css). Light, then dark.
const PAGE = "#fafafa";
const SURFACE = "#ffffff";
const RAISED = "#f4f4f5";
const INK = "#17171a";
const SOFT = "#52525b";
const FAINT = "#63636b";
const LINE = "#e4e4e7";
const ACCENT = "#b83d0a";
const ACCENT_INK = "#ffffff";

const D_PAGE = "#0c0c0d";
const D_SURFACE = "#121214";
const D_RAISED = "#19191c";
const D_INK = "#f4f4f5";
const D_SOFT = "#a1a1aa";
const D_FAINT = "#93939c";
const D_LINE = "#26262a";
const D_ACCENT = "#fb8244";
const D_ACCENT_INK = "#1a0d05";

const SANS = "-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif";
const MONO = "ui-monospace,SFMono-Regular,Menlo,Consolas,'Liberation Mono',monospace";

const LINKS: [string, string][] = [
  ["Prompt Corpus", "https://prompt-corpus.vercel.app"],
  ["GitHub", "https://github.com/shreyeahhs"],
  ["LinkedIn", "https://www.linkedin.com/in/shreyas-gowda-5316b51b1/"],
];

type Email = { subject: string; html: string; text: string };

/* ------------------------------------------------------------------- time */

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** '16 Oct 2026, 14:32 BST': when the message arrived, on Shreyas's clock. */
export function ukTime(at: Date = new Date()): string {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/London",
      day: "numeric",
      month: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
      timeZoneName: "short",
    })
      .formatToParts(at)
      .map((p) => [p.type, p.value]),
  );
  const month = MONTHS[Number(parts.month) - 1];
  return `${parts.day} ${month} ${parts.year}, ${parts.hour}:${parts.minute} ${parts.timeZoneName ?? ""}`.trim();
}

/* ---------------------------------------------------------------- helpers */

function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

/** Escape what the visitor typed, then keep their line breaks. */
function bodyText(raw: string): string {
  return esc(raw).replace(/\r\n/g, "\n").replace(/\n/g, "<br>");
}

/** The first word of the name they gave, capped, for greetings and buttons. */
export function firstName(name: string): string {
  const word = name.trim() ? name.trim().split(/\s+/)[0] : name;
  return word.slice(0, 40);
}

function preview(text: string, limit = 110): string {
  const flat = text.split(/\s+/).filter(Boolean).join(" ");
  return flat.length <= limit ? flat : flat.slice(0, limit - 1).trimEnd() + "…";
}

/** Plain-text quote: every line prefixed, the way mail clients quote. */
function quoted(text: string): string {
  return text
    .trim()
    .split(/\r?\n/)
    .map((line) => (line.trim() ? `> ${line}` : ">"))
    .join("\n");
}

/* ----------------------------------------------------------------- pieces */

/** The site's .meta voice: small, wide, uppercase mono. */
function label(text: string, cls = "faint", colour = FAINT): string {
  return (
    `<span class="${cls}" style="font-family:${MONO};font-size:11px;line-height:16px;` +
    `letter-spacing:0.09em;text-transform:uppercase;color:${colour};">${text}</span>`
  );
}

/** A bordered sheet holding the message, a hairline, then a caption bar. */
function plate(bodyHtml: string, captionLeft: string, captionRight: string): string {
  return `\
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="line"
       style="border:1px solid ${LINE};border-radius:10px;border-collapse:separate;">
  <tr>
    <td class="ink" style="padding:20px 22px;font-family:${SANS};font-size:15px;line-height:25px;
               color:${INK};word-break:break-word;overflow-wrap:anywhere;">
      ${bodyHtml}
    </td>
  </tr>
  <tr>
    <td class="bg-raised line" style="padding:10px 22px;background:${RAISED};border-top:1px solid ${LINE};
               border-radius:0 0 10px 10px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="text-align:left;">${captionLeft}</td>
          <td style="text-align:right;white-space:nowrap;">${captionRight}</td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;
}

/** A pill that survives Outlook: the colour sits on the cell, not just the link. */
function button(text: string, href: string): string {
  return `\
<table role="presentation" cellpadding="0" cellspacing="0" border="0">
  <tr>
    <td class="btn" style="border-radius:999px;background:${ACCENT};">
      <a href="${href}" class="btn-text"
         style="display:inline-block;padding:12px 22px;font-family:${SANS};font-size:14px;
                line-height:18px;font-weight:600;color:${ACCENT_INK};text-decoration:none;
                border-radius:999px;">${text}</a>
    </td>
  </tr>
</table>`;
}

function documentHtml(o: { title: string; preheader: string; eyebrow: string; content: string; footer: string }) {
  return `\
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>${esc(o.title)}</title>
  <style>
    :root { color-scheme: light dark; supported-color-schemes: light dark; }
    a { text-decoration: none; }
    @media (max-width: 600px) {
      .pad { padding: 26px 20px !important; }
      .outer { padding: 20px 10px !important; }
      .title { font-size: 21px !important; line-height: 28px !important; }
    }
    @media (prefers-color-scheme: dark) {
      .bg-page { background: ${D_PAGE} !important; }
      .bg-surface { background: ${D_SURFACE} !important; }
      .bg-raised { background: ${D_RAISED} !important; }
      .ink { color: ${D_INK} !important; }
      .soft { color: ${D_SOFT} !important; }
      .faint { color: ${D_FAINT} !important; }
      .line { border-color: ${D_LINE} !important; }
      .accent { color: ${D_ACCENT} !important; }
      .btn { background: ${D_ACCENT} !important; }
      .btn-text { color: ${D_ACCENT_INK} !important; }
    }
  </style>
</head>
<body class="bg-page" style="margin:0;padding:0;background:${PAGE};-webkit-text-size-adjust:100%;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;">
    ${esc(o.preheader)}${"&#8199;&#65279;&#847; ".repeat(40)}
  </div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="bg-page"
         style="background:${PAGE};">
    <tr>
      <td align="center" class="outer" style="padding:36px 16px;">
        <!--[if mso]><table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0"><tr><td><![endif]-->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
               style="max-width:560px;">
          <tr>
            <td style="padding:0 4px 14px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td class="ink" style="font-family:${SANS};font-size:15px;line-height:20px;font-weight:600;
                             letter-spacing:-0.01em;color:${INK};">Shreyas</td>
                  <td style="text-align:right;">${label(o.eyebrow)}</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td class="bg-surface line" style="background:${SURFACE};border:1px solid ${LINE};border-radius:14px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td class="pad" style="padding:34px 34px 32px;font-family:${SANS};color:${INK};">
                    ${o.content}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td class="faint" style="padding:18px 12px 0;font-family:${SANS};font-size:12px;line-height:18px;
                       color:${FAINT};text-align:center;">
              ${o.footer}
            </td>
          </tr>
        </table>
        <!--[if mso]></td></tr></table><![endif]-->
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function title(text: string): string {
  return (
    `<h1 class="title ink" style="margin:0;font-family:${SANS};font-size:23px;line-height:30px;` +
    `font-weight:600;letter-spacing:-0.02em;color:${INK};">${text}</h1>`
  );
}

function para(text: string, { top = 12, cls = "soft", colour = SOFT, size = 15 } = {}): string {
  return (
    `<p class="${cls}" style="margin:${top}px 0 0;font-family:${SANS};font-size:${size}px;` +
    `line-height:${Math.round(size * 1.65)}px;color:${colour};">${text}</p>`
  );
}

function gap(px: number): string {
  return `<div style="height:${px}px;line-height:${px}px;font-size:1px;">&nbsp;</div>`;
}

/* ----------------------------------------------------------------- emails */

/** What lands in Shreyas's inbox. */
export function ownerEmail(o: { name: string; email: string; message: string; received: string }): Email {
  const first = firstName(o.name);
  const safeName = esc(o.name);
  const safeEmail = esc(o.email);
  const reply =
    `mailto:${encodeURIComponent(o.email).replace(/%40/g, "@").replace(/%2B/g, "+")}` +
    `?subject=${encodeURIComponent("Re: your message")}`;

  const content =
    title(`${safeName} sent you a message`) +
    para(`From <a href="mailto:${safeEmail}" class="accent" style="color:${ACCENT};">${safeEmail}</a>`, {
      top: 8,
      size: 14,
    }) +
    gap(22) +
    plate(bodyText(o.message), label("Message"), label(esc(o.received))) +
    gap(26) +
    button(`Reply to ${esc(first)}`, esc(reply)) +
    para("Or just hit reply. It goes straight to them.", { top: 12, cls: "faint", colour: FAINT, size: 13 });

  return {
    subject: `New message from ${o.name}`,
    html: documentHtml({
      title: `New message from ${o.name}`,
      preheader: preview(o.message),
      eyebrow: "Contact form",
      content,
      footer: `Sent from the contact form on your website. Replies go to ${safeEmail}.`,
    }),
    text:
      `New message from ${o.name} <${o.email}>\n` +
      `Received ${o.received}\n\n` +
      `${o.message.trim()}\n\n` +
      "---\n" +
      `Hit reply to answer ${first} directly.\n`,
  };
}

/**
 * The receipt for whoever wrote in.
 *
 * The subject never carries anything the visitor typed, and the greeting uses
 * only the first word of their name: this goes to whatever address was entered,
 * so it should carry as little of a stranger's text as it can.
 */
export function visitorEmail(o: { name: string; message: string; received: string; canReply: boolean }): Email {
  const first = firstName(o.name);
  const replyLine = o.canReply ? " If you want to add anything, just reply to this email." : "";

  const links = LINKS.map(
    ([text, href]) => `<a href="${href}" class="accent" style="color:${ACCENT};text-decoration:none;">${esc(text)}</a>`,
  ).join("&nbsp;&nbsp;·&nbsp;&nbsp;");

  const content =
    title(`Thanks, ${esc(first)}.`) +
    para(
      "Your message got through, and I&rsquo;ll get back to you soon." +
        `${replyLine} There&rsquo;s a copy of what you sent below, for your records.`,
      { top: 12 },
    ) +
    gap(24) +
    plate(bodyText(o.message), label("Your message"), label(esc(o.received))) +
    gap(28) +
    `<p class="ink" style="margin:0;font-family:${SANS};font-size:15px;line-height:22px;` +
    `font-weight:600;color:${INK};">Shreyas</p>` +
    `<p class="faint" style="margin:8px 0 0;font-family:${SANS};font-size:13px;line-height:20px;` +
    `color:${FAINT};">${links}</p>`;

  return {
    subject: "Thanks for getting in touch",
    html: documentHtml({
      title: "Thanks for getting in touch",
      preheader: "Your message got through. Here's a copy for your records.",
      eyebrow: "Message received",
      content,
      footer:
        "You&rsquo;re getting this because this address was entered in the contact form on " +
        "Shreyas&rsquo;s website. If that wasn&rsquo;t you, you can ignore it; nothing else will be sent.",
    }),
    text:
      `Hi ${first},\n\n` +
      "Thanks for getting in touch. Your message got through, and I'll get back to you soon." +
      `${replyLine} Here's a copy of what you sent, for your records.\n\n` +
      `${quoted(o.message)}\n` +
      `(sent ${o.received})\n\n` +
      "Shreyas\n\n" +
      LINKS.map(([text, href]) => `${text}: ${href}\n`).join("") +
      "\n---\n" +
      "You're getting this because this address was entered in the contact form on " +
      "Shreyas's website. If that wasn't you, you can ignore it; nothing else will be sent.\n",
  };
}
