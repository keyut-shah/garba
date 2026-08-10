"use client";

import { useRef } from "react";
import { coverUrl, PHASE_LABEL, type Track } from "@/lib/tracks";
import type { Progress } from "@/lib/useYouTube";

function clock(s: number) {
  if (!isFinite(s) || s < 0) s = 0;
  const m = Math.floor(s / 60);
  return `${m}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
}

export default function PlayerCard({
  track,
  progress,
  playing,
  buffering,
  ready,
  accent,
  onToggle,
  onPrev,
  onNext,
  onSeek,
}: {
  track: Track;
  progress: Progress;
  playing: boolean;
  buffering: boolean;
  ready: boolean;
  accent: string;
  onToggle: () => void;
  onPrev: () => void;
  onNext: () => void;
  onSeek: (fraction: number) => void;
}) {
  const barRef = useRef<HTMLDivElement | null>(null);
  const duration = progress.duration || track.seconds;
  const pct = duration ? Math.min(100, (progress.current / duration) * 100) : 0;

  function seekFromEvent(clientX: number) {
    const el = barRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    onSeek(Math.max(0, Math.min(1, (clientX - r.left) / r.width)));
  }

  return (
    /* data-no-swipe: the seek bar is a plain div, so without this marker
       scrubbing a track would also swipe the night out from under you. */
    <div className="w-full max-w-xl" data-no-swipe>
      <div className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-black/35 p-3 backdrop-blur-xl sm:gap-4 sm:p-3.5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={coverUrl(track.id)}
          alt=""
          width={56}
          height={56}
          className="h-14 w-14 shrink-0 rounded-lg object-cover shadow-lg"
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <div className="truncate text-[15px] font-semibold leading-tight text-white">
              {track.title}
            </div>
            <div
              className="hidden shrink-0 text-[10px] font-medium uppercase tracking-wider sm:block"
              style={{ color: accent }}
            >
              {PHASE_LABEL[track.phase]}
            </div>
          </div>
          <div className="truncate text-[12px] text-white/55">{track.artist}</div>

          <div
            ref={barRef}
            role="slider"
            tabIndex={0}
            aria-label="Seek"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(pct)}
            onClick={(e) => seekFromEvent(e.clientX)}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight") onSeek(Math.min(1, pct / 100 + 0.05));
              if (e.key === "ArrowLeft") onSeek(Math.max(0, pct / 100 - 0.05));
            }}
            className="group/bar relative mt-2 h-4 cursor-pointer"
          >
            <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full rounded-full transition-[width] duration-200 ease-linear"
                style={{ width: `${pct}%`, background: accent }}
              />
            </div>
            <div
              className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white opacity-0 shadow transition-opacity group-hover/bar:opacity-100"
              style={{ left: `${pct}%` }}
            />
          </div>

          <div className="mt-1 text-[11px] tabular-nums text-white/50">
            {clock(progress.current)} / {clock(duration)}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            aria-label="Previous track"
            onClick={onPrev}
            className="grid h-9 w-9 place-items-center rounded-full text-white/75 transition hover:bg-white/15 hover:text-white active:scale-95"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
            </svg>
          </button>

          <button
            type="button"
            aria-label={playing ? "Pause" : "Play"}
            aria-pressed={playing}
            disabled={!ready}
            onClick={onToggle}
            className="grid h-11 w-11 place-items-center rounded-full bg-white text-black shadow-lg transition hover:scale-105 active:scale-95 disabled:opacity-40"
          >
            {buffering && !playing ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/25 border-t-black" />
            ) : playing ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          <button
            type="button"
            aria-label="Next track"
            onClick={onNext}
            className="grid h-9 w-9 place-items-center rounded-full text-white/75 transition hover:bg-white/15 hover:text-white active:scale-95"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M16 6h2v12h-2zm-2 6L5.5 6v12z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
