import { firstName, ownerEmail, ukTime, visitorEmail } from "@/server/emails";
import { enforce, Limited, limitedResponse } from "@/server/limiter";

const BREVO_SEND_URL = "https://api.brevo.com/v3/smtp/email";

// Close enough to what the old backend's validator accepted, and the same rule the form checks.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function env(name: string): string {
  return (process.env[name] ?? "").trim().replace(/^["']|["']$/g, "");
}

function fail(status: number, detail: string) {
  return Response.json({ detail }, { status });
}

async function send(o: {
  toEmail: string;
  toName: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: { email: string; name: string };
}): Promise<boolean> {
  const apiKey = env("BREVO_API_KEY");
  const fromEmail = env("CONTACT_FROM_EMAIL");
  const fromName = env("CONTACT_FROM_NAME") || "Shreyas";
  if (!apiKey || !fromEmail) {
    console.warn("Brevo is not configured; skipping a send");
    return false;
  }

  try {
    const res = await fetch(BREVO_SEND_URL, {
      method: "POST",
      headers: { "api-key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        sender: { name: fromName, email: fromEmail },
        to: [{ email: o.toEmail, name: o.toName || o.toEmail }],
        subject: o.subject,
        htmlContent: o.html,
        textContent: o.text,
        ...(o.replyTo ? { replyTo: o.replyTo } : {}),
      }),
      signal: AbortSignal.timeout(15_000),
      cache: "no-store",
    });
    if (!res.ok) {
      console.error(`Brevo returned ${res.status}: ${(await res.text()).slice(0, 300)}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Could not reach Brevo:", (err as Error).name);
    return false;
  }
}

export async function POST(request: Request) {
  try {
    await enforce(request.headers, { limit: 5, windowSeconds: 600, label: "contact" });
    // Each message sends two emails, one of them to an address the visitor typed.
    // Per-address limits cannot stop someone with many addresses, so the form as a
    // whole is also capped. A personal site gets nowhere near this in a day; if it
    // is ever hit, the email address on the page still works.
    await enforce(request.headers, { limit: 50, windowSeconds: 86_400, label: "contact", perClient: false });
  } catch (err) {
    if (err instanceof Limited) return limitedResponse(err);
    throw err;
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail(400, "Send the message as JSON.");
  }
  const { name: rawName, email: rawEmail, message: rawMessage } = (body ?? {}) as Record<string, unknown>;
  if (typeof rawName !== "string" || rawName.length < 1 || rawName.length > 100)
    return fail(422, "Please give a name of up to 100 characters.");
  if (typeof rawEmail !== "string" || rawEmail.length > 254 || !EMAIL.test(rawEmail.trim()))
    return fail(422, "Please give a valid email address.");
  if (typeof rawMessage !== "string" || rawMessage.length < 1 || rawMessage.length > 1000)
    return fail(422, "Please write a message of up to 1000 characters.");

  const name = rawName.trim();
  const sender = rawEmail.trim();
  const message = rawMessage.trim();
  if (!name || !message) return fail(422, "Please fill in your name and a message.");

  console.info("Contact form submission received");

  const received = ukTime();
  const ownerTo = env("CONTACT_TO_EMAIL");
  const owner = ownerEmail({ name, email: sender, message, received });
  const visitor = visitorEmail({ name, message, received, canReply: Boolean(ownerTo) });

  const ownerSent = ownerTo
    ? await send({
        toEmail: ownerTo,
        toName: "Shreyas",
        ...owner,
        replyTo: { email: sender, name },
      })
    : false;

  const visitorSent = await send({
    toEmail: sender,
    toName: firstName(name),
    ...visitor,
    // Replies to the receipt reach Shreyas, whatever address it was sent from.
    replyTo: ownerTo ? { email: ownerTo, name: "Shreyas" } : undefined,
  });

  if (!ownerSent && !visitorSent) {
    return fail(502, "The message could not be delivered. Please email directly instead.");
  }
  return Response.json({ ok: true, owner_notified: ownerSent, visitor_notified: visitorSent });
}
