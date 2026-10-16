"use client";

import { useState } from "react";
import { ArrowUpRightIcon, GithubLogoIcon } from "@phosphor-icons/react";
import { projects, type Project } from "../data/content";
import { ProjectArt } from "./ProjectArt";
import { Reveal } from "./Reveal";

const total = String(projects.length).padStart(2, "0");

/** The framed plate: picture, hairline, caption. Same construction as the hero's. */
function Plate({ project, index }: { project: Project; index: number }) {
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-[0_1px_2px_rgb(var(--c-shadow)/0.06),0_12px_32px_-12px_rgb(var(--c-shadow)/0.18)]">
      <div className="relative aspect-[16/10]">
        <ProjectArt project={project} />
      </div>
      <div className="flex items-center justify-between gap-4 border-t border-line px-3.5 py-2.5">
        <span className="meta text-ink-faint">
          {String(index + 1).padStart(2, "0")} / {total}
        </span>
        <span className="meta truncate text-ink-faint">{project.stack.join(" / ")}</span>
      </div>
    </div>
  );
}

function Details({ project }: { project: Project }) {
  return (
    <>
      <h3 className="display d3 text-ink">{project.title}</h3>
      <p className="mt-3.5 max-w-[58ch] text-[15.5px] leading-[1.7] text-ink-soft">
        {project.blurb}
      </p>
      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2">
        {project.live && (
          <a
            href={project.live}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-1.5 text-[14px] font-medium text-accent underline decoration-accent-line underline-offset-4 transition-colors hover:decoration-accent"
          >
            Try it
            <ArrowUpRightIcon
              size={14}
              weight="bold"
              className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </a>
        )}
        <a
          href={project.repo}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-[14px] text-ink-soft transition-colors hover:text-ink"
        >
          <GithubLogoIcon size={15} />
          Code
        </a>
      </div>
    </>
  );
}

/**
 * An index rather than a grid: run down the titles on the left and each one
 * plays on the right. The chosen line is underscored in the accent, drawn from
 * the left, so the eye can find its place without any of the rows becoming a
 * box. On small screens the plate opens inline under the chosen title, because
 * a panel off to the side would be off screen.
 */
export function Work() {
  const [active, setActive] = useState(0);
  const current = projects[active];

  return (
    <section id="work" className="scroll-mt-16 border-b border-line">
      <div className="shell py-20 lg:py-28">
        <Reveal className="flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
          <h2 className="display d2 text-ink">Things I&rsquo;ve built.</h2>
          <p className="max-w-[26ch] text-[15px] text-ink-soft">
            Run down the list. Whichever one you land on plays.
          </p>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-x-14 gap-y-10 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <ol className="border-b border-line">
              {projects.map((p, i) => {
                const on = i === active;
                return (
                  <li key={p.title} className="relative border-t border-line">
                    <button
                      type="button"
                      onMouseEnter={() => setActive(i)}
                      onFocus={() => setActive(i)}
                      onClick={() => setActive(i)}
                      aria-pressed={on}
                      aria-controls="work-preview"
                      className="group flex w-full items-baseline gap-4 py-6 text-left sm:gap-5"
                    >
                      <span
                        className={`tabular w-11 shrink-0 text-[12px] transition-colors ${
                          on ? "text-accent" : "text-ink-faint"
                        }`}
                      >
                        {p.year}
                      </span>
                      <span
                        className={`display text-[1.5rem] transition-colors sm:text-[1.85rem] ${
                          on ? "text-ink" : "text-ink-faint group-hover:text-ink-soft"
                        }`}
                      >
                        {p.title}
                      </span>
                    </button>

                    {/* The chosen line, underscored. Transform only, so it glides. */}
                    <span
                      aria-hidden="true"
                      className={`absolute -bottom-px left-0 h-px w-full origin-left bg-accent transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                        on ? "scale-x-100" : "scale-x-0"
                      }`}
                    />

                    {on && (
                      <div className="pb-8 lg:hidden">
                        <Plate project={p} index={i} />
                        <div className="mt-5">
                          <Details project={p} />
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ol>
          </Reveal>

          <div
            id="work-preview"
            aria-live="polite"
            className="hidden self-start lg:sticky lg:top-24 lg:col-span-7 lg:block"
          >
            <div key={active} className="animate-[settle_0.45s_cubic-bezier(0.16,1,0.3,1)]">
              <Plate project={current} index={active} />
              <div className="mt-6">
                <Details project={current} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
