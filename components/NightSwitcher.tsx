"use client";

import { NIGHTS } from "@/lib/nights";

export default function NightSwitcher({
  index,
  onChange,
}: {
  index: number;
  onChange: (i: number) => void;
}) {
  const night = NIGHTS[index];

  return (
    <div className="flex flex-col items-center gap-2.5">
      {/* A soft shadow was enough over the drawn scene, but this text now sits
          on a lit, busy illustration. Two shadows — one tight for edge contrast,
          one wide for a halo — keep it readable without a slab of black behind
          it dimming the artwork. */}
      <div className="text-center leading-tight [text-shadow:0_1px_3px_rgba(0,0,0,0.95),0_2px_16px_rgba(0,0,0,0.85)]">
        <div className="text-[13px] font-semibold tracking-wide text-white">
          Night {night.n} · {night.colour}
        </div>
        <div className="text-[11px] text-white/75 sm:text-sm">
          {night.goddess} · {night.date}
        </div>
      </div>

      {/* The dots were 22x22 hit areas — under a quarter of the 44x44 that both
          WCAG and the platform guidelines ask for, nine of them side by side.
          The visible dot is unchanged; only the tappable box grew, so the row
          looks the same and stops fighting your thumb. */}
      <div
        className="flex items-center gap-0 rounded-full bg-black/25 px-2 py-1 backdrop-blur-md"
        role="tablist"
        aria-label="Choose a night of Navratri"
      >
        {NIGHTS.map((nt, i) => {
          const active = i === index;
          return (
            <button
              key={nt.n}
              role="tab"
              aria-selected={active}
              aria-label={`Night ${nt.n} — ${nt.colour} — ${nt.goddess}`}
              title={`Night ${nt.n} · ${nt.colour} · ${nt.goddess}`}
              onClick={() => onChange(i)}
              className="group relative grid place-items-center outline-none"
              style={{ width: 32, height: 44 }}
            >
              <span
                className="block rounded-full transition-all duration-300 ease-out group-hover:scale-110 group-focus-visible:ring-2 group-focus-visible:ring-white/80"
                style={{
                  width: active ? 15 : 9,
                  height: active ? 15 : 9,
                  background: nt.dot,
                  boxShadow: active
                    ? `0 0 0 3px rgba(255,255,255,0.85), 0 0 14px ${nt.dot}`
                    : "0 0 0 1.5px rgba(255,255,255,0.35)",
                }}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
