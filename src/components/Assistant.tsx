"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpIcon, SparkleIcon, UserIcon } from "@phosphor-icons/react";
import DOMPurify from "dompurify";
import { marked } from "marked";
import { useReducedMotion } from "../lib/motion";
import { endpoints } from "../lib/api";
import { Reveal } from "./Reveal";

type Turn = { role: "you" | "assistant"; text: string; failed?: boolean };

/** Suggested questions. After each answer the next three unasked ones are offered. */
const openers = [
  "Where has he worked?",
  "What is Vele?",
  "What does Juggle do?",
  "What does he do for fun?",
  "What’s Prompt Corpus?",
  "Tell me about the ecosystem sim",
  "What did he build at Technobeez?",
  "What did he study?",
  "What are the Power BI dashboards about?",
  "What’s he reading at the moment?",
];

const UNREACHABLE = "The chatbot isn’t answering right now. Try again in a moment, or just email me.";

/** An error whose message is already fit to show a visitor. */
class Friendly extends Error {}

function render(md: string) {
  return DOMPurify.sanitize(marked.parse(md, { async: false }) as string);
}

const PROSE =
  "text-[15px] leading-[1.65] text-ink [&_a]:text-accent [&_a]:underline [&_code]:rounded [&_code]:bg-surface [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[13px] [&_li]:mt-1 [&_ol]:mt-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_p+p]:mt-3 [&_strong]:font-medium [&_ul]:mt-2 [&_ul]:list-disc [&_ul]:pl-5";

/**
 * Types a fresh answer out a few words at a time. Progress is measured against the
 * clock rather than counted per tick, so a throttled timer (a background tab) just
 * jumps ahead instead of crawling. Older answers render whole.
 */
