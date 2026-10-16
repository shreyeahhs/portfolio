"use client";

import { useEffect, useState } from "react";
import { ChatCircleDotsIcon } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import { useReducedMotion } from "../lib/motion";

/**
 * A labelled way into the chatbot, because an unlabelled icon reads as
 * decoration. It appears once the hero is behind you, steps aside while the chat
 * itself is on screen, and stays gone once you have scrolled past it.
 */
export function ChatLauncher() {
  const [pastHero, setPastHero] = useState(false);
  const [chatVisible, setChatVisible] = useState(false);
  const [pastChat, setPastChat] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    const hero = document.getElementById("top");
    const chat = document.getElementById("assistant");
    if (!hero || !chat) return;

    const heroWatch = new IntersectionObserver(
      ([e]) => setPastHero(!e.isIntersecting),
      { rootMargin: "-120px 0px 0px 0px" }
    );
    const chatWatch = new IntersectionObserver(
      ([e]) => {
        // isIntersecting is true for any overlap, so judge by how much is showing.
        const showing = e.intersectionRatio >= 0.15;
        setChatVisible(showing);
        // Below the chat, the button would only cover the footer; drop it there.
        setPastChat(!showing && e.boundingClientRect.top < 0);
      },
      { threshold: [0, 0.15, 0.5] }
    );

    heroWatch.observe(hero);
    chatWatch.observe(chat);
    return () => {
      heroWatch.disconnect();
      chatWatch.disconnect();
    };
  }, []);

  const shown = pastHero && !chatVisible && !pastChat;

  return (
    <AnimatePresence>
      {shown && (
        <motion.a
          href="#assistant"
          onClick={() => {
            window.setTimeout(() => {
              document.getElementById("assistant-input")?.focus({ preventScroll: true });
            }, 700);
          }}
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: 14, scale: 0.96 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="group fixed right-4 bottom-4 z-50 inline-flex items-center gap-2.5 rounded-full border border-line bg-surface py-2.5 pr-4 pl-2.5 shadow-lg transition-colors hover:border-line-strong sm:right-6 sm:bottom-6"
        >
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-accent text-accent-ink">
            <ChatCircleDotsIcon size={17} weight="fill" />
          </span>
          <span className="text-[14px] font-medium whitespace-nowrap text-ink">
            Ask about Shreyas
          </span>
        </motion.a>
      )}
    </AnimatePresence>
  );
}
