"use client";

import { useEffect, useRef, useState } from "react";
import type { Night } from "@/lib/nights";

/**
 * hqdefault, not maxresdefault: it exists for every video ever uploaded
 * (maxres does not, and the miss returns a grey placeholder), it is a few KB,
 * and none of that matters at 90px of blur anyway.
 */
function thumb(videoId: string) {
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}

/**
 * The current track's cover art, blurred past recognition, as the sky behind
 * the ground — so the backdrop changes with every song instead of sitting
 * there. Tinted towards the night's colour so a Bollywood thumbnail can't drag
 * the palette away from whichever of the nine nights we are on.
 */
export default function CoverBackdrop({
  videoId,
  night,
}: {
  videoId: string;
  night: Night;
}) {
  // Two slots at most: the outgoing cover and the incoming one on top of it.
  const [slots, setSlots] = useState<{ id: string; k: number }[]>([
    { id: videoId, k: 0 },
  ]);
  const seq = useRef(0);

  useEffect(() => {
    setSlots((prev) => {
      if (prev[prev.length - 1]?.id === videoId) return prev;
      seq.current += 1;
      return [...prev, { id: videoId, k: seq.current }].slice(-2);
    });
  }, [videoId]);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* the night's own sky, which the cover only ever tints */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to bottom, ${night.sky[0]} 0%, ${night.sky[1]} 70%, ${night.sky[0]} 100%)`,
        }}
      />

      <div className="absolute inset-0 opacity-55">
        {slots.map((slot, i) => (
          <img
            key={slot.k}
            src={thumb(slot.id)}
            alt=""
            aria-hidden="true"
            draggable={false}
            className="absolute left-1/2 top-1/2 h-[150%] w-[150%] -translate-x-1/2 -translate-y-1/2 object-cover"
            style={{
              filter: "blur(90px) saturate(1.7)",
              // The newest slot fades in over the one below; the old slot is
              // dropped only once this reaches full, so the swap is invisible.
              animation:
                i === slots.length - 1 && slot.k > 0
                  ? "coverIn 1400ms ease forwards"
                  : undefined,
            }}
            onAnimationEnd={() =>
              setSlots((prev) => (prev.length > 1 ? prev.slice(-1) : prev))
            }
          />
        ))}
      </div>

      {/* pull whatever colour the thumbnail had towards tonight's colour */}
      <div
        className="absolute inset-0 mix-blend-color"
        style={{ background: night.glow, opacity: 0.55 }}
      />

      {/* keep the wordmark and the player legible over a bright cover */}
      <div className="absolute inset-0 bg-black/35" />
    </div>
  );
}
