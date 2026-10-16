"use client";

import { interests, profile } from "../data/content";
import { PullBackCar } from "./PullBackCar";
import { Reveal } from "./Reveal";

const byTitle = Object.fromEntries(interests.map((i) => [i.title, i]));

/** Plain cells sit straight on the orange with a hairline in the ink colour. */
const plain =
  "flex flex-col rounded-2xl border border-hw-ink/25 p-6 transition-colors duration-300 hover:border-hw-ink/50 sm:p-7";

function Plain({ title }: { title: string }) {
  const item = byTitle[title];
  return (
    <>
      <h3 className="display text-[1.5rem] text-hw-ink">{item.title}</h3>
      <p className="mt-2.5 max-w-[52ch] text-[14.5px] leading-[1.7] text-hw-ink/85">{item.body}</p>
    </>
  );
}

/**
 * The one loud section on the page: a full Hot Wheels orange block, set at the
 * biggest size anything on the site reaches, because this is the part that is
 * actually about fun. Everything else is a neutral sheet; this is a colour.
 */
export function OffTheClock() {
  const hw = byTitle["Hot Wheels"];
  const gaming = byTitle["Gaming"];

  return (
    <section id="off-the-clock" className="relative isolate scroll-mt-16 bg-hw text-hw-ink">
      <div
        aria-hidden="true"
        className="grain-dark pointer-events-none absolute inset-0 -z-10 opacity-[0.07]"
      />
      <div className="shell py-20 lg:py-28">
        <Reveal className="flex flex-wrap items-end justify-between gap-x-12 gap-y-5">
          <h2 className="display d-loud">Outside work.</h2>
          <p className="max-w-[34ch] text-[1.0625rem] leading-relaxed text-hw-ink/85">
            What I spend my evenings on.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Reveal className="relative overflow-hidden rounded-2xl bg-hw-ink p-6 text-white sm:col-span-2 sm:p-8">
            <span className="meta absolute top-6 right-6 rotate-12 rounded-full border-2 border-hw px-2.5 py-0.5 font-bold text-hw sm:top-8 sm:right-8">
              1:64
            </span>
            <h3 className="display text-[1.75rem] text-white">{hw.title}</h3>
            <p className="mt-2.5 max-w-[46ch] text-[15px] leading-[1.7] text-white/75">{hw.body}</p>
            <PullBackCar />
          </Reveal>

          <Reveal
            delay={0.05}
            className="flex flex-col overflow-hidden rounded-2xl bg-white p-6 text-hw-ink sm:p-7"
          >
            <h3 className="display text-[1.5rem]">{gaming.title}</h3>
            <p className="mt-2.5 text-[14.5px] leading-[1.7] text-hw-ink/80">{gaming.body}</p>
            <img
              src={profile.avatar}
              alt="Shreyas as a blocky game character in a white puffer jacket and glasses."
              width={500}
              height={500}
              className="mt-auto h-44 w-full origin-bottom object-contain pt-4 transition-transform duration-300 hover:-rotate-3 hover:scale-105"
              loading="lazy"
              decoding="async"
            />
          </Reveal>

          <Reveal delay={0.08} className={plain}>
            <Plain title="Vibe coding" />
          </Reveal>
          <Reveal delay={0.11} className={plain}>
            <Plain title="Cooking" />
          </Reveal>
          <Reveal delay={0.14} className={plain}>
            <Plain title="Reading" />
          </Reveal>

          <Reveal delay={0.17} className={`${plain} bg-hw-deep/40 sm:col-span-2 lg:col-span-3`}>
            <Plain title="Tutoring" />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
