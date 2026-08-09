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
      <div className="text-center leading-tight">
        <div className="text-[13px] font-semibold tracking-wide text-white drop-shadow-[0_1px_6px_rgba(0,0,0,0.6)]">
          Night {night.n} · {night.colour}
        </div>
        <div className="text-[11px] text-white/55">
          {night.goddess} · {night.date}
        </div>
      </div>

      <div
        className="flex items-center gap-2 rounded-full bg-black/25 px-3 py-2 backdrop-blur-md"
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
              style={{ width: 22, height: 22 }}
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
