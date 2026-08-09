"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    YT?: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let apiPromise: Promise<any> | null = null;

/** Load the IFrame API once per page, no matter how many callers ask for it. */
function loadApi(): Promise<any> {
  if (typeof window === "undefined") return Promise.resolve(null);
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (apiPromise) return apiPromise;

  apiPromise = new Promise((resolve) => {
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prev?.();
      resolve(window.YT);
    };
    const s = document.createElement("script");
    s.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(s);
  });
  return apiPromise;
}

export type Progress = { current: number; duration: number };

export function useYouTube(opts: { firstVideoId: string; onEnded: () => void }) {
  const holder = useRef<HTMLDivElement | null>(null);
  const player = useRef<any>(null);
  const endedCb = useRef(opts.onEnded);
  endedCb.current = opts.onEnded;

  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [buffering, setBuffering] = useState(false);
  const [progress, setProgress] = useState<Progress>({ current: 0, duration: 0 });

  useEffect(() => {
    let cancelled = false;

    loadApi().then((YT) => {
      if (cancelled || !YT || !holder.current || player.current) return;

      player.current = new YT.Player(holder.current, {
        videoId: opts.firstVideoId,
        playerVars: {
          controls: 0,
          disablekb: 1,
          playsinline: 1,
          rel: 0,
          modestbranding: 1,
        },
        events: {
          onReady: () => setReady(true),
          onStateChange: (e: any) => {
            const S = window.YT.PlayerState;
            setPlaying(e.data === S.PLAYING);
            setBuffering(e.data === S.BUFFERING);
            if (e.data === S.ENDED) endedCb.current();
          },
          onError: () => {
            // A pulled or region-blocked video would otherwise stall the night.
            endedCb.current();
          },
        },
      });
    });

    return () => {
      cancelled = true;
    };
    // deliberately once: the player is created with the first video and then
    // driven via loadVideoById, never recreated.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // poll for the seek bar
  useEffect(() => {
    if (!ready) return;
    const t = setInterval(() => {
      const p = player.current;
      if (!p?.getCurrentTime) return;
      setProgress({
        current: p.getCurrentTime() || 0,
        duration: p.getDuration() || 0,
      });
    }, 250);
    return () => clearInterval(t);
  }, [ready]);

  const play = useCallback(() => player.current?.playVideo?.(), []);
  const pause = useCallback(() => player.current?.pauseVideo?.(), []);
  const toggle = useCallback(() => {
    if (playing) player.current?.pauseVideo?.();
    else player.current?.playVideo?.();
  }, [playing]);

  const load = useCallback((videoId: string) => {
    player.current?.loadVideoById?.(videoId);
  }, []);

  const seekFraction = useCallback((f: number) => {
    const p = player.current;
    if (!p?.getDuration) return;
    const d = p.getDuration();
    if (d) p.seekTo(d * f, true);
  }, []);

  return { holder, ready, playing, buffering, progress, play, pause, toggle, load, seekFraction };
}
