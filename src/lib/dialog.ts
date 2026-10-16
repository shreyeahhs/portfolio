import { useEffect, useRef, useSyncExternalStore, type RefObject } from "react";

/**
 * What a modal owes the keyboard. While it is open, the whole app behind it is
 * `inert`, so Tab cannot wander out to the page underneath and screen readers
 * only hear the dialog; focus starts on `initial`; Escape closes it; the page
 * stops scrolling. When it closes, focus goes back to whatever opened it.
 *
 * This only works because the dialog is portalled to <body>, outside #root.
 * Rendered inline, `inert` on the app would disable the dialog as well.
 */
export function useDialog(open: boolean, onClose: () => void, initial: RefObject<HTMLElement | null>) {
  const close = useRef(onClose);
  close.current = onClose;

  useEffect(() => {
    if (!open) return;

    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const app = document.getElementById("root");
    app?.setAttribute("inert", "");
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    initial.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close.current();
    };
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      app?.removeAttribute("inert");
      opener?.focus({ preventScroll: true });
    };
  }, [open, initial]);
}

const noSubscribe = () => () => {};

/**
 * False on the server and during hydration, true in the browser afterwards. A
 * portal into document.body can only be rendered once this is true.
 */
export function useInBrowser() {
  return useSyncExternalStore(noSubscribe, () => true, () => false);
}
