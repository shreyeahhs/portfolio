"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowSquareOutIcon, PlayIcon, XIcon } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import { useReducedMotion } from "../lib/motion";
import { projects } from "../data/content";
import { useDialog, useInBrowser } from "../lib/dialog";

const sim = projects[0];

/**
 * The Living Ecosystem Simulator, actually running, rather than a picture of it.
 *
 * The thumbnail stays a still frame until someone asks for it, for two reasons:
 * the simulation is hosted on a free instance that sleeps, so autoplaying it would
 * make every visitor pay a cold start; and it carries its own controls, which need
 * far more room than a hero column has. So running it opens it at full size.
 */
export function LiveSim() {
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const reduce = useReducedMotion();
  const closeRef = useRef<HTMLButtonElement>(null);
  const settling = useRef(0);

  useDialog(open, () => setOpen(false), closeRef);
  const inBrowser = useInBrowser();

  /**
   * The frame's load event fires on the first HTML response, but the simulator
   * then pulls in a few dozen sprite sheets. On a cold instance that gap is long
   * enough to look broken, so the notice outstays the load event.
   */
  function settle() {
    window.clearTimeout(settling.current);
    settling.current = window.setTimeout(() => setLoaded(true), 2600);
  }

  // Closing inside that window must cancel it, or the next open skips the notice
  // while a cold instance is still waking.
  useEffect(() => {
    if (open) return;
    window.clearTimeout(settling.current);
    setLoaded(false);
  }, [open]);

  useEffect(() => () => window.clearTimeout(settling.current), []);

  return (
    <>
      <figure className="m-0">
        {/*
         * Framed like a plate in a book: the picture, then a hairline, then its
         * caption on the same sheet. The badge is not decoration — the thing
         * behind the poster really is running.
         */}
        <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-[0_1px_2px_rgb(var(--c-shadow)/0.06),0_12px_32px_-12px_rgb(var(--c-shadow)/0.18)]">
          <div className="group relative">
            <img
              src={sim.image}
              width={1121}
              height={692}
              alt="The Living Ecosystem Simulator: grassland with rabbits, foxes, rocks and a river, in pixel art."
              className="aspect-[8/5] w-full object-cover"
              loading="eager"
              decoding="async"
            />

            <span className="meta absolute top-3 left-3 inline-flex items-center gap-2 rounded-full bg-page/85 px-2.5 py-1 text-ink backdrop-blur-sm">
              <span
                aria-hidden="true"
                className="size-1.5 rounded-full bg-accent motion-safe:animate-[beacon_1.8s_ease-in-out_infinite]"
              />
              Live
            </span>

            <div className="absolute inset-0 grid place-items-center bg-[#0c0c0d]/45 transition-colors group-hover:bg-[#0c0c0d]/28">
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="inline-flex items-center gap-2.5 rounded-full bg-accent px-5 py-3 text-[14.5px] font-medium text-accent-ink shadow-[0_8px_24px_-6px_rgb(0_0_0/0.45)] transition-transform hover:bg-accent-hover group-hover:scale-[1.03] active:scale-[0.98]"
              >
                <PlayIcon size={17} weight="fill" />
                Run it here
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 border-t border-line px-3.5 py-2.5">
            <span className="meta truncate text-ink-faint">{sim.stack.join(" / ")}</span>
            <a
              href={sim.live}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center gap-1.5 text-[12.5px] text-ink-soft transition-colors hover:text-ink"
            >
              Open separately
              <ArrowSquareOutIcon size={12} />
            </a>
          </div>
        </div>

        <figcaption className="mt-3 text-[13px] leading-relaxed text-ink-faint">
          My ecosystem simulator, running for real. Press play and watch it eat itself.
        </figcaption>
      </figure>

      {inBrowser &&
        createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Living Ecosystem Simulator, running"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduce ? 0 : 0.2 }}
              className="fixed inset-0 z-[70] flex flex-col bg-[#0c0c0d]/92 p-3 backdrop-blur-sm sm:p-6"
            >
              <div className="mx-auto flex w-full max-w-[1300px] items-center justify-between gap-4 pb-3">
                <div className="min-w-0">
                  <p className="truncate text-[15px] font-medium text-[#f4f4f5]">
                    Living Ecosystem Simulator
                  </p>
                  <p className="truncate text-[12.5px] text-[#a1a1aa]">
                    Hit start, change the speed, then try setting a fire or spreading a disease.
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <a
                    href={sim.live}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hidden items-center gap-1.5 rounded-full border border-[#3a3a41] px-3.5 py-2 text-[13px] text-[#f4f4f5] transition-colors hover:border-[#a1a1aa] sm:inline-flex"
                  >
                    Open separately
                    <ArrowSquareOutIcon size={13} />
                  </a>
                  <button
                    ref={closeRef}
                    type="button"
                    onClick={() => setOpen(false)}
                    aria-label="Close the simulation"
                    className="grid size-10 place-items-center rounded-full bg-[#f4f4f5] text-[#17171a] transition-opacity hover:opacity-85"
                  >
                    <XIcon size={18} weight="bold" />
                  </button>
                </div>
              </div>

              <div className="relative mx-auto w-full max-w-[1300px] flex-1 overflow-hidden rounded-xl border border-[#3a3a41] bg-[#0c0c0d]">
                <iframe
                  src={sim.live}
                  title="Living Ecosystem Simulator, running live"
                  onLoad={settle}
                  className="h-full w-full border-0"
                  sandbox="allow-scripts allow-same-origin"
                />
                {!loaded && (
                  <div className="absolute inset-0 grid place-items-center px-6 text-center">
                    <div>
                      <div className="mx-auto h-1 w-44 overflow-hidden rounded-full bg-[#26262a]">
                        <div className="h-full w-1/3 animate-[wake_1.4s_ease-in-out_infinite] rounded-full bg-accent" />
                      </div>
                      <p className="mt-4 text-[14.5px] text-[#f4f4f5]">Waking it up.</p>
                      <p className="mx-auto mt-1 max-w-[42ch] text-[13px] leading-relaxed text-[#a1a1aa]">
                        It lives on a free server that falls asleep, so the first load can
                        take up to a minute. After that it’s quick.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