function Typed({ text, fresh, onGrow }: { text: string; fresh: boolean; onGrow: () => void }) {
  const reduce = useReducedMotion();
  const tokens = useMemo(() => text.split(/(\s+)/), [text]);
  const [shown, setShown] = useState(() => (fresh && !reduce ? 0 : tokens.length));
  const grow = useRef(onGrow);
  grow.current = onGrow;

  useEffect(() => {
    if (shown >= tokens.length) return;
    const total = Math.min(2400, 22 * tokens.length);
    const start = performance.now();
    const id = window.setInterval(() => {
      const n = Math.min(tokens.length, Math.ceil(((performance.now() - start) / total) * tokens.length));
      setShown(n);
      grow.current();
      if (n >= tokens.length) window.clearInterval(id);
    }, 30);
    return () => window.clearInterval(id);
    // Runs once per answer; `shown` only seeds whether there is anything to type.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokens]);

  return (
    <div
      className={PROSE}
      dangerouslySetInnerHTML={{ __html: render(tokens.slice(0, shown).join("")) }}
    />
  );
}

export function Assistant() {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [draft, setDraft] = useState("");
  const [thinking, setThinking] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (turns.length && logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [turns, thinking]);

  async function send(text: string) {
    const question = text.trim();
    if (!question || thinking) return;

    const history = turns
      .filter((t) => !t.failed)
      .slice(-10)
      .map((t) => ({ role: t.role === "you" ? "user" : "assistant", content: t.text }));

    setTurns((prev) => [...prev, { role: "you", text: question }]);
    setDraft("");
    setThinking(true);

    try {
      const res = await fetch(endpoints.chat, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: question, history }),
      });

      if (!res.ok) {
        throw new Friendly(
          res.status === 429 ? "Too many questions at once. Give it a minute." : UNREACHABLE
        );
      }

      const data = await res.json();
      const reply = typeof data?.response === "string" ? data.response : "";
      if (!reply) throw new Friendly("That came back empty. Try asking another way.");

      setTurns((prev) => [...prev, { role: "assistant", text: reply }]);
    } catch (err) {
      setTurns((prev) => [
        ...prev,
        {
          role: "assistant",
          // A network failure surfaces as a TypeError like "Failed to fetch"; never show that.
          text: err instanceof Friendly ? err.message : UNREACHABLE,
          failed: true,
        },
      ]);
    } finally {
      setThinking(false);
    }
  }

  const unstarted = turns.length === 0 && !thinking;

  const asked = new Set(turns.filter((t) => t.role === "you").map((t) => t.text));
  const suggestions = openers.filter((q) => !asked.has(q)).slice(0, 3);

  function scrollToEnd() {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }

  return (
    <section id="assistant" className="border-b border-line scroll-mt-20">
      <div className="mx-auto max-w-[820px] px-5 py-20 sm:px-8 lg:py-28">
        <Reveal>
          <h2 className="display d2 text-ink">Rather just ask?</h2>
          <p className="mt-4 max-w-[52ch] text-[1.0625rem] leading-[1.75] text-ink-soft">
            Ask the chatbot anything about me. It answers from what&rsquo;s on this page.
          </p>
        </Reveal>

        <Reveal delay={0.08} className="mt-10">
          <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-[0_1px_2px_rgb(var(--c-shadow)/0.06),0_16px_40px_-16px_rgb(var(--c-shadow)/0.22)]">
            {/* Header: this is a chatbot, and it says so */}
            <div className="flex items-center gap-3 border-b border-line bg-raised px-4 py-3 sm:px-5">
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-accent text-accent-ink">
                <SparkleIcon size={16} weight="fill" />
              </span>
              <span className="min-w-0">
                <span className="block text-[14px] font-medium text-ink">Ask about Shreyas</span>
                <span className="block text-[12px] text-ink-soft">
                  AI chatbot. Answers can be wrong.
                </span>
              </span>
              {turns.length > 0 && (
                <button
                  type="button"
                  onClick={() => setTurns([])}
                  className="ml-auto shrink-0 text-[13px] text-ink-soft underline decoration-line underline-offset-4 transition-colors hover:text-ink"
                >
                  Clear
                </button>
              )}
            </div>

            <div
              ref={logRef}
              className="max-h-[420px] min-h-[240px] space-y-5 overflow-y-auto px-4 py-5 sm:px-5"
              aria-live="polite"
              aria-label="Conversation"
            >
              {unstarted && (
                <div className="flex gap-3">
                  <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-accent-wash text-accent">
                    <SparkleIcon size={14} weight="fill" />
                  </span>
                  <div className="rounded-2xl rounded-tl-sm bg-raised px-4 py-3">
                    <p className="text-[15px] leading-[1.65] text-ink">
                      Hi. Ask me anything about Shreyas: where he’s worked, what he’s
                      built, or what he does for fun.
                    </p>
                  </div>
                </div>
              )}

              {turns.map((t, i) =>
                t.role === "you" ? (
                  <div key={i} className="flex justify-end gap-3">
                    <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-accent-wash px-4 py-3">
                      <p className="text-[15px] leading-[1.65] text-ink">{t.text}</p>
                    </div>
                    <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full border border-line text-ink-faint">
                      <UserIcon size={14} />
                    </span>
                  </div>
                ) : (
                  <div key={i} className="flex gap-3">
                    <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-accent-wash text-accent">
                      <SparkleIcon size={14} weight="fill" />
                    </span>
                    <div
                      className={`max-w-[85%] rounded-2xl rounded-tl-sm px-4 py-3 ${
                        t.failed ? "border border-accent-line bg-accent-wash" : "bg-raised"
                      }`}
                    >
                      <Typed
                        text={t.text}
                        fresh={!t.failed && i === turns.length - 1}
                        onGrow={scrollToEnd}
                      />
                    </div>
                  </div>
                )
              )}

              {thinking && (
                <div className="flex gap-3">
                  <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-accent-wash text-accent">
                    <SparkleIcon size={14} weight="fill" />
                  </span>
                  <div className="rounded-2xl rounded-tl-sm bg-raised px-4 py-3.5">
                    <span className="sr-only">Thinking</span>
                    <span className="flex gap-1.5" aria-hidden="true">
                      {[0, 1, 2].map((d) => (
                        <span
                          key={d}
                          className="size-1.5 animate-[think_1.2s_ease-in-out_infinite] rounded-full bg-ink-faint"
                          style={{ animationDelay: `${d * 160}ms` }}
                        />
                      ))}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {!thinking && suggestions.length > 0 && (
              <div className="flex flex-wrap gap-2 px-4 pb-4 sm:px-5">
                {turns.length > 0 && (
                  <span className="w-full text-[12px] text-ink-faint">You could also ask</span>
                )}
                {suggestions.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => send(q)}
                    className="rounded-full border border-line px-3.5 py-1.5 text-[13px] text-ink-soft transition-colors hover:border-line-strong hover:text-ink"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(draft);
              }}
              className="flex items-end gap-2 border-t border-line bg-raised p-3"
            >
              <label htmlFor="assistant-input" className="sr-only">
                Ask the chatbot a question about Shreyas
              </label>
              <textarea
                id="assistant-input"
                ref={inputRef}
                value={draft}
                rows={1}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send(draft);
                  }
                }}
                placeholder="Ask a question"
                className="max-h-32 min-h-[42px] flex-1 resize-none rounded-lg bg-surface px-3 py-2.5 text-[15px] text-ink outline-none"
              />
              <button
                type="submit"
                disabled={!draft.trim() || thinking}
                aria-label="Send"
                className="grid size-[42px] shrink-0 place-items-center rounded-lg bg-accent text-accent-ink transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ArrowUpIcon size={17} weight="bold" />
              </button>
            </form>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
