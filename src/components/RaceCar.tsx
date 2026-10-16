import type { CSSProperties } from "react";
import { motion, type MotionValue } from "motion/react";

/*
 * Drawn on a 64 x 19 box (the viewBox starts at y = 1), facing right. Both
 * tyres touch y = 19, one unit above the bottom edge, so the car sits on
 * whatever line its box is placed on.
 *
 * Proportions are a racer's, not a road car's: long and low, a wedge that
 * rises from a splitter at the nose to a tall tail, a small bubble canopy set
 * well back, and wheels tucked up into the fenders with little ground showing.
 */
const W = 64;
const H = 19;

const REAR = { cx: 15, cy: 14.8, r: 4.2 };
const FRONT = { cx: 50, cy: 15.2, r: 3.8 };

const BODY =
  // The shell: tail, engine deck, bubble canopy, a crest over the front wheel,
  // the nose and its splitter. Both arches are over 180 degrees, because the
  // sills sit below the axles.
  "M2 16L2 9.2Q2 7.8 3.4 7.7L24 8.2C27 8.2 29 4.4 33 4.2L36 4.3C39 4.5 41.5 6.6 43.5 8.4" +
  "C45.4 9.1 47.6 8.6 50 8.7C51.8 8.8 53 9.1 54 9.5L61 12.2Q62.8 12.8 62.8 14.4L62.8 15.2L63.6 16" +
  "L54.53 16A4.6 4.6 0 1 0 45.47 16L19.85 16A5 5 0 1 0 10.15 16Z" +
  // The canopy glass.
  "M27.6 7.6C29.4 5.6 31 5.3 33.2 5.3L35.6 5.35C37.8 5.5 39.6 6.6 41 7.9Z" +
  // A speed stripe along the flank.
  "M21.4 11.4L45 11L44.8 12L21.4 12.5Z";

// The rear wing: endplate, plate and strut.
const WING = "M0.6 1.6L2 1.6L2 5L0.6 5ZM0.6 2.2L12.6 2.7L12.3 4.2L0.6 3.9ZM5.4 7.85L6.2 3.8L7.9 3.8L7.3 7.8Z";

function ring(cx: number, cy: number, r: number) {
  return `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z`;
}

const f = (n: number) => +n.toFixed(2);

/**
 * A tyre and a three-spoke mag wheel inside it. The spokes run from the hub
 * into the tyre, so the wheel holds together as one part, and they are the only
 * thing on it that is not round, so they are what shows it turning.
 */
function Wheel({ cx, cy, r, spin }: { cx: number; cy: number; r: number; spin?: MotionValue<number> }) {
  const inner = r * 0.62;
  const hub = r * 0.3;
  const half = r * 0.16;
  const reach = inner + r * 0.15;
  const spokes = [-90, 30, 150]
    .map((deg) => {
      const a = (deg * Math.PI) / 180;
      const [dx, dy, nx, ny] = [Math.cos(a), Math.sin(a), -Math.sin(a), Math.cos(a)];
      const pt = (along: number, side: number) =>
        `${f(cx + dx * along + nx * side)} ${f(cy + dy * along + ny * side)}`;
      return `M${pt(0, -half)}L${pt(reach, -half)}L${pt(reach, half)}L${pt(0, half)}Z`;
    })
    .join("");

  const parts = (
    <>
      <path fillRule="evenodd" d={ring(cx, cy, r) + ring(cx, cy, inner)} />
      {/* Separate shapes: in one path their windings cancel where they overlap. */}
      <circle cx={cx} cy={cy} r={hub} />
      <path d={spokes} />
    </>
  );

  if (!spin) return <g>{parts}</g>;
  return (
    <motion.g style={{ rotate: spin, transformBox: "fill-box", transformOrigin: "50% 50%" }}>
      {parts}
    </motion.g>
  );
}

/** Tyre radii, for anyone rolling the wheels: distance / radius is the turn. */
export const REAR_TYRE = REAR.r / W;
export const FRONT_TYRE = FRONT.r / W;

/**
 * A 1:64 race car in profile: a low wedge, a bubble canopy, a winged tail and a
 * bigger wheel at the back. One colour, `currentColor`, with the window and a stripe cut
 * out, so it reads on any ground it is put on. Pass `spinRear` and `spinFront`
 * (degrees) to roll the wheels.
 */
export function RaceCar({
  width,
  className,
  style,
  spinRear,
  spinFront,
}: {
  width: number;
  className?: string;
  style?: CSSProperties;
  spinRear?: MotionValue<number>;
  spinFront?: MotionValue<number>;
}) {
  return (
    <svg
      viewBox={`0 1 ${W} ${H}`}
      width={width}
      height={(width * H) / W}
      fill="currentColor"
      aria-hidden="true"
      className={className}
      style={style}
    >
      <path fillRule="evenodd" d={BODY} />
      <path d={WING} />
      <Wheel {...REAR} spin={spinRear} />
      <Wheel {...FRONT} spin={spinFront} />
    </svg>
  );
}
