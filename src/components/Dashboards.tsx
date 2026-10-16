"use client";

import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  ArrowUpRightIcon,
  DownloadSimpleIcon,
  MagnifyingGlassPlusIcon,
  XIcon,
} from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import { useReducedMotion } from "../lib/motion";
import { dashboards, links, type Dashboard } from "../data/content";
import { useDialog, useInBrowser } from "../lib/dialog";
import { Reveal } from "./Reveal";

export function Dashboards() {
  const [open, setOpen] = useState<Dashboard | null>(null);
  const reduce = useReducedMotion();
  const closeRef = useRef<HTMLButtonElement>(null);

  useDialog(open !== null, () => setOpen(null), closeRef);
  const inBrowser = useInBrowser();

  return (
    <section id="dashboards" className="scroll-mt-16 overflow-hidden border-b border-line">
      <div className="shell pt-20 lg:pt-28">
        <Reveal className="grid gap-x-14 gap-y-5 lg:grid-cols-12">
          <h2 className="display d2 max-w-[16ch] text-ink lg:col-span-6">
            Power BI dashboards you can download.
          </h2>
          <p className="max-w-[52ch] text-[1.0625rem] leading-[1.75] text-ink-soft lg:col-span-6 lg:pt-2">
            Some use public data, some use datasets I just found fun. Download any of
            them and open them in Power BI. They’re MIT licensed, so do what you like.
          </p>
        </Reveal>
      </div>

      <Reveal delay={0.08}>
        <ul
          className="shell-inset mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-20 lg:pb-28 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label="Dashboard gallery"
        >
          {dashboards.map((d, i) => (
            <li key={d.title} className="w-[min(85vw,420px)] shrink-0 snap-start last:mr-5 sm:last:mr-8">
              <button
                type="button"
                onClick={() => setOpen(d)}
                aria-label={`View the ${d.title} dashboard full size`}
                className="group relative block w-full overflow-hidden rounded-xl border border-line bg-raised shadow-[0_1px_2px_rgb(var(--c-shadow)/0.06),0_12px_32px_-14px_rgb(var(--c-shadow)/0.2)]"
              >
                <img
                  src={d.image}
                  alt={`Screenshot of the ${d.title} dashboard.`}
                  className="aspect-[16/10] w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
                  loading="lazy"
                  decoding="async"
                />
                <span className="absolute inset-0 flex items-end justify-end bg-[#0c0c0d]/0 p-3 opacity-0 transition-all duration-300 group-hover:bg-[#0c0c0d]/25 group-hover:opacity-100">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 text-[12.5px] font-medium text-ink">
                    <MagnifyingGlassPlusIcon size={14} weight="bold" />
                    Full size
                  </span>
                </span>
              </button>

              <div className="mt-4 flex items-baseline gap-3">
                <span className="meta shrink-0 pt-1 text-ink-faint">
                  {String(i + 1).padStart(2, "0")}&thinsp;/&thinsp;
                  {String(dashboards.length).padStart(2, "0")}
                </span>
                <h3 className="display text-[1.35rem] text-ink">{d.title}</h3>
              </div>
              <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">{d.subject}</p>

              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
                <a
                  href={d.pbix}
                  download
                  className="inline-flex items-center gap-1.5 text-[13.5px] font-medium text-accent underline decoration-accent-line underline-offset-4 transition-colors hover:decoration-accent"
                >
                  <DownloadSimpleIcon size={15} weight="bold" />
                  Download .pbix
                </a>
                <a
                  href={d.repo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[13.5px] text-ink-soft transition-colors hover:text-ink"
                >
                  On GitHub
                  <ArrowUpRightIcon size={13} weight="bold" />
                </a>
              </div>
            </li>
          ))}

          <li className="flex w-[min(70vw,250px)] shrink-0 snap-start items-center last:mr-5 sm:last:mr-8">
            <a
              href={links.powerbi}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 text-[15px] font-medium text-ink transition-colors hover:text-accent"
            >
              All of them on GitHub
              <ArrowUpRightIcon
                size={16}
                weight="bold"
                className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </a>
          </li>
        </ul>
      </Reveal>

      {inBrowser &&
        createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={`${open.title}, full size`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduce ? 0 : 0.2 }}
              onClick={() => setOpen(null)}
              className="fixed inset-0 z-[60] flex items-center justify-center bg-[#0c0c0d]/85 p-4 backdrop-blur-sm sm:p-8"
            >
              <motion.img
                src={open.image}
                alt={`The ${open.title} dashboard.`}
                initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.97 }}
                transition={{ duration: reduce ? 0 : 0.25, ease: [0.16, 1, 0.3, 1] }}
                onClick={(e) => e.stopPropagation()}
                className="max-h-full max-w-full rounded-lg object-contain shadow-2xl"
              />
              <button
                ref={closeRef}
                type="button"
                onClick={() => setOpen(null)}
                aria-label="Close"
                className="absolute top-4 right-4 grid size-10 place-items-center rounded-full bg-surface text-ink transition-colors hover:bg-raised sm:top-6 sm:right-6"
              >
                <XIcon size={18} weight="bold" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </section>
  );
}
