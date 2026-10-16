"use client";

import { ArrowUpRightIcon } from "@phosphor-icons/react";
import { motion } from "motion/react";
import { useReducedMotion } from "../lib/motion";
import { vele } from "../data/content";
import { EASE, Reveal } from "./Reveal";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** The digit in the week string picks one of Vele's calendar inks. 9 is pencilled. */
const INK: Record<string, string> = {
  "1": "var(--v-ink-1)",
  "2": "var(--v-ink-2)",
  "3": "var(--v-ink-3)",
  "4": "var(--v-ink-4)",
  "5": "var(--v-ink-5)",
  "6": "var(--v-ink-6)",
};

type Run = { ink: string; start: number; len: number };

/** "11000220" becomes two events: four slots apart, three slots long between them. */
function toRuns(day: string): Run[] {
  const out: Run[] = [];
  let i = 0;
  while (i < day.length) {
    const ch = day[i];
    let j = i;
    while (j < day.length && day[j] === ch) j++;
    if (ch !== "0") out.push({ ink: ch, start: i, len: j - i });
    i = j;
  }
  return out;
}

/**
 * A week of Vele, built at portfolio scale in Vele's own design system: paper
 * and ink, its six calendar inks, its red current-time line, its Dymo tape,
 * Libre Franklin. Colours come from Vele's own globals.css, light and dark, and
 * the events are drawn the way Vele draws them: a 16% wash of the calendar's ink
 * on paper inside a square 1.5px rule at 70%. Mixed into the paper token, never
 * into white, so the week goes dark with the page.
 *
 * The dashed block is the part of Vele that matters: something the assistant
 * pencilled in that has not been confirmed yet. The whole grid is sample data,
 * which the caption under it says.
 */
function VelePlate() {
  const reduce = useReducedMotion();

  return (
    <div className="skin-vele overflow-hidden rounded-xl border border-line shadow-[0_2px_4px_rgb(var(--c-shadow)/0.10),0_22px_48px_-20px_rgb(var(--c-shadow)/0.35)]">
      <div className="flex items-center gap-3 border-b border-line px-4 py-3">
        <span className="v-dymo">Vele</span>
        <span className="v-label text-ink-faint">Week 39</span>
        <span className="v-label ml-auto truncate text-ink-faint">21&ndash;27 September</span>
      </div>

      <div className="px-4 pt-3 pb-4">
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {DAYS.map((d) => (
            <span key={d} className="v-label truncate text-center text-ink-faint">
              {d}
            </span>
          ))}
        </div>

        <div className="mt-2 grid grid-cols-7 gap-1.5 sm:gap-2">
          {vele.week.map((day, d) => (
            <div
              key={d}
              className="relative grid gap-[3px]"
              style={{ gridTemplateRows: "repeat(8, 13px)" }}
            >
              {/* The empty hours, so free time is visible as space rather than nothing. */}
              {Array.from({ length: 8 }, (_, i) => (
                <span
                  key={i}
                  aria-hidden="true"
                  className="rounded-[2px] bg-raised"
                  style={{ gridColumn: 1, gridRow: i + 1 }}
                />
              ))}

              {toRuns(day).map((r, k) => {
                const pencil = r.ink === "9";
                return (
                  <motion.span
                    key={k}
                    aria-hidden="true"
                    className="origin-top"
                    style={{
                      gridColumn: 1,
                      gridRow: `${r.start + 1} / span ${r.len}`,
                      ...(pencil
                        ? {
                            // Vele's hold: dashed pencil rule over hatched paper.
                            borderRadius: 2,
                            border: "1.5px dashed var(--v-pencil)",
                            backgroundColor: "var(--c-page)",
                            backgroundImage:
                              "repeating-linear-gradient(-45deg, color-mix(in oklab, var(--v-pencil) var(--v-hatch), transparent) 0 1px, transparent 1px 6px)",
                          }
                        : {
                            background: `color-mix(in oklab, ${INK[r.ink]} 16%, var(--c-page))`,
                            border: `1.5px solid color-mix(in oklab, ${INK[r.ink]} 70%, var(--c-page))`,
                          }),
                    }}
                    initial={reduce ? false : { scaleY: 0.1 }}
                    whileInView={{ scaleY: 1 }}
                    viewport={{ once: true, margin: "0px 0px 10% 0px" }}
                    transition={{ duration: 0.5, delay: (d * 3 + k) * 0.04, ease: EASE }}
                  />
                );
              })}

              {/* Vele draws the current time across the day you are in. */}
              {d === 3 && (
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 z-10 h-px bg-[var(--v-red)]"
                  style={{ top: "62%" }}
                >
                  <span className="absolute -top-[2px] -left-[2px] size-[5px] rounded-full bg-[var(--v-red)]" />
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Vele's own line about itself, in its own voice and face. */}
      <p className="border-t border-line px-4 py-3 text-[13px] leading-relaxed text-ink-soft">
        {vele.motto}
      </p>
    </div>
  );
}

export function Vele() {
  return (
    <section id="vele" className="scroll-mt-16 border-b border-line">
      <div className="shell py-20 lg:py-28">
        <Reveal className="grid gap-x-14 gap-y-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <h2 className="display d2 max-w-[16ch] text-ink">{vele.claim}</h2>
            <p className="mt-8 max-w-[56ch] text-[1.0625rem] leading-[1.75] text-ink">
              {vele.description}
            </p>
            <p className="mt-5 max-w-[56ch] text-[1.0625rem] leading-[1.75] text-ink-soft">
              {vele.aside}
            </p>
          </div>

          <div className="lg:col-span-5 lg:pt-3">
            <p className="meta text-ink-faint">
              {vele.stats.map((s) => `${s.value} ${s.label}`).join("  ·  ")}
            </p>

            <p className="mt-7 text-[14px] leading-relaxed text-ink-faint">
              What the scheduling engine takes into account:
            </p>
            <ul className="mt-3 flex flex-wrap items-center gap-y-1.5 text-[13.5px] text-ink-soft">
              {vele.weighs.map((name) => (
                <li key={name} className="group flex items-center whitespace-nowrap">
                  {name}
                  <span
                    aria-hidden="true"
                    className="mx-3 size-[3px] rounded-full bg-line-strong group-last:hidden"
                  />
                </li>
              ))}
            </ul>

            <div className="mt-8">
              {vele.url ? (
                <a
                  href={vele.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-accent px-5 py-2.5 text-[14.5px] font-medium text-accent-ink transition-colors hover:bg-accent-hover"
                >
                  Open Vele
                  <ArrowUpRightIcon
                    size={16}
                    weight="bold"
                    className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </a>
              ) : (
                /* Until it is live, the same slot holds a badge rather than a dead link. */
                <span className="inline-flex items-center gap-2.5 rounded-full border border-line-strong px-5 py-2.5">
                  <span
                    aria-hidden="true"
                    className="size-1.5 shrink-0 rounded-full bg-accent motion-safe:animate-[beacon_1.8s_ease-in-out_infinite]"
                  />
                  <span className="meta text-ink-soft">{vele.status}</span>
                </span>
              )}
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.1} className="mt-14">
          <VelePlate />
          <p className="meta mt-3 text-ink-faint">{vele.weekNote}</p>
        </Reveal>
      </div>
    </section>
  );
}
