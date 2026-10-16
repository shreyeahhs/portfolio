"use client";

import { useLayoutEffect, useRef } from "react";
import { motion, useMotionValue, useMotionValueEvent, useScroll } from "motion/react";
import { useReducedMotion } from "../lib/motion";

/**
 * The page's lighting. Two very large, very soft lights sit behind everything, one
 * warm (the accent) and one cool (slate). Each section has its own lighting recipe,
 * and as you scroll the lights slide, grow and fade from one recipe to the next, so
 * the room changes as you walk through it. Nothing follows the pointer.
 *
 * All of it is soft radial falloff, never pattern, so there is nothing for the eye
 * to lock on to. Everything moves through transform and opacity on motion values:
 * no React state, no scroll listener, no layout work while scrolling.
 */

type Light = { x: number; y: number; s: number; o: number };
type Recipe = { warm: Light; cool: Light };

// x and y are fractions of the viewport, s is a scale, o is opacity.
const RECIPES: Record<string, Recipe> = {
  top: { warm: { x: 0.86, y: 0.02, s: 1.0, o: 0.3 }, cool: { x: 0.04, y: 0.55, s: 0.8, o: 0.16 } },
  about: { warm: { x: 0.02, y: 0.7, s: 0.8, o: 0.18 }, cool: { x: 0.95, y: 0.1, s: 1.0, o: 0.2 } },
  work: { warm: { x: 0.96, y: 0.88, s: 0.9, o: 0.22 }, cool: { x: 0.12, y: 0.0, s: 0.75, o: 0.14 } },
  dashboards: { warm: { x: 0.5, y: 1.08, s: 1.05, o: 0.18 }, cool: { x: 0.9, y: 0.05, s: 0.85, o: 0.2 } },
  writing: { warm: { x: 0.1, y: 0.12, s: 1.0, o: 0.26 }, cool: { x: 1.0, y: 0.92, s: 0.7, o: 0.12 } },
  vele: { warm: { x: 0.94, y: 0.18, s: 0.7, o: 0.13 }, cool: { x: 0.06, y: 0.86, s: 1.1, o: 0.24 } },
  juggle: { warm: { x: 0.08, y: 0.9, s: 0.95, o: 0.24 }, cool: { x: 0.92, y: 0.12, s: 0.8, o: 0.15 } },
  history: { warm: { x: 1.02, y: 0.45, s: 0.7, o: 0.14 }, cool: { x: 0.0, y: 0.72, s: 1.05, o: 0.22 } },
  "off-the-clock": { warm: { x: 0.5, y: 0.5, s: 1.0, o: 0.3 }, cool: { x: 0.0, y: 0.0, s: 0.6, o: 0.08 } },
  assistant: { warm: { x: 0.5, y: 0.48, s: 0.85, o: 0.22 }, cool: { x: 0.02, y: 1.02, s: 0.8, o: 0.14 } },
  contact: { warm: { x: 0.8, y: 1.05, s: 1.1, o: 0.32 }, cool: { x: 0.1, y: 0.08, s: 0.8, o: 0.16 } },
};

const ORDER = Object.keys(RECIPES);
const BASE = 1.2; // light diameter, in multiples of the viewport's larger side

const ease = (t: number) => t * t * (3 - 2 * t);
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Where a light sits, in pixels, for a given recipe entry and viewport. The first
 * render always assumes a 1440x900 screen, on the server and in the browser alike,
 * so the markup hydrates without a mismatch; the layout effect below then puts the
 * lights where they belong before anything is painted.
 */
function resolve(l: Light, assumed = false) {
  const W = assumed ? 1440 : window.innerWidth;
  const H = assumed ? 900 : window.innerHeight;
  const D = Math.max(W, H) * BASE;
  return { x: l.x * W - D / 2, y: l.y * H - D / 2, s: l.s, o: l.o };
}

/**
 * Starts already lit with the hero's recipe, so the first paint is right even
 * before any animation frame runs, instead of flashing an unlit page.
 */
function useLight(initial: Light) {
  const r = resolve(initial, true);
  return { x: useMotionValue(r.x), y: useMotionValue(r.y), s: useMotionValue(r.s), o: useMotionValue(r.o) };
}

export function Ambient() {
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const warm = useLight(RECIPES.top.warm);
  const cool = useLight(RECIPES.top.cool);
  const anchors = useRef<{ id: string; mid: number }[]>([]);

  function place(light: ReturnType<typeof useLight>, l: Light) {
    const r = resolve(l);
    light.x.set(r.x);
    light.y.set(r.y);
    light.s.set(r.s);
    light.o.set(r.o);
  }

  function apply(y: number) {
    const list = anchors.current;
    if (!list.length) return;
    const centre = y + window.innerHeight / 2;

    let i = 0;
    while (i < list.length - 1 && list[i + 1].mid < centre) i++;
    const a = RECIPES[list[i].id];
    const next = list[Math.min(i + 1, list.length - 1)];
    const b = RECIPES[next.id];
    const span = next.mid - list[i].mid || 1;
    const t = centre <= list[0].mid ? 0 : ease(Math.min(1, Math.max(0, (centre - list[i].mid) / span)));

    const lerp = (p: Light, q: Light): Light => ({
      x: mix(p.x, q.x, t),
      y: mix(p.y, q.y, t),
      s: mix(p.s, q.s, t),
      o: mix(p.o, q.o, t),
    });
    place(warm, lerp(a.warm, b.warm));
    place(cool, lerp(a.cool, b.cool));
  }

  useMotionValueEvent(scrollY, "change", (y) => apply(y));

  // A layout effect, so the lights move from their assumed spot before the first paint.
  useLayoutEffect(() => {
    function measure() {
      anchors.current = ORDER.flatMap((id) => {
        const el = document.getElementById(id);
        if (!el) return [];
        const r = el.getBoundingClientRect();
        return [{ id, mid: r.top + window.scrollY + r.height / 2 }];
      });
      apply(window.scrollY);
    }

    measure();
    // Sections change height as images and fonts arrive, so re-measure when the page does.
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    window.addEventListener("resize", measure);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
    // Motion values are stable; this wires listeners once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce]);

  const size = `${BASE * 100}vmax`;
  const lightClass = "absolute top-0 left-0 rounded-full will-change-transform";

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-20 overflow-hidden"
      style={{ opacity: "var(--glow-mult)" }}
    >
      <motion.div
        className={lightClass}
        style={{
          width: size,
          height: size,
          x: warm.x,
          y: warm.y,
          scale: warm.s,
          opacity: warm.o,
          background:
            "radial-gradient(closest-side, var(--c-glow-warm), color-mix(in srgb, var(--c-glow-warm) 40%, transparent) 50%, transparent 100%)",
        }}
      />
      <motion.div
        className={lightClass}
        style={{
          width: size,
          height: size,
          x: cool.x,
          y: cool.y,
          scale: cool.s,
          opacity: cool.o,
          background:
            "radial-gradient(closest-side, var(--c-glow-cool), color-mix(in srgb, var(--c-glow-cool) 40%, transparent) 50%, transparent 100%)",
        }}
      />
    </div>
  );
}
