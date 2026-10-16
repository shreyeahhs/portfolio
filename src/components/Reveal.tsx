"use client";

import { motion } from "motion/react";
import { useReducedMotion } from "../lib/motion";
import type { ReactNode } from "react";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * One reveal grammar for the whole page: content lifts a short distance as it
 * enters, once. It never fades from nothing. Opacity stays at 1, so if the
 * animation cannot run (a backgrounded tab, a crawler, a screenshot service, a
 * device that has paused animation frames) the content is simply there, a few
 * pixels low, instead of missing.
 *
 * It deliberately has no `amount` threshold. A percentage threshold is measured
 * against the element, not the screen, so a block taller than five viewports can
 * never reach 20% on-screen and would stay invisible forever. Even well short of
 * that, a tall block would sit blank until a fifth of it had scrolled past.
 * Triggering on first contact, slightly before the edge, keeps the page from
 * ever showing empty space where content should be.
 */
export function Reveal({
  children,
  delay = 0,
  className,
  as = "div",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "section" | "li" | "article" | "header";
}) {
  const reduce = useReducedMotion();
  const Tag = motion[as];

  return (
    <Tag
      className={className}
      initial={reduce ? false : { y: 16 }}
      whileInView={{ y: 0 }}
      viewport={{ once: true, margin: "0px 0px 15% 0px" }}
      transition={{ duration: 0.5, delay, ease: EASE }}
    >
      {children}
    </Tag>
  );
}

export { EASE };
