import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

/**
 * Motion's useReducedMotion, made safe to render on the server.
 *
 * The server cannot know the visitor's setting, so it renders the full-motion
 * page. Motion's own hook answers `true` on the very first client render, which
 * makes components like the Juggle diagram render different elements from the
 * server's and fails hydration. This answers `false` while hydrating, matching
 * the server, and the real value immediately afterwards. The root's
 * <MotionConfig reducedMotion="user"> covers the moment in between: any
 * transform that starts animating then is applied instantly instead.
 */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, () => window.matchMedia(QUERY).matches, () => false);
}
