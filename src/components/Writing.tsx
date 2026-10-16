"use client";

import { ArrowUpRightIcon } from "@phosphor-icons/react";
import { motion } from "motion/react";
import { useReducedMotion } from "../lib/motion";
import { argument, corpus } from "../data/content";
import { EASE, Reveal } from "./Reveal";

const totalLessons = corpus.tracks.reduce((n, t) => n + t.count, 0);

/** Where each track starts in the run of 60, so the ticks draw top to bottom once. */
const trackOffsets = corpus.tracks.reduce<number[]>((acc, _t, i) => {
  acc.push(i === 0 ? 0 : acc[i - 1] + corpus.tracks[i - 1].count);
  return acc;
}, []);

/**
 * Prompt Corpus's own curriculum panel, rebuilt here at portfolio scale and
 * wearing its own design system rather than this site's: near-black paper,
 * amber signal, Literata. The values come from the live site's `:root`, so this
 * is a specimen of the thing rather than an impression of it.
 *
 * The ticks are decorative and hidden from assistive technology; the count sits
 * next to every one of them in plain text.
 */
function CorpusPlate() {
  const reduce = useReducedMotion();

  return (
    <div className="skin-corpus overflow-hidden rounded-xl border border-line shadow-[0_2px_4px_rgb(0_0_0/0.28),0_22px_48px_-20px_rgb(0_0_0/0.6)]">
      <div className="flex items-baseline justify-between gap-4 border-b border-line px-5 py-3.5">
        <span className="meta text-ink-faint">Curriculum</span>
        <span className="meta text-ink-faint">{totalLessons} lessons</span>
      </div>

      <ul className="divide-y divide-line">
        {corpus.tracks.map((t, gi) => (
          <li key={t.id} className="flex items-center gap-3 px-5 py-2.5 sm:gap-4">
            <span className="tabular w-5 shrink-0 text-[11.5px] text-accent-line">{t.id}</span>
            <span className="min-w-0 flex-1 truncate text-[14.5px] text-ink">{t.name}</span>

            <span aria-hidden="true" className="flex shrink-0 items-end gap-[2px]">
              {Array.from({ length: t.count }, (_, i) => (
                <motion.span
                  key={i}
                  className="h-3.5 w-[3px] origin-bottom rounded-[1px] bg-accent"
                  initial={reduce ? false : { scaleY: 0.14 }}
                  whileInView={{ scaleY: 1 }}
                  viewport={{ once: true, margin: "0px 0px 10% 0px" }}
                  transition={{ duration: 0.45, delay: (trackOffsets[gi] + i) * 0.012, ease: EASE }}
                />
              ))}
            </span>

            <span className="tabular w-4 shrink-0 text-right text-[12px] text-ink-faint">
              {t.count}
            </span>
          </li>
        ))}
      </ul>

      {/* The totals, under the list they add up. */}
      <p className="border-t border-line px-5 py-4 text-[13.5px] leading-relaxed text-ink-soft">
        <span className="font-medium text-ink">
          {corpus.stats[1].value} {corpus.stats[1].label}
        </span>
        , about <span className="font-medium text-ink">{corpus.stats[2].value}</span> of reading.
      </p>
    </div>
  );
}

export function Writing() {
  return (
    <section id="writing" className="scroll-mt-16 border-b border-line">
      <div className="shell py-20 lg:py-28">
        <Reveal className="grid gap-x-14 gap-y-8 lg:grid-cols-12">
          <h2 className="display d2 max-w-[14ch] text-ink lg:col-span-5">{argument.claim}</h2>
          <div className="space-y-5 lg:col-span-7 lg:pt-2">
            <p className="max-w-[58ch] text-[1.0625rem] leading-[1.75] text-ink">
              {argument.body[0]}
            </p>
            <p className="max-w-[58ch] text-[1.0625rem] leading-[1.75] text-ink-soft">
              {argument.body[1]}
            </p>
          </div>
        </Reveal>

        <div className="mt-20 grid gap-x-14 gap-y-10 border-t border-line pt-14 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <h3 className="display d3 text-ink">{corpus.title}</h3>
            <p className="mt-4 max-w-[46ch] text-[15.5px] leading-[1.7] text-ink-soft">
              {corpus.description}
            </p>
            <p className="mt-4 max-w-[46ch] text-[14.5px] leading-[1.7] text-ink-faint">
              {corpus.aside}
            </p>

            <a
              href={corpus.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group mt-8 inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-accent px-5 py-2.5 text-[14.5px] font-medium text-accent-ink transition-colors hover:bg-accent-hover"
            >
              Read Prompt Corpus
              <ArrowUpRightIcon
                size={16}
                weight="bold"
                className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </a>
          </Reveal>

          <Reveal delay={0.08} className="lg:col-span-7">
            <CorpusPlate />
            <p className="meta mt-3 text-ink-faint">
              The Prompt Corpus curriculum
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
