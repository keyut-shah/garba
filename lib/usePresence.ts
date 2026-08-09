"use client";

import { useEffect, useState } from "react";

/** Long enough to stay cheap, short enough to beat the usual 60s idle reaper. */
const HEARTBEAT_MS = 30_000;
const MAX_BACKOFF_MS = 30_000;

/**
 * How many people are on the ground right now.
 *
 * The socket is the membership: it opens when `joined` turns true and the
 * count is the number of sockets the Durable Object is holding. Returns null
 * until the first message arrives — including in `next dev`, where there is
 * no Worker at all, so use `wrangler dev` to see a real number locally.
 */
export function usePresence(joined: boolean): number | null {
  const [dancing, setDancing] = useState<number | null>(null);

  useEffect(() => {
    if (!joined) return;

    let socket: WebSocket | null = null;
    let heartbeat: ReturnType<typeof setInterval> | undefined;
    let retry: ReturnType<typeof setTimeout> | undefined;
    let attempt = 0;
    let done = false;

    const connect = () => {
      if (done) return;

      const url = new URL("/api/presence", window.location.href);
      url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
      socket = new WebSocket(url);

      socket.onopen = () => {
        attempt = 0;
        heartbeat = setInterval(() => socket?.send("ping"), HEARTBEAT_MS);
      };

      socket.onmessage = (event) => {
        if (event.data === "pong") return; // runtime auto-response
        try {
          const { dancing: n } = JSON.parse(event.data);
          if (typeof n === "number") setDancing(n);
        } catch {
          // not ours; ignore rather than blank the number
        }
      };

      socket.onerror = () => socket?.close();

      socket.onclose = () => {
        clearInterval(heartbeat);
        if (done) return;
        // Keep showing the last known number while reconnecting — a brief
        // drop shouldn't empty the ground on screen.
        const wait = Math.min(1000 * 2 ** attempt++, MAX_BACKOFF_MS);
        // Jitter, so a Worker redeploy doesn't bring everyone back at once.
        retry = setTimeout(connect, wait * (0.5 + Math.random() * 0.5));
      };
    };

    connect();

    return () => {
      done = true;
      clearInterval(heartbeat);
      clearTimeout(retry);
      socket?.close();
    };
  }, [joined]);

  return dancing;
}
