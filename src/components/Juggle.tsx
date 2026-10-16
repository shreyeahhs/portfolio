"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRightIcon } from "@phosphor-icons/react";
import { useReducedMotion } from "../lib/motion";
import { juggle } from "../data/content";
import { Reveal } from "./Reveal";

const KEYS = 10;
const LOOP = "10s linear infinite";

/** Which keys take part, and on which pass. The rest sit idle the whole loop. */
const HOT: Record<number, string> = { 2: "j-hot-a1", 3: "j-hot-a2", 6: "j-hot-b1", 7: "j-hot-b2" };
const COOL: Record<number, string> = { 2: "j-cool-a", 6: "j-cool-b" };

/**
 * True only while the element is on screen *and* the tab is in front. A looping
 * diagram nobody is looking at is just heat, and a backgrounded tab will happily
 * keep compositing one.
 */
function usePlayWhenVisible<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [run, setRun] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let onScreen = false;
    const sync = () => setRun(onScreen && document.visibilityState === "visible");

    const watch = new IntersectionObserver(([e]) => {
      onScreen = e.isIntersecting;
      sync();
    });
    watch.observe(el);
    document.addEventListener("visibilitychange", sync);

    return () => {
      watch.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  return [ref, run] as const;
}

const LAYER = "absolute inset-0 rounded-[inherit]";

/**
 * What the gateway does, as a diagram rather than a hero: ten keys, a request
 * that lands on one, gets a 429, and is served by the next one along. It runs
 * twice per loop on different keys so the rotation itself is visible.
 *
 * The row is a ten-column grid with no gap — the spacing is padding inside each
 * cell — so the marker can move exactly one key with `translateX(100%)`.
 *
 * Reduced motion gets its own still frame rather than the global rule's version
 * of one: that rule collapses every animation to its last keyframe, which here
 * is the empty state between passes. The still frame says the same thing the
 * loop does, held: one key parked on a cooldown, its neighbour serving.
 */
function KeyRotation() {
  const reduce = useReducedMotion();
  const [ref, run] = usePlayWhenVisible<HTMLDivElement>();

  const still = (i: number) => ({
    hot: i === 3,
    cool: i === 2,
  });

  return (
    <div
      ref={ref}
      data-run={reduce ? "false" : run}
      className="j-stage skin-juggle overflow-hidden rounded-[var(--j-radius)] border border-line px-4 py-4 sm:px-5"
    >
      <div className="flex items-baseline justify-between gap-4">
        <span className="meta text-ink-faint">Key rotation</span>
        <span className="meta text-ink-faint">{KEYS} keys</span>
      </div>

      <div className="mt-5 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-7">
        {/* The row is capped so ten keys stay small marks rather than slabs. */}
        <div className="relative w-full min-w-0 max-w-[460px] sm:flex-1">
          {/* The request. Its cell is one key wide, so each 100% is one key. */}
          <div aria-hidden="true" className="absolute inset-x-0 -top-1 grid grid-cols-10">
            <div
              className="px-[3px]"
              style={
                reduce ? { transform: "translateX(300%)" } : { animation: `j-request ${LOOP}` }
              }
            >
              <span className="mx-auto block size-2 rounded-full bg-[var(--j-heat)]" />
            </div>
          </div>

          <div className="grid grid-cols-10 pt-3">
            {Array.from({ length: KEYS }, (_, i) => {
              const s = still(i);
              return (
                <div key={i} className="px-[3px]">
                  <span className="relative block h-8 rounded-[var(--j-radius)] bg-line-strong/55">
                    {(reduce ? s.hot : HOT[i]) && (
                      <span
                        aria-hidden="true"
                        className={`${LAYER} bg-[var(--j-heat)]`}
                        style={
                          reduce ? { opacity: 1 } : { opacity: 0, animation: `${HOT[i]} ${LOOP}` }
                        }
                      />
                    )}
                    {(reduce ? s.cool : COOL[i]) && (
                      <span
                        aria-hidden="true"
                        className={`${LAYER} border border-dashed border-[var(--j-fail)] bg-[var(--j-fail-wash)]`}
                        style={
                          reduce ? { opacity: 1 } : { opacity: 0, animation: `${COOL[i]} ${LOOP}` }
                        }
                      />
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* The outcome, to the right of the row. */}
        {reduce ? (
          <div className="shrink-0 space-y-1">
            <p className="meta text-[var(--j-fail)]">429 &middot; cooling</p>
            <p className="meta text-ink">200 OK</p>
          </div>
        ) : (
          <div className="relative h-5 w-[104px] shrink-0">
            <span
              className="meta absolute inset-x-0 text-[var(--j-fail)]"
              style={{ opacity: 0, animation: `j-429 ${LOOP}` }}
            >
              429 &middot; cooling
            </span>
            <span
              className="meta absolute inset-x-0 text-ink"
              style={{ opacity: 0, animation: `j-ok ${LOOP}` }}
            >
              200 OK
            </span>
          </div>
        )}
      </div>

    </div>
  );
}

export function Juggle() {
  return (
    <section id="juggle" className="scroll-mt-16 border-b border-line">
      <div className="shell py-20 lg:py-28">
        <Reveal>
          <h2 className="display d2 max-w-[18ch] text-ink">{juggle.claim}</h2>
        </Reveal>

        <Reveal delay={0.06} className="mt-10">
          <KeyRotation />
          <p className="meta mt-3 text-ink-faint">
            One request, throttled on the key it landed on and served by the next
          </p>
        </Reveal>

        <Reveal delay={0.1} className="mt-16 grid gap-x-14 gap-y-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="max-w-[58ch] text-[1.0625rem] leading-[1.75] text-ink">
              {juggle.description}
            </p>
            <p className="mt-5 max-w-[58ch] text-[1.0625rem] leading-[1.75] text-ink-soft">
              {juggle.aside}
            </p>
          </div>

          <div className="lg:col-span-5 lg:pt-1">
            <p className="meta text-ink-faint">
              {juggle.stats.map((s) => `${s.value} ${s.label}`).join("  ·  ")}
            </p>
            <p className="meta mt-3 text-ink-faint">{juggle.stack.join("  /  ")}</p>
            <p className="mt-6 max-w-[42ch] text-[14px] leading-relaxed text-ink-faint">
              {juggle.providers}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
              <a
                href={juggle.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-accent px-5 py-2.5 text-[14.5px] font-medium text-accent-ink transition-colors hover:bg-accent-hover"
              >
                Code on GitHub
                <ArrowUpRightIcon
                  size={16}
                  weight="bold"
                  className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </a>
              {/* The dashboard behind this is single-owner and password-gated, so it
                  is labelled as a site, never as a demo. */}
              <a
                href={juggle.live}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-1.5 whitespace-nowrap text-[14.5px] text-ink-soft underline decoration-line underline-offset-4 transition-colors hover:text-ink hover:decoration-line-strong"
              >
                Live site
                <ArrowUpRightIcon
                  size={14}
                  weight="bold"
                  className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </a>
            </div>
          </div>
        </Reveal>

      </div>
    </section>
  );
}
