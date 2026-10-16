import { SYSTEM_PROMPT } from "@/server/chat-prompt";
import { enforce, Limited, limitedResponse } from "@/server/limiter";

// A slow model plus one retry and a fallback can take a while; never cut an answer off.
export const maxDuration = 60;

const GEMINI_URL = (model: string) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;

// Gemini sheds load with 429s and 503s at busy times; these are worth another go.
const RETRYABLE = new Set([429, 500, 502, 503, 504]);

type Content = { role: "user" | "model"; parts: { text: string }[] };

function fail(status: number, detail: string) {
  return Response.json({ detail }, { status });
}

function buildContents(history: unknown, question: string): Content[] {
  const contents: Content[] = [];
  const turns = Array.isArray(history) ? history.slice(-12) : [];
  for (const item of turns) {
    if (!item || typeof item !== "object") continue;
    const { role, content } = item as { role?: unknown; content?: unknown };
    const text = String(content ?? "").trim().slice(0, 2000);
    if (!text) continue;
    const fromModel = role === "assistant" || role === "bot" || role === "model";
    contents.push({ role: fromModel ? "model" : "user", parts: [{ text }] });
  }
  contents.push({ role: "user", parts: [{ text: question }] });
  return contents;
}

function extractText(data: unknown): string {
  const candidates = (data as { candidates?: { content?: { parts?: { text?: string }[] } }[] })?.candidates ?? [];
  if (!candidates.length) throw new Error("The assistant returned no answer.");
  const parts = candidates[0].content?.parts ?? [];
  const text = parts
    .map((p) => p.text ?? "")
    .join("")
    .trim();
  if (!text) throw new Error("The assistant returned an empty answer.");
  return text;
}

async function ask(model: string, apiKey: string, body: unknown) {
  // The key travels in a header, never in the URL, so request logs cannot capture it.
  return fetch(GEMINI_URL(model), {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(30_000),
    cache: "no-store",
  });
}

const pause = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function POST(request: Request) {
  try {
    await enforce(request.headers, { limit: 20, windowSeconds: 300, label: "chat" });
  } catch (err) {
    if (err instanceof Limited) return limitedResponse(err);
    throw err;
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    console.error("No Gemini API key configured");
    return fail(503, "The assistant is not configured.");
  }

  let payload: { message?: unknown; history?: unknown };
  try {
    payload = (await request.json()) ?? {};
  } catch {
    return fail(400, "Send the question as JSON.");
  }
  if (payload.message !== undefined && typeof payload.message !== "string") return fail(422, "The question must be text.");
  const raw = (payload.message as string | undefined) ?? "";
  if (raw.length > 2000) return fail(422, "Please keep the question under 2000 characters.");
  const question = raw.trim();
  if (!question) return fail(400, "Please include a question.");

  // Pinned ids rot: gemini-2.5-flash-lite, an earlier fallback, started answering
  // 404 "no longer available to new users", which turned every blip on the primary
  // into a 502 for the visitor. The -latest aliases track whatever is current, so
  // the fallback keeps working without anyone editing this line. Override per
  // environment if a specific version is ever needed.
  const primary = process.env.GEMINI_MODEL || "gemini-flash-latest";
  const fallback = process.env.GEMINI_FALLBACK_MODEL || "gemini-flash-lite-latest";

  const body = {
    systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents: buildContents(payload.history, question),
    generationConfig: { temperature: 0.75, topP: 0.95, maxOutputTokens: 900 },
  };

  // Try the main model, once more after a short pause, then a lighter model,
  // rather than telling a visitor to come back later because Google was busy.
  const attempts: [string, number][] = [
    [primary, 0],
    [primary, 800],
  ];
  if (fallback && fallback !== primary) attempts.push([fallback, 0]);

  let response: Response | null = null;
  const gone = new Set<string>();
  for (const [model, wait] of attempts) {
    if (gone.has(model)) continue;
    if (wait) await pause(wait);
    try {
      response = await ask(model, apiKey, body);
    } catch (err) {
      console.warn(`Could not reach Gemini (${model}): ${(err as Error).name}`);
      response = null;
      continue;
    }
    if (response.ok) break;
    console.warn(`Gemini ${model} returned ${response.status}: ${(await response.clone().text()).slice(0, 300)}`);
    // 404 means this model is retired or renamed. Retrying it is pointless, but
    // it is exactly when the next model in the list should get its turn.
    if (response.status === 404) {
      gone.add(model);
      continue;
    }
    if (!RETRYABLE.has(response.status)) break;
  }

  if (!response) return fail(502, "The assistant is unreachable right now.");
  if (!response.ok) {
    if (response.status === 429) return fail(429, "The assistant is busy. Try again shortly.");
    return fail(502, "The assistant could not answer just now.");
  }

  try {
    return Response.json({ response: extractText(await response.json()) });
  } catch (err) {
    console.warn("Unusable Gemini response:", (err as Error).message);
    return fail(502, (err as Error).message.startsWith("The assistant") ? (err as Error).message : "The assistant could not answer just now.");
  }
}
