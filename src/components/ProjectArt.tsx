"use client";

import {
  CarProfileIcon,
  FanIcon,
  FastForwardIcon,
  LightningIcon,
  MoonStarsIcon,
  SnowflakeIcon,
  YoutubeLogoIcon,
} from "@phosphor-icons/react";
import type { CSSProperties } from "react";
import type { Project } from "../data/content";

/** Stable pseudo-random numbers, so the same flake lands in the same place every render. */
const rand = (i: number, salt: number) => {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

function Snow() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-ink">
      {Array.from({ length: 38 }, (_, i) => {
        const size = 2 + rand(i, 2) * 4;
        const style = {
          left: `${rand(i, 1) * 100}%`,
          width: size,
          height: size,
          opacity: 0.35 + rand(i, 3) * 0.6,
          animationDuration: `${5 + rand(i, 4) * 6}s`,
          animationDelay: `${-rand(i, 5) * 11}s`,
          "--drift": `${(rand(i, 6) - 0.5) * 50}px`,
        } as CSSProperties;
        return (
          <span
            key={i}
            className="absolute top-0 animate-[fall_linear_infinite] rounded-full bg-page"
            style={style}
          />
        );
      })}
      <div className="absolute inset-0 grid place-items-center">
        <SnowflakeIcon size={104} weight="light" className="text-page" />
      </div>
    </div>
  );
}

function Turbine() {
  return (
    <div className="absolute inset-0 grid place-items-center bg-raised">
      <div className="grid size-44 place-items-center rounded-full border border-line-strong bg-surface shadow-[inset_0_2px_12px_rgb(0_0_0/0.08)]">
        <FanIcon
          size={128}
          weight="duotone"
          className="animate-spin text-ink [animation-duration:1.2s]"
        />
      </div>
    </div>
  );
}

function Night() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-ink">
      {Array.from({ length: 26 }, (_, i) => {
        const size = 2 + rand(i, 7) * 3;
        return (
          <span
            key={i}
            className="absolute animate-[twinkle_ease-in-out_infinite] rounded-full bg-page"
            style={{
              left: `${rand(i, 8) * 100}%`,
              top: `${rand(i, 9) * 100}%`,
              width: size,
              height: size,
              animationDuration: `${1.8 + rand(i, 10) * 2.4}s`,
              animationDelay: `${-rand(i, 11) * 3}s`,
            }}
          />
        );
      })}
      <div className="absolute inset-0 grid place-items-center">
        <MoonStarsIcon size={104} weight="light" className="text-page" />
      </div>
    </div>
  );
}

function Charge() {
  return (
    <div className="absolute inset-0 grid place-items-center bg-accent-wash">
      <div className="relative">
        <CarProfileIcon
          size={132}
          weight="duotone"
          className="animate-[idle_1.3s_ease-in-out_infinite] text-accent"
        />
        <span className="absolute -top-1 right-2 grid size-9 animate-pulse place-items-center rounded-full bg-accent text-accent-ink">
          <LightningIcon size={18} weight="fill" />
        </span>
      </div>
      <div className="absolute inset-x-10 bottom-[26%] h-px bg-accent-line" />
    </div>
  );
}

function Video() {
  const chapters = [4, 31, 58, 88];
  return (
    <div className="absolute inset-0 grid place-items-center bg-raised">
      <div className="w-[72%]">
        <YoutubeLogoIcon size={96} weight="duotone" className="mx-auto text-accent" />
        <div className="mt-8 flex items-center gap-3">
          <FastForwardIcon size={18} weight="fill" className="shrink-0 text-ink-soft" />
          <div className="relative h-1.5 flex-1 rounded-full bg-line">
            {chapters.map((c) => (
              <span
                key={c}
                className="absolute top-1/2 h-3 w-px -translate-y-1/2 bg-ink-faint"
                style={{ left: `${c}%` }}
              />
            ))}
            {/* A full-width layer translated by a percentage of the track; the dot rides on it. */}
            <span className="absolute inset-0 animate-[skip_4.8s_ease-in-out_infinite]">
              <span className="absolute top-1/2 left-0 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent shadow" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * A small moving scene for each project. Real screenshots are used where they
 * exist; otherwise it is an honest illustration drawn from the icon set, never a
 * fake screenshot of an interface.
 */
export function ProjectArt({ project }: { project: Project }) {
  if (project.image) {
    return (
      <img
        src={project.image}
        alt={`${project.title}.`}
        className="absolute inset-0 h-full w-full object-cover"
        loading="lazy"
        decoding="async"
      />
    );
  }

  switch (project.title) {
    case "Twin Engine":
      return <Turbine />;
    case "Glasgow Snow Prediction":
      return <Snow />;
    case "NightOut Planner":
      return <Night />;
    case "JLR EV Launch Delay":
      return <Charge />;
    case "YouTube Summarizer":
      return <Video />;
    default:
      return <div className="absolute inset-0 bg-raised" />;
  }
}
