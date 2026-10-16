"use client";

import { MotionConfig } from "motion/react";
import { About } from "./components/About";
import { Ambient } from "./components/Ambient";
import { Assistant } from "./components/Assistant";
import { ChatLauncher } from "./components/ChatLauncher";
import { Contact } from "./components/Contact";
import { Dashboards } from "./components/Dashboards";
import { Footer } from "./components/Footer";
import { Hero } from "./components/Hero";
import { History } from "./components/History";
import { Juggle } from "./components/Juggle";
import { Nav } from "./components/Nav";
import { OffTheClock } from "./components/OffTheClock";
import { Terrain } from "./components/Terrain";
import { Vele } from "./components/Vele";
import { Work } from "./components/Work";
import { Writing } from "./components/Writing";

export default function Site() {
  return (
    // Visitors who ask for less motion get every transform applied instantly.
    <MotionConfig reducedMotion="user">
      <a
        href="#about"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[70] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-[14px] focus:text-page"
      >
        Skip to content
      </a>

      <Ambient />
      <Terrain />
      <div aria-hidden="true" className="grain pointer-events-none fixed inset-0 -z-10" />
      <Nav />

      <main>
        <Hero />
        <About />
        <Work />
        <Dashboards />
        <Writing />
        <Vele />
        <Juggle />
        <History />
        <OffTheClock />
        <Assistant />
        <Contact />
      </main>

      <Footer />
      <ChatLauncher />
    </MotionConfig>
  );
}
