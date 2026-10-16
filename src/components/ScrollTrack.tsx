"use client";

import { useState } from "react";
import { FlagCheckeredIcon } from "@phosphor-icons/react";
import { motion, useMotionValueEvent, useScroll, useSpring, useTransform } from "motion/react";
import { useReducedMotion } from "../lib/motion";
import { RaceCar } from "./RaceCar";

// The same car as the pull-back game, at the size of the nav's floor.
const CAR = 34;

/**
 * Reading progress, as a Hot Wheels track. A car drives along the bottom edge of
 * the nav as the page scrolls, faces whichever way you are going, and reaches a
 * chequered flag at the end.
 *
 * Position is driven by motion values, not React state, so scrolling never
 * re-renders anything. The only state is the car's heading and whether it has
 * finished, and both change rarely.
 */
export function ScrollTrack() {
  const { scrollYProgress } = useScroll();
  const reduce = useReducedMotion();
  const eased = useSpring(scrollYProgress, { stiffness: 160, damping: 28, mass: 0.35 });
  const progress = reduce ? scrollYProgress : eased;

  const carLeft = useTransform(progress, (v) => `calc(${v * 100}% - ${v * CAR}px)`);
  const fillWidth = useTransform(progress, (v) => `${v * 100}%`);

  const [reversing, setReversing] = useState(false);
  const [finished, setFinished] = useState(false);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const prev = scrollYProgress.getPrevious() ?? v;
    if (v < prev - 0.0005) setReversing(true);
    else if (v > prev + 0.0005) setReversing(false);
    setFinished(v > 0.995);
  });

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-px">
      <div className="absolute inset-0 bg-line" />
      <motion.div className="absolute inset-y-0 left-0 h-[2px] -translate-y-px bg-hw" style={{ width: fillWidth }} />

      <motion.div className="absolute bottom-0 text-hw" style={{ left: carLeft }}>
        <RaceCar
          width={CAR}
          className="block transition-transform duration-200"
          style={{ transform: reversing ? "scaleX(-1)" : undefined }}
        />
      </motion.div>

      <div
        className={`absolute right-1 bottom-0.5 transition-colors duration-300 ${
          finished ? "text-hw" : "text-ink-faint/60"
        }`}
      >
        <FlagCheckeredIcon size={14} weight="fill" />
      </div>
    </div>
  );
}
