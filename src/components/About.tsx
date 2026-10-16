"use client";

import { bio, glance } from "../data/content";
import { Reveal } from "./Reveal";

/**
 * Biography set like a feature opener: the title held in the left margin, the
 * text in a single narrow column beside it, the first paragraph a size larger
 * than the rest. The at-a-glance facts sit underneath as a plain table rather
 * than a sidebar, so nothing here is competing with the reading.
 */
export function About() {
  const [lead, ...rest] = bio;

  return (
    <section id="about" className="scroll-mt-16 border-b border-line">
      <div className="shell grid gap-x-16 gap-y-10 py-20 lg:grid-cols-12 lg:py-28">
        <Reveal className="lg:col-span-4">
          <h2 className="display d2 text-ink lg:sticky lg:top-28">A bit about me.</h2>
        </Reveal>

        <Reveal delay={0.06} className="lg:col-span-8 lg:pt-1.5">
          <p className="max-w-[46ch] text-[1.3rem] leading-[1.55] text-ink sm:text-[1.45rem]">
            {lead}
          </p>

          <div className="mt-7 space-y-5">
            {rest.map((para, i) => (
              <p key={i} className="max-w-[60ch] text-[1.0625rem] leading-[1.75] text-ink-soft">
                {para}
              </p>
            ))}
          </div>

          <dl className="mt-14 grid gap-x-10 border-t border-line sm:grid-cols-2">
            {glance.map((row) => (
              <div
                key={row.key}
                className="flex flex-col gap-1.5 border-b border-line py-4 sm:flex-row sm:gap-6"
              >
                <dt className="meta shrink-0 pt-0.5 text-ink-faint sm:w-24">{row.key}</dt>
                <dd className="text-[14.5px] leading-snug text-ink">{row.value}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </section>
  );
}
