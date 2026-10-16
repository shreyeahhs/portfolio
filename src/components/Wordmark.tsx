"use client";

import { useEffect, useRef, useState } from "react";

const WORD = "shreyeahhs";
// The one place on the page big enough for a 1.5px outline to read as drawing
// rather than as a hairline that lost its fill.
const TYPE = "display d-mark block whitespace-nowrap";

/** The fill stops in the middle of the second "e", which is half of ten letters. */
const STOP_INDEX = WORD.lastIndexOf("e");

/**
 * The page's sign-off. The name sits at the foot of the page in outline and is
 * filled with the accent from the left as far as the middle of the second "e" —
 * half the word. It is a fixed state, not a scroll-driven one: it looks the same
 * the moment it arrives and it stays that way.
 *
 * Where that "e" falls is measured from the rendered text rather than hard-coded,
 * so the stop lands in the same place at every size and after the font loads.
 */
export function Wordmark() {
  const outline = useRef<HTMLSpanElement>(null);
  // Fraction of the word's width at the middle of the "e". 0.5 is a fair guess
  // until the real measurement lands.
  const [stop, setStop] = useState(0.5);

  useEffect(() => {
    const el = outline.current;
    if (!el) return;

    function measure() {
      const text = el!.firstChild;
      const box = el!.getBoundingClientRect();
      if (!text || !box.width) return;
      const range = document.createRange();
      range.setStart(text, STOP_INDEX);
      range.setEnd(text, STOP_INDEX + 1);
      const glyph = range.getBoundingClientRect();
      setStop((glyph.left + glyph.width / 2 - box.left) / box.width);
    }

    measure();
    document.fonts?.ready.then(measure);
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  /*
   * A polygon rather than `inset()`, and one that runs well above and below the
   * element. At this leading the glyphs overflow their own line box by about a
   * seventh of their size, and any clip that stops at the box edge shears the
   * fill straight across the letters. Only the right-hand edge is doing work.
   */
  const x = stop * 100;
  const clipPath = `polygon(0% -60%, ${x}% -60%, ${x}% 160%, 0% 160%)`;

  return (
    <div aria-hidden="true" className="mt-8 select-none overflow-hidden px-3 sm:px-5">
      <div className="relative mx-auto w-fit">
        <span
          ref={outline}
          className={`${TYPE} text-transparent [-webkit-text-stroke:1.5px_var(--c-line-strong)]`}
        >
          {WORD}
        </span>
        <span className={`${TYPE} absolute inset-0 text-accent`} style={{ clipPath }}>
          {WORD}
        </span>
      </div>
    </div>
  );
}
