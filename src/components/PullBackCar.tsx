"use client";

import { useRef, useState } from "react";
import { FlagCheckeredIcon } from "@phosphor-icons/react";
import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { useReducedMotion } from "../lib/motion";
import { FRONT_TYRE, RaceCar, REAR_TYRE } from "./RaceCar";

const PULL = 72; // how far back the car can be dragged, in px
const CAR = 88;

/** Degrees a tyre turns for every pixel the car rolls, so the wheels never skid. */
const turn = (tyre: number) => 180 / (Math.PI * tyre * CAR);

/**
 * A pull-back toy car. Drag it back, let go, and it runs down the track: the
 * further you pull, the further it goes. The button does the same for anyone not
 * using a pointer. Position lives in a motion value, so dragging never re-renders.
 */
export function PullBackCar() {
  const trackRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const reduce = useReducedMotion();
  const squat = useTransform(x, [-PULL, 0], [-7, 0]);
  const spinRear = useTransform(x, (v) => v * turn(REAR_TYRE));
  const spinFront = useTransform(x, (v) => v * turn(FRONT_TYRE));

  const [running, setRunning] = useState(false);
  const [runs, setRuns] = useState(0);
  const [best, setBest] = useState(0);
  const [last, setLast] = useState<number | null>(null);

  async function launch(power: number) {
    const track = trackRef.current;
    if (!track || running) return;
    setRunning(true);

    const p = Math.min(1, Math.max(0.12, power));
    const room = track.clientWidth - PULL - CAR - 12;

    await animate(
      x,
      room * p,
      reduce ? { duration: 0 } : { duration: 0.45 + p * 0.75, ease: [0.1, 0.85, 0.3, 1] }
    );

    const pct = Math.round(p * 100);
    setLast(pct);
    setRuns((n) => n + 1);
    setBest((b) => Math.max(b, pct));

    await animate(x, 0, reduce ? { duration: 0 } : { delay: 0.7, duration: 1, ease: "easeInOut" });
    setRunning(false);
  }

  let line = "Pull the car back and let go.";
  if (last !== null) {
    line =
      last === 100
        ? "All the way to the flag. Nice."
        : last < 30
          ? `That one crawled ${last}% of the way. Pull harder.`
          : `That one went ${last}% of the way.`;
  }

  return (
    <div>
      <div ref={trackRef} className="relative mt-7 h-20 select-none">
        {/* the track */}
        <div className="absolute inset-x-0 bottom-2 h-3 rounded-full bg-hw [background-image:repeating-linear-gradient(90deg,transparent_0_22px,rgb(26_13_5/0.18)_22px_26px)]" />
        {/* start line */}
        <div className="absolute bottom-0 h-7 w-0.5 rounded-full bg-white/70" style={{ left: PULL + 4 }} />
        {/* flag */}
        <FlagCheckeredIcon size={22} weight="fill" className="absolute right-0 bottom-6 text-white/85" />

        <motion.div
          aria-hidden="true"
          drag={running ? false : "x"}
          dragConstraints={{ left: -PULL, right: 0 }}
          dragElastic={0.04}
          dragMomentum={false}
          onDragEnd={() => launch(-x.get() / PULL)}
          // Pulled back, it squats on its rear wheel, the way the toy does.
          style={{ x, rotate: squat, left: PULL, width: CAR, originX: 0.23, originY: 1 }}
          className={`absolute bottom-[18.5px] touch-none text-white ${
            running ? "cursor-default" : "cursor-grab active:cursor-grabbing"
          }`}
        >
          {running && !reduce && (
            <span className="pointer-events-none absolute top-1/2 right-full mr-1 flex -translate-y-1/2 flex-col gap-1.5">
              <span className="block h-0.5 w-7 rounded-full bg-white/60" />
              <span className="ml-3 block h-0.5 w-5 rounded-full bg-white/40" />
              <span className="block h-0.5 w-8 rounded-full bg-white/50" />
            </span>
          )}
          <RaceCar width={CAR} className="block" spinRear={spinRear} spinFront={spinFront} />
        </motion.div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <p className="text-[14px] text-white/75" aria-live="polite">
          {line}
          {runs > 1 && <span className="text-white/55"> Best so far: {best}%.</span>}
        </p>
        <button
          type="button"
          onClick={() => launch(0.55 + Math.random() * 0.45)}
          disabled={running}
          className="rounded-full bg-hw px-4 py-2 text-[13.5px] font-semibold text-hw-ink transition-transform hover:scale-[1.03] active:scale-[0.98] disabled:opacity-50"
        >
          {running ? "Vroom" : "Launch it"}
        </button>
      </div>
    </div>
  );
}
