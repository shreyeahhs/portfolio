"use client";

import { useEffect, useRef, useState } from "react";
import { MoonIcon, SunIcon } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import { useReducedMotion } from "../lib/motion";
import { useTheme } from "../lib/theme";
import { ScrollTrack } from "./ScrollTrack";

const sections = [
  { id: "about", label: "About" },
  { id: "work", label: "Work" },
  { id: "writing", label: "Writing" },
  { id: "vele", label: "Vele" },
  { id: "juggle", label: "Juggle" },
  { id: "history", label: "History" },
];

/** Everything the readout can name, in page order, including the ones not in the menu. */
const tracked = [
  { id: "top", label: "" },
  { id: "about", label: "About" },
  { id: "work", label: "Work" },
  { id: "dashboards", label: "Dashboards" },
  { id: "writing", label: "Writing" },
  { id: "vele", label: "Vele" },
  { id: "juggle", label: "Juggle" },
  { id: "history", label: "History" },
  { id: "off-the-clock", label: "Outside work" },
  { id: "assistant", label: "Ask me anything" },
  { id: "contact", label: "Get in touch" },
];

/**
 * Which section is under the middle of the screen. One observer, a band across
 * the centre of the viewport, and the last section to cross it wins — so the
 * answer never flickers between two neighbours at a boundary.
 */
function useCurrentSection() {
  const [id, setId] = useState("top");

  useEffect(() => {
    const seen = new Set<string>();
    const watch = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) seen.add(e.target.id);
          else seen.delete(e.target.id);
        }
        const hit = tracked.filter((s) => seen.has(s.id));
        if (hit.length) setId(hit[hit.length - 1].id);
      },
      { rootMargin: "-48% 0px -48% 0px" }
    );

    for (const s of tracked) {
      const el = document.getElementById(s.id);
      if (el) watch.observe(el);
    }
    return () => watch.disconnect();
  }, []);

  return id;
}

export function Nav() {
  const { theme, toggle } = useTheme();
  const current = useCurrentSection();
  const reduce = useReducedMotion();
  const toggleRef = useRef<HTMLButtonElement>(null);

  const here = tracked.find((s) => s.id === current);
  const readout = here && here.label ? here.label : "";

  return (
    <header className="sticky top-0 z-50 bg-page/80 backdrop-blur-md">
      <nav
        aria-label="Primary"
        className="shell flex h-16 items-center gap-5"
      >
        <a
          href="#top"
          className="flex min-w-0 shrink items-baseline gap-2.5 text-[15px] font-semibold tracking-tight text-ink"
        >
          Shreyas
          {/*
           * Once you are into the page, the mark keeps saying where you are. It
           * is the only thing in the bar that changes while you read.
           */}
          <AnimatePresence mode="popLayout" initial={false}>
            {readout && (
              <motion.span
                key={readout}
                initial={reduce ? false : { y: 6, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={reduce ? { opacity: 0 } : { y: -6, opacity: 0 }}
                transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                className="meta hidden truncate font-normal text-ink-faint sm:block"
              >
                <span aria-hidden="true" className="mr-2.5 text-line-strong">
                  /
                </span>
                {readout}
              </motion.span>
            )}
          </AnimatePresence>
        </a>

        <ul className="ml-auto hidden items-center gap-7 lg:flex">
          {sections.map((s) => {
            const on = current === s.id;
            return (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  aria-current={on ? "true" : undefined}
                  className={`relative block py-1 text-[13.5px] transition-colors ${
                    on ? "text-ink" : "text-ink-soft hover:text-ink"
                  }`}
                >
                  {s.label}
                  <span
                    aria-hidden="true"
                    className={`absolute -bottom-0.5 left-0 h-px w-full origin-left bg-accent transition-transform duration-300 ${
                      on ? "scale-x-100" : "scale-x-0"
                    }`}
                  />
                </a>
              </li>
            );
          })}
        </ul>

        <div className="ml-auto flex shrink-0 items-center gap-2 lg:ml-0">
          <button
            ref={toggleRef}
            type="button"
            onClick={() => {
              // The new theme is wiped in as a circle growing out of this button.
              const r = toggleRef.current?.getBoundingClientRect();
              toggle(r ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : undefined);
            }}
            aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
            className="grid size-9 place-items-center rounded-full border border-line text-ink-soft transition-colors hover:border-line-strong hover:text-ink"
          >
            {theme === "dark" ? <SunIcon size={17} /> : <MoonIcon size={17} />}
          </button>

          <a
            href="#contact"
            className="whitespace-nowrap rounded-full bg-ink px-4 py-2 text-[13.5px] font-medium text-page transition-opacity hover:opacity-85"
          >
            Get in touch
          </a>
        </div>
      </nav>
      <ScrollTrack />
    </header>
  );
}
