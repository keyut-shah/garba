"use client";

import { useCallback, useEffect, useState } from "react";
import CoverBackdrop from "@/components/CoverBackdrop";
import GarbaGround from "@/components/GarbaGround";
import NightSwitcher from "@/components/NightSwitcher";
import PlayerCard from "@/components/PlayerCard";
import { NIGHTS, currentNightIndex } from "@/lib/nights";
import { TRACKS, istHourNow, startIndexForIstHour } from "@/lib/tracks";
import { usePresence } from "@/lib/usePresence";
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
  const [entered, setEntered] = useState(false);
  const [now, setNow] = useState<Date | null>(null);

  const night = NIGHTS[nightIndex];
  const track = TRACKS[trackIndex];

  const go = useCallback((delta: number) => {
    setTrackIndex((i) => (i + delta + TRACKS.length) % TRACKS.length);
  }, []);

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

  const enter = useCallback(() => {
    setEntered(true);
    yt.load(TRACKS[trackIndex].id);
    yt.play();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackIndex, yt]);

  // Measured, not simulated: one open socket per person on the ground.
  const dancing = usePresence(entered);
  const time = now ? IST.formatToParts(now) : null;
  const hh = time?.find((p) => p.type === "hour")?.value ?? "";
  const mm = time?.find((p) => p.type === "minute")?.value ?? "";
  const ap = time?.find((p) => p.type === "dayPeriod")?.value ?? "";

  const shareText = encodeURIComponent(
    `it's ${night.colour.toLowerCase()} night at the garba ground 🪔`
  );

  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-between overflow-hidden">
      {/* the ground: tonight's sky and the blurred cover behind, the drawn
          scene in front of both */}
      <div className="fixed inset-0 -z-10">
        <CoverBackdrop videoId={track.id} night={night} />
        <div className="absolute inset-0">
          <GarbaGround night={night} />
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
          href={`https://twitter.com/intent/tweet?text=${shareText}`}
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

      {/* ---------- wordmark ---------- */}
      <div className="mt-[13vh] flex flex-col items-center px-6 text-center">
        <h1
          className="font-gujarati text-[15vw] leading-none text-white drop-shadow-[0_4px_28px_rgba(0,0,0,0.6)] sm:text-[104px]"
          style={{ textShadow: `0 0 46px ${night.glow}88` }}
        >
          ગરબા
        </h1>
        <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.32em] text-white/60 sm:text-xs">
          nine nights · nine colours
        </p>
      </div>

      {/* ---------- bottom ---------- */}
      <div className="mb-[5vh] flex w-full flex-col items-center gap-5 px-4 sm:mb-[6vh] sm:px-6">
        <NightSwitcher index={nightIndex} onChange={setNightIndex} />
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

      {/* ---------- enter gate (browsers block autoplay with sound) ---------- */}
      {!entered && (
        <button
          onClick={enter}
          className="fixed inset-0 z-50 flex cursor-pointer flex-col items-center justify-center gap-5 bg-black/65 backdrop-blur-sm transition"
          aria-label="Enter the garba ground"
        >
          <span
            className="grid h-20 w-20 place-items-center rounded-full bg-white text-black shadow-2xl transition hover:scale-105"
            style={{ boxShadow: `0 0 60px ${night.glow}` }}
          >
            <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
          <span className="text-sm font-medium uppercase tracking-[0.28em] text-white/85">
            enter the ground
          </span>
        </button>
      )}
    </main>
  );
}
