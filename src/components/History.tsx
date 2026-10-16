"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { useReducedMotion } from "../lib/motion";
import { education, roles, skills } from "../data/content";
import { Reveal } from "./Reveal";

const groups = [
  { heading: "Now", items: roles.filter((r) => r.stage === "current") },
  { heading: "Before", items: roles.filter((r) => !r.stage) },
];

function GroupHeading({ children, count }: { children: string; count: string }) {
  return (
    <div className="flex items-baseline gap-4 border-t-2 border-ink pt-4">
      <h3 className="display d3 text-ink">{children}</h3>
      <span className="meta text-ink-faint">{count}</span>
    </div>
  );
}

function Row({
  left,
  meta,
  title,
  notes,
  tools,
  now,
}: {
  left: string;
  meta: string;
  title: string;
  notes: string[];
  tools?: string[];
  now?: boolean;
}) {
  return (
    <div className="relative grid gap-x-10 gap-y-3 border-t border-line py-7 first:border-t-0 md:grid-cols-12 md:pl-10">
      {/* The marker on the spine. Filled only for what he is doing right now. */}
      <span
        aria-hidden="true"
        className={`absolute top-8 -left-[3.5px] hidden size-[7px] rounded-full ring-4 ring-page md:block ${
          now ? "bg-accent" : "bg-line-strong"
        }`}
      />

      <div className="md:col-span-4">
        <p className="text-[15px] font-medium text-ink">{left}</p>
        <p className="tabular mt-1.5 text-[12.5px] text-ink-faint">{meta}</p>
      </div>

      <div className="md:col-span-8">
        <p className="text-[15px] text-ink">{title}</p>
        <ul className="mt-3 space-y-2">
          {notes.map((note, i) => (
            <li key={i} className="max-w-[62ch] text-[14.5px] leading-[1.65] text-ink-soft">
              {note}
            </li>
          ))}
        </ul>
        {tools && tools.length > 0 && (
          <p className="meta mt-4 text-ink-faint">{tools.join("  /  ")}</p>
        )}
      </div>
    </div>
  );
}

/**
 * The chronology hangs off a single hairline spine that fills with the accent as
 * you read down it, so a long list of similar rows has a direction and a place
 * to be. The fill is a scroll-linked transform on a motion value: no scroll
 * listener, no re-render, and with reduced motion it is simply drawn in full.
 */
export function History() {
  const spine = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: spine,
    offset: ["start 75%", "end 55%"],
  });
  const fill = useTransform(scrollYProgress, (v) => (reduce ? 1 : v));

  return (
    <section id="history" className="scroll-mt-16 border-b border-line">
      <div className="shell py-20 lg:py-28">
        <Reveal className="flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
          <h2 className="display d2 max-w-[16ch] text-ink">Where I&rsquo;ve worked and studied.</h2>
          <p className="meta text-ink-faint">{roles.length} roles &middot; 2 degrees</p>
        </Reveal>

        <div ref={spine} className="relative mt-16 space-y-20">
          <div
            aria-hidden="true"
            className="absolute inset-y-0 left-0 hidden w-px bg-line md:block"
          >
            <motion.div
              className="h-full w-px origin-top bg-accent"
              style={{ scaleY: fill }}
            />
          </div>

          {groups.map((group, gi) => (
            <Reveal key={group.heading} delay={gi * 0.05} className="md:pl-10">
              <GroupHeading
                count={`${group.items.length} ${group.items.length === 1 ? "role" : "roles"}`}
              >
                {group.heading}
              </GroupHeading>
              <div className="mt-2 md:-ml-10">
                {group.items.map((role) => (
                  <Row
                    key={`${role.org}-${role.title}`}
                    left={role.org}
                    meta={`${role.to ? `${role.from} to ${role.to}` : `From ${role.from}`}  /  ${role.place}`}
                    title={role.title}
                    notes={role.notes}
                    tools={role.tools}
                    now={role.stage === "current"}
                  />
                ))}
              </div>
            </Reveal>
          ))}

          <Reveal delay={0.1} className="md:pl-10">
            <GroupHeading count="2 degrees">Education</GroupHeading>
            <div className="mt-2 md:-ml-10">
              {education.map((e) => (
                <Row
                  key={e.award}
                  left={e.school}
                  meta={`${e.years}  /  ${e.place}`}
                  title={e.award}
                  notes={[e.note]}
                />
              ))}
            </div>
          </Reveal>

          {/* Skills are a different kind of content, so they take a different shape. */}
          <Reveal delay={0.12} className="md:pl-10">
            <GroupHeading count={`${skills.reduce((n, s) => n + s.items.length, 0)} things`}>
              Skills
            </GroupHeading>
            <div className="mt-8 grid gap-x-10 gap-y-7 sm:grid-cols-2 lg:grid-cols-3">
              {skills.map((s) => (
                <div key={s.group} className="border-t border-line pt-4">
                  <h4 className="meta text-ink-faint">{s.group}</h4>
                  <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
                    {s.items.map((item) => (
                      <li key={item} className="text-[14px] text-ink-soft">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
