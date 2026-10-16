import { useCallback, useSyncExternalStore } from "react";

export type Theme = "light" | "dark";

const KEY = "theme";

function systemTheme(): Theme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function stored(): Theme | null {
  try {
    const v = localStorage.getItem(KEY);
    return v === "light" || v === "dark" ? v : null;
  } catch {
    return null;
  }
}

/**
 * Runs `swap` inside a view transition, with the incoming theme clipped in as a
 * circle growing out of `origin` (the toggle). The animation itself lives in
 * `index.css`; all this does is hand it a centre and a radius big enough to
 * cover the furthest corner of the screen.
 *
 * Every branch still calls `swap`, so a browser without the API, or a visitor
 * who has asked for less motion, gets the theme change instantly rather than
 * not at all.
 */
function wipe(origin: { x: number; y: number } | null, swap: () => void) {
  const doc = document as Document & {
    startViewTransition?: (cb: () => void) => { finished: Promise<void> };
  };

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!doc.startViewTransition || reduce || !origin) {
    swap();
    return;
  }

  const { x, y } = origin;
  const far = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
  const root = document.documentElement;
  root.style.setProperty("--wipe-x", `${x}px`);
  root.style.setProperty("--wipe-y", `${y}px`);
  root.style.setProperty("--wipe-r", `${Math.ceil(far)}px`);

  doc.startViewTransition(swap);
}

/** Set by the toggle, so a choice holds for this visit even where storage is blocked. */
let chosen: Theme | null = null;
const CHANGE = "themechange";

/**
 * The theme as a plain string, so React can compare snapshots cheaply: the
 * visitor's choice if they made one, otherwise the system's.
 */
function snapshot(): Theme {
  return chosen ?? stored() ?? systemTheme();
}

function subscribe(onChange: () => void) {
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  mq.addEventListener("change", onChange);
  window.addEventListener(CHANGE, onChange);
  return () => {
    mq.removeEventListener("change", onChange);
    window.removeEventListener(CHANGE, onChange);
  };
}

/**
 * Follows the system preference until the visitor overrides it, then remembers
 * the override. The document attribute is what the stylesheet actually reads;
 * the inline script in the root layout restores it before the first paint.
 *
 * The server cannot know either, so it renders light, and React swaps in the
 * real value during hydration without calling it a mismatch.
 */
export function useTheme() {
  const theme = useSyncExternalStore(subscribe, snapshot, () => "light" as Theme);

  /** `origin` is where the wipe starts: the centre of the control that was pressed. */
  const toggle = useCallback(
    (origin?: { x: number; y: number }) => {
      const next: Theme = theme === "dark" ? "light" : "dark";

      wipe(origin ?? null, () => {
        // The view transition snapshots the DOM the moment this callback returns,
        // so the attribute is written here, synchronously.
        document.documentElement.setAttribute("data-theme", next);
        chosen = next;
        window.dispatchEvent(new Event(CHANGE));
      });

      try {
        localStorage.setItem(KEY, next);
      } catch {
        /* private mode: the choice still holds until the page is closed */
      }
    },
    [theme]
  );

  return { theme, toggle };
}
