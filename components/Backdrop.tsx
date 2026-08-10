"use client";

import { useEffect, useRef, useState } from "react";
import type { Night } from "@/lib/nights";

/** Drop a hero illustration here and the scene rearranges around it. */
export const ART_SRC = "/background.webp";

/**
 * hqdefault, not maxresdefault: it exists for every video ever uploaded
 * (maxres does not, and a miss returns a grey placeholder), and resolution is
 * irrelevant once it is blurred into a colour wash.
 */
function thumb(videoId: string) {
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}

export type ArtState = "unknown" | "present" | "absent";

/**
 * Everything behind the ground, in order: tonight's sky, the hero
 * illustration if one has been added, a grade towards the night's colour, and
 * a wash of the playing track's cover art.
 *
 * The cover wash sits *above* the illustration deliberately. Underneath it
 * would be invisible — an opaque image occludes whatever is behind it — so
 * instead it tints the whole scene towards the current track at low strength.
 * The backdrop still answers to the music without competing with the art.
 */
export default function Backdrop({
  videoId,
  night,
  onArt,
}: {
  videoId: string;
  night: Night;
  onArt: (state: ArtState) => void;
}) {
  const [art, setArt] = useState<ArtState>("unknown");

  // Two slots at most: the outgoing cover and the incoming one over it.
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

  useEffect(() => {
    onArt(art);
  }, [art, onArt]);

  const imgRef = useRef<HTMLImageElement | null>(null);

  // The browser begins this request from the server-rendered markup, so by the
  // time React hydrates and attaches onLoad the image is frequently already
  // decoded — and an event that has already happened never fires again. Without
  // this the art loads perfectly and then sits at opacity 0 forever.
  useEffect(() => {
    const el = imgRef.current;
    if (el?.complete) setArt(el.naturalWidth > 0 ? "present" : "absent");
  }, []);

  const hasArt = art === "present";

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* tonight's sky — the whole backdrop when there is no illustration */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to bottom, ${night.sky[0]} 0%, ${night.sky[1]} 70%, ${night.sky[0]} 100%)`,
        }}
      />

      {/* The illustration, always at full strength and never gated on state.
          A missing file renders as nothing and the sky behind shows through,
          so the failure mode is "no art" rather than "no background at all".
          It previously faded in on a transition keyed to load detection, which
          meant every way that detection could go wrong — a cached decode
          beating the listener, a transition that never got to tick — hid a
          perfectly good image behind opacity 0. */}
      <img
        ref={imgRef}
        src={ART_SRC}
        alt=""
        aria-hidden="true"
        draggable={false}
        className="absolute inset-0 h-full w-full object-cover"
        onLoad={() => setArt("present")}
        onError={() => setArt("absent")}
      />

      {/* Grade the art towards tonight's colour. soft-light shifts the mood
          without flattening the illustration's own palette the way a `color`
          blend would — orange night and peacock-green night have to look like
          the same painting under different lights, not two different paintings. */}
      {hasArt && (
        <div
          className="absolute inset-0 mix-blend-soft-light"
          style={{ background: night.glow, opacity: 0.45 }}
        />
      )}

      {/* The cover-art wash. Barely-there over an illustration; the main event
          when there isn't one. */}
      <div
        className="absolute inset-0 transition-opacity duration-700"
        style={{
          opacity: hasArt ? 0.18 : 0.55,
          mixBlendMode: hasArt ? "soft-light" : "normal",
        }}
      >
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

      {/* Legibility for the wordmark at the top and the player at the bottom,
          without dimming the middle of the picture.

          Only when there is art to darken. GarbaGround draws its own vignette
          otherwise, and the two compound: 0.55 over 0.55 leaves a fifth of the
          light, 0.72 over 0.80 leaves a twentieth. Over a sky that starts at
          #2A0E04 that is not a mood, it is a black screen. */}
      {hasArt && (
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.10) 32%, rgba(0,0,0,0.18) 62%, rgba(0,0,0,0.72) 100%)",
          }}
        />
      )}
    </div>
  );
}
