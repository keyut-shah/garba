"use client";

import { useEffect, useRef } from "react";

/** Far enough that a tap with a shaky thumb never counts as a swipe. */
const DISTANCE = 55;
/** Horizontal travel must beat vertical by this much to count as intent. */
const DIRECTION_BIAS = 1.4;

/**
 * Anything whose own job involves dragging or tapping horizontally. The seek
 * bar is the important one — it is a div, not an input, so it needs the
 * explicit marker or scrubbing a track would also skip the night.
 */
const IGNORE = "[data-no-swipe], button, a, input, [role='tablist']";

/**
 * Swipe left/right anywhere on the ground.
 *
 * Pointer events rather than touch events, so a trackpad drag works the same
 * as a thumb and there is one code path to reason about.
 */
export function useSwipe(onSwipe: (direction: 1 | -1) => void) {
  const cb = useRef(onSwipe);
  cb.current = onSwipe;

  useEffect(() => {
    let startX = 0;
    let startY = 0;
    let tracking = false;

    const down = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest(IGNORE)) return;
      tracking = true;
      startX = e.clientX;
      startY = e.clientY;
    };

    const up = (e: PointerEvent) => {
      if (!tracking) return;
      tracking = false;

      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      if (Math.abs(dx) < DISTANCE) return;
      // A mostly-vertical drag is a scroll attempt, not a night change.
      if (Math.abs(dx) < Math.abs(dy) * DIRECTION_BIAS) return;

      cb.current(dx < 0 ? 1 : -1);
    };

    const cancel = () => {
      tracking = false;
    };

    window.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", cancel);
    return () => {
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", cancel);
    };
  }, []);
}
