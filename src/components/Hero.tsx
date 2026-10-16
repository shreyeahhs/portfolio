"use client";

import { ArrowDownIcon } from "@phosphor-icons/react";
import { motion, useScroll, useTransform } from "motion/react";
import { useReducedMotion } from "../lib/motion";
import { useRef } from "react";
import { heroFacts, profile } from "../data/content";
import { LiveSim } from "./LiveSim";
import { EASE } from "./Reveal";

/**
 * The rail never wraps, because a wrapped row starts with a stray separator.
 * Narrower screens drop facts from the end instead, and the three products
 * (items 3 to 5) come and go together. Breakpoints fitted to the measured
 * widths of the set rail, 11.5px mono.
 */
const railItem = (i: number) =>
  i < 2 ? "flex" : i < 3 ? "hidden sm:flex" : i < 6 ? "hidden lg:flex" : "hidden xl:flex";

/**
 * The first screen. One sentence, set as large as the page allows; the running
 * simulation alongside; and a rail of
 * plain facts across the foot, so a visitor who never scrolls still leaves
 * knowing who this is.
 *
 * As you scroll out of it the statement drifts up a little faster than the page
 * and the rail settles, which gives the first screen a floor rather than an
 * edge. All of it is transform and opacity on motion values, so scrolling never
 * re-renders, and every word is on screen from the first paint.
 */
export function Hero() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const lift = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -70]);
  const dim = useTransform(scrollYProgress, [0, 0.85], [1, reduce ? 1 : 0.35]);

  const rise = (delay: number) => ({
    // Visible from the first paint; the motion is a lift, never a fade-in.
    initial: reduce ? false : { y: 16 },
    animate: { y: 0 },
    transition: { duration: 0.85, delay, ease: EASE },
  });

  return (
    <section ref={ref} id="top" className="relative isolate border-b border-line">
      <div className="shell flex min-h-[calc(100svh-4rem)] flex-col pt-10 pb-0 lg:pt-16">
        <motion.div
          // Drifts against the page as you leave it, so the background map follows it.
          data-terrain-follow
          style={{ y: lift, opacity: dim }}
          className="grid flex-1 grid-cols-1 items-center gap-y-12 lg:grid-cols-12 lg:gap-x-12"
        >
          <div className="lg:col-span-7 lg:pr-2">
            <motion.p {...rise(0)} className="meta text-ink-faint">
              {profile.fullName}
            </motion.p>

            <h1 className="mt-6 text-ink">
              <motion.span {...rise(0.05)} className="display d1 block">
                {profile.headline}
              </motion.span>
            </h1>

            <motion.p
              {...rise(0.19)}
              className="mt-8 max-w-[48ch] text-[1.0625rem] leading-[1.75] text-ink-soft"
            >
              {profile.standfirst}
            </motion.p>

            <motion.div {...rise(0.25)} className="mt-9 flex flex-wrap items-center gap-3">
              <a
                href="#work"
                className="group inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-accent px-5 py-2.5 text-[14.5px] font-medium text-accent-ink transition-colors hover:bg-accent-hover"
              >
                See the work
                <ArrowDownIcon
                  size={15}
                  weight="bold"
                  className="transition-transform duration-300 group-hover:translate-y-0.5"
                />
              </a>
              <a
                href="#about"
                className="inline-flex items-center whitespace-nowrap rounded-full border border-line-strong px-5 py-2.5 text-[14.5px] font-medium text-ink transition-colors hover:border-ink"
              >
                More about me
              </a>
            </motion.div>
          </div>

          <motion.div {...rise(0.32)} className="lg:col-span-5">
            <LiveSim />
          </motion.div>
        </motion.div>

        {/* The floor of the first screen: the facts, and the way down. */}
        <motion.div
          {...rise(0.4)}
          className="mt-14 flex items-center gap-6 border-t border-line py-5"
        >
          <ul className="meta flex min-w-0 items-center gap-x-4 text-ink-faint sm:gap-x-5">
            {heroFacts.map((fact, i) => (
              <li key={fact} className={`${railItem(i)} ${i === 0 ? "shrink-0" : "min-w-0"} items-center gap-5 whitespace-nowrap`}>
                {i > 0 && (
                  <span aria-hidden="true" className="hidden size-1 shrink-0 rounded-full bg-line-strong sm:block" />
                )}
                {/* On the very narrowest phones the long fact shortens rather than pushing the page. */}
                <span className="truncate">{fact}</span>
              </li>
            ))}
          </ul>

          <a
            href="#about"
            aria-label="Scroll to the rest of the page"
            className="ml-auto hidden shrink-0 text-ink-faint transition-colors hover:text-ink lg:block"
          >
            <ArrowDownIcon
              size={16}
              weight="bold"
              className="animate-[sink_2.4s_ease-in-out_infinite]"
            />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
