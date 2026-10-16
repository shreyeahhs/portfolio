"use client";

import { useState } from "react";
import {
  ArrowUpRightIcon,
  CheckCircleIcon,
  CheckIcon,
  CopyIcon,
  GithubLogoIcon,
  InstagramLogoIcon,
  LinkedinLogoIcon,
} from "@phosphor-icons/react";
import { endpoints } from "../lib/api";
import { links, profile } from "../data/content";
import { Reveal } from "./Reveal";

type Errors = Partial<Record<"name" | "email" | "message", string>>;
type Status = "idle" | "sending" | "sent" | "failed";

const elsewhere = [
  { label: "GitHub", href: links.github, Icon: GithubLogoIcon },
  { label: "LinkedIn", href: links.linkedin, Icon: LinkedinLogoIcon },
  { label: "Instagram", href: links.instagram, Icon: InstagramLogoIcon },
];

const field =
  "w-full rounded-lg border bg-page px-3.5 py-3 text-[15px] text-ink outline-none transition-colors focus:border-accent";

const PLATE =
  "overflow-hidden rounded-xl border border-line bg-surface shadow-[0_1px_2px_rgb(var(--c-shadow)/0.06),0_16px_40px_-16px_rgb(var(--c-shadow)/0.22)]";

export function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [failure, setFailure] = useState("");
  const [copied, setCopied] = useState(false);

  function validate(): Errors {
    const next: Errors = {};
    if (!form.name.trim()) next.name = "Please add your name.";
    if (!form.email.trim()) next.email = "Please add an email address.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      next.email = "That doesn’t look like an email address.";
    if (!form.message.trim()) next.message = "Please write a message.";
    else if (form.message.trim().length > 1000)
      next.message = "Please keep it under 1000 characters.";
    return next;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length) return;

    setStatus("sending");
    setFailure("");

    try {
      const res = await fetch(endpoints.contact, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          message: form.message.trim(),
        }),
      });

      if (!res.ok) throw new Error("send failed");

      const data = await res.json();
      if (!data?.ok) throw new Error("send failed");

      setStatus("sent");
      setForm({ name: "", email: "", message: "" });
    } catch {
      setStatus("failed");
      setFailure("That didn’t go through. Try emailing me directly instead.");
    }
  }

  return (
    <section id="contact" className="scroll-mt-16 border-b border-line">
      <div className="shell grid gap-y-12 py-20 lg:grid-cols-12 lg:gap-x-16 lg:py-28">
        <Reveal className="lg:col-span-5">
          <h2 className="display d2 max-w-[10ch] text-ink">Get in touch.</h2>
          <p className="mt-5 max-w-[42ch] text-[1.0625rem] leading-[1.75] text-ink-soft">
            Want to talk about something, or know a Hot Wheels car I should hunt down?
            Send me a message.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2">
            <a
              href={`mailto:${profile.email}`}
              className="text-[15px] text-accent underline decoration-accent-line underline-offset-4 transition-colors hover:decoration-accent"
            >
              {profile.email}
            </a>
            <button
              type="button"
              onClick={async () => {
                let ok = false;
                try {
                  await navigator.clipboard.writeText(profile.email);
                  ok = true;
                } catch {
                  // The async clipboard API refuses unfocused pages and some older
                  // browsers; the legacy selection copy still works in most of them.
                  const t = document.createElement("textarea");
                  t.value = profile.email;
                  t.setAttribute("readonly", "");
                  t.style.position = "fixed";
                  t.style.opacity = "0";
                  document.body.appendChild(t);
                  t.select();
                  try {
                    ok = document.execCommand("copy");
                  } catch {
                    ok = false;
                  }
                  t.remove();
                }
                if (ok) {
                  setCopied(true);
                  window.setTimeout(() => setCopied(false), 2000);
                }
              }}
              className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1 text-[12.5px] text-ink-soft transition-colors hover:border-line-strong hover:text-ink"
            >
              {copied ? <CheckIcon size={13} weight="bold" /> : <CopyIcon size={13} />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>

          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
            {elsewhere.map(({ label, href, Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2 text-[14.5px] text-ink-soft transition-colors hover:text-ink"
                >
                  <Icon size={17} />
                  {label}
                  <ArrowUpRightIcon
                    size={12}
                    weight="bold"
                    className="text-ink-faint transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </a>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={0.08} className="lg:col-span-7">
          <div className={PLATE}>
            <div className="flex items-center justify-between gap-4 border-b border-line bg-raised px-4 py-3 sm:px-5">
              <span className="meta text-ink-faint">Send a message</span>
              <span className="meta text-ink-faint">Straight to my inbox</span>
            </div>

            <div className="p-5 sm:p-7">
              {status === "sent" ? (
                <div className="flex min-h-[260px] flex-col items-start justify-center">
                  <CheckCircleIcon size={28} weight="fill" className="text-accent" />
                  <p className="display mt-4 text-[1.75rem] text-ink">Sent.</p>
                  <p className="mt-2 max-w-[38ch] text-[15px] leading-relaxed text-ink-soft">
                    You’ll get a copy in your inbox too. I’ll reply when I can.
                  </p>
                  <button
                    type="button"
                    onClick={() => setStatus("idle")}
                    className="mt-6 text-[14.5px] font-medium text-accent underline decoration-accent-line underline-offset-4 transition-colors hover:decoration-accent"
                  >
                    Send another
                  </button>
                </div>
              ) : (
                <form onSubmit={onSubmit} noValidate className="grid gap-5 sm:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="name" className="meta text-ink-faint">
                      Name
                    </label>
                    <input
                      id="name"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      aria-invalid={Boolean(errors.name)}
                      aria-describedby={errors.name ? "name-error" : undefined}
                      className={`${field} ${errors.name ? "border-accent" : "border-line-strong"}`}
                    />
                    {errors.name && (
                      <p id="name-error" className="text-[13px] text-accent">
                        {errors.name}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <label htmlFor="email" className="meta text-ink-faint">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      aria-invalid={Boolean(errors.email)}
                      aria-describedby={errors.email ? "email-error" : undefined}
                      className={`${field} ${errors.email ? "border-accent" : "border-line-strong"}`}
                    />
                    {errors.email && (
                      <p id="email-error" className="text-[13px] text-accent">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 sm:col-span-2">
                    <label htmlFor="message" className="meta text-ink-faint">
                      Message
                    </label>
                    <textarea
                      id="message"
                      rows={6}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      aria-invalid={Boolean(errors.message)}
                      aria-describedby={errors.message ? "message-error" : undefined}
                      className={`${field} resize-y ${errors.message ? "border-accent" : "border-line-strong"}`}
                    />
                    {errors.message && (
                      <p id="message-error" className="text-[13px] text-accent">
                        {errors.message}
                      </p>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <button
                      type="submit"
                      disabled={status === "sending"}
                      className="inline-flex items-center whitespace-nowrap rounded-full bg-accent px-6 py-2.5 text-[14.5px] font-medium text-accent-ink transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {status === "sending" ? "Sending" : "Send message"}
                    </button>

                    {status === "failed" && (
                      <p role="alert" className="mt-3 text-[13.5px] text-accent">
                        {failure}
                      </p>
                    )}
                  </div>
                </form>
              )}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
