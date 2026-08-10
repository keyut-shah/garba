"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Backdrop, { type ArtState } from "@/components/Backdrop";
import GarbaGround from "@/components/GarbaGround";
import NightSwitcher from "@/components/NightSwitcher";
import PlayerCard from "@/components/PlayerCard";
import { NIGHTS, currentNightIndex } from "@/lib/nights";
import { TRACKS, istHourNow, startIndexForIstHour } from "@/lib/tracks";
import { usePresence } from "@/lib/usePresence";
import { useSwipe } from "@/lib/useSwipe";
import { useYouTube } from "@/lib/useYouTube";

const IST = new Intl.DateTimeFormat("en-IN", {
  timeZone: "Asia/Kolkata",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

export default function Experience() {
  const [nightIndex, setNightIndex] = useState(0);
  const [trackIndex, setTrackIndex] = useState(0);
  const [now, setNow] = useState<Date | null>(null);
  /** Drives the "tap for sound" nudge; a ref alone wouldn't re-render. */
  const [everPlayed, setEverPlayed] = useState(false);
  const [art, setArt] = useState<ArtState>("unknown");
  /** Drops the swipe hint once they've changed a night by any means. */
  const [nudged, setNudged] = useState(false);

  const night = NIGHTS[nightIndex];
  const track = TRACKS[trackIndex];

  const go = useCallback((delta: number) => {
    setTrackIndex((i) => (i + delta + TRACKS.length) % TRACKS.length);
  }, []);

  // Nine dots is a poor thumb target, so the night is swipeable too. Wrapping
  // rather than clamping keeps a swipe from ever feeling like it did nothing.
  const goNight = useCallback((delta: number) => {
    setNightIndex((i) => (i + delta + NIGHTS.length) % NIGHTS.length);
    setNudged(true);
  }, []);

  const pickNight = useCallback((i: number) => {
    setNightIndex(i);
    setNudged(true);
  }, []);

  useSwipe(goNight);

  // The same move for anyone on a keyboard.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goNight(1);
      else if (e.key === "ArrowLeft") goNight(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goNight]);

  const yt = useYouTube({
    firstVideoId: TRACKS[0].id,
    onEnded: () => go(1),
  });

  // Pick tonight's colour and the right point in the night, once, on the client.
  // ?n=1..9 wins, so a specific night can be shared as a link.
  useEffect(() => {
    const n = Number(new URLSearchParams(window.location.search).get("n"));
    setNightIndex(n >= 1 && n <= 9 ? n - 1 : currentNightIndex());
    setTrackIndex(startIndexForIstHour(istHourNow()));
  }, []);

  // keep the URL in sync so the address bar is always shareable
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("n", String(nightIndex + 1));
    window.history.replaceState(null, "", url);
  }, [nightIndex]);

  // clock + counter tick
  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  // drive the player when the track changes (but not on the very first render)
  const [primed, setPrimed] = useState(false);
  useEffect(() => {
    if (!yt.ready) return;
    if (!primed) {
      setPrimed(true);
      return;
    }
    yt.load(track.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackIndex, yt.ready]);

  /**
   * No gate: the ground is there the moment the page loads.
   *
   * The gate existed for one reason — browsers refuse to start audio without a
   * user gesture, and tapping it supplied one. So the attempt is made anyway
   * on load (it succeeds where the browser already trusts the origin) and, if
   * it was refused, again on the first gesture anywhere on the page. A tap
   * meant for anything at all doubles as the tap that starts the music.
   */
  const started = useRef(false);

  useEffect(() => {
    if (!yt.ready) return;
    yt.load(TRACKS[trackIndex].id);
    yt.play();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [yt.ready]);

  useEffect(() => {
    if (!yt.playing) return;
    started.current = true;
    setEverPlayed(true);
  }, [yt.playing]);

  useEffect(() => {
    const kick = () => {
      // Only ever the first one. Past that, a pause is a decision, and
      // restarting the music under someone would be obnoxious.
      if (started.current) return;
      yt.play();
    };
    window.addEventListener("pointerdown", kick);
    return () => window.removeEventListener("pointerdown", kick);
  }, [yt]);

  // Measured, not simulated: one open socket per person on the ground. Without
  // a gate to pass, being here is what counts.
  const dancing = usePresence(true);
  const time = now ? IST.formatToParts(now) : null;
  const hh = time?.find((p) => p.type === "hour")?.value ?? "";
  const mm = time?.find((p) => p.type === "minute")?.value ?? "";
  const ap = time?.find((p) => p.type === "dayPeriod")?.value ?? "";

  const shareText = encodeURIComponent(
    `it's ${night.colour.toLowerCase()} night at the garba ground 🪔`
  );
  const shareUrl = encodeURIComponent(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://garba-wtf.pages.dev"
  );

  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-between overflow-hidden">
      {/* The ground. With a hero illustration the drawn scene pulls back to
          just the nearest silhouettes; without one it is the whole picture. */}
      <div className="fixed inset-0 -z-10">
        <Backdrop videoId={track.id} night={night} onArt={setArt} />
        <div className="absolute inset-0">
          <GarbaGround night={night} foregroundOnly={art === "present"} />
        </div>
      </div>

      {/* hidden YouTube player */}
      <div className="pointer-events-none absolute h-px w-px overflow-hidden opacity-0">
        <div ref={yt.holder} />
      </div>

      {/* ---------- top bar ---------- */}
      <div className="fixed left-4 top-4 z-20 text-sm font-medium tabular-nums text-white drop-shadow-[0_1px_6px_rgba(0,0,0,0.6)] sm:left-5 sm:top-5">
        {now ? (
          <>
            {hh}
            <span className="animate-[blink_1s_step-end_infinite]">:</span>
            {mm}
            <span className="ml-1.5 text-white/60">{ap}</span>
          </>
        ) : (
          <span>&nbsp;</span>
        )}
      </div>

      <div className="fixed left-1/2 top-4 z-20 flex -translate-x-1/2 items-center gap-2 text-sm font-medium text-white drop-shadow-[0_1px_6px_rgba(0,0,0,0.6)] sm:top-5">
        <span className="relative flex h-2.5 w-2.5">
          <span
            className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-70"
            style={{ background: night.accent }}
          />
          <span
            className="relative inline-flex h-2.5 w-2.5 rounded-full"
            style={{ background: night.accent, boxShadow: `0 0 8px ${night.accent}` }}
          />
        </span>
        <span className="tabular-nums">
          {dancing !== null ? dancing.toLocaleString("en-IN") : "—"}
        </span>
        <span className="hidden text-white/60 sm:inline">dancing</span>
      </div>

      <div className="fixed right-4 top-4 z-20 flex items-center gap-2 sm:right-5 sm:top-5">
        <a
          href={`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-full p-2.5 text-sm font-medium text-white drop-shadow-[0_1px_6px_rgba(0,0,0,0.6)] transition hover:opacity-80 active:scale-95 sm:px-3 sm:py-2"
          aria-label="Share"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          <span className="hidden sm:inline">Share</span>
        </a>
      </div>

      <div className="fixed bottom-4 right-4 z-20 sm:bottom-5 sm:right-5">
        <a
          href="https://twitter.com/KeyutS"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] font-medium uppercase tracking-[0.22em] text-white/50 [text-shadow:0_1px_3px_rgba(0,0,0,0.95)] transition hover:text-white/80"
        >
          made by @KeyutS
        </a>
      </div>

      {/* ---------- wordmark ---------- */}
      <div className="mt-[13vh] flex flex-col items-center px-6 text-center">
        <h1
          className="font-gujarati text-[15vw] leading-none text-white drop-shadow-[0_4px_28px_rgba(0,0,0,0.6)] sm:text-[104px]"
          style={{ textShadow: `0 0 46px ${night.glow}88` }}
        >
          ગરબા
        </h1>
        <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.32em] text-white/80 [text-shadow:0_1px_3px_rgba(0,0,0,0.95),0_2px_16px_rgba(0,0,0,0.85)] sm:text-xs">
          nine nights · nine colours
        </p>
      </div>

      {/* ---------- bottom ---------- */}
      <div className="mb-[5vh] flex w-full flex-col items-center gap-5 px-4 sm:mb-[6vh] sm:px-6">
        <NightSwitcher index={nightIndex} onChange={pickNight} />
        {!nudged && (
          <p className="-mt-3 text-[10px] font-medium uppercase tracking-[0.22em] text-white/50 [text-shadow:0_1px_3px_rgba(0,0,0,0.95)] sm:hidden">
            swipe to change night
          </p>
        )}
        <PlayerCard
          track={track}
          progress={yt.progress}
          playing={yt.playing}
          buffering={yt.buffering}
          ready={yt.ready}
          accent={night.accent}
          onToggle={yt.toggle}
          onPrev={() => go(-1)}
          onNext={() => go(1)}
          onSeek={yt.seekFraction}
        />
      </div>

      {/* Shown only until sound has ever started, and pointer-events-none so it
          can never swallow the very tap it is asking for. */}
      {yt.ready && !everPlayed && (
        <div className="pointer-events-none fixed inset-x-0 top-1/2 z-20 -translate-y-1/2 text-center">
          <span className="text-[11px] font-medium uppercase tracking-[0.28em] text-white/70 [text-shadow:0_1px_3px_rgba(0,0,0,0.95)]">
            tap anywhere for sound
          </span>
        </div>
      )}
    </main>
  );
}
