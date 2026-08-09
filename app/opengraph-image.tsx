import { ImageResponse } from "next/og";
import { NIGHTS } from "@/lib/nights";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Garba Night — nine nights, nine colours";

// Required by `output: "export"` — bake the PNG at build time.
export const dynamic = "force-static";

export default function OpengraphImage() {
  const night = NIGHTS[0]; // orange — night one

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: `radial-gradient(circle at 50% 62%, ${night.glow}55 0%, ${night.sky[1]} 42%, ${night.sky[0]} 100%)`,
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* string lights */}
        <div style={{ display: "flex", position: "absolute", top: 54, gap: 46 }}>
          {Array.from({ length: 15 }).map((_, i) => (
            <div
              key={i}
              style={{
                width: 12,
                height: 12,
                borderRadius: 12,
                background: night.accent,
                opacity: i % 2 === 0 ? 0.95 : 0.55,
                boxShadow: `0 0 22px ${night.accent}`,
              }}
            />
          ))}
        </div>

        <div
          style={{
            fontSize: 128,
            fontWeight: 700,
            letterSpacing: -3,
            color: "#fff",
            textShadow: `0 0 70px ${night.glow}`,
            display: "flex",
          }}
        >
          GARBA
        </div>

        <div
          style={{
            marginTop: 14,
            fontSize: 27,
            letterSpacing: 10,
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.72)",
            display: "flex",
          }}
        >
          nine nights · nine colours
        </div>

        <div
          style={{
            marginTop: 46,
            fontSize: 21,
            color: "rgba(255,255,255,0.5)",
            display: "flex",
          }}
        >
          the society garba ground, in your browser
        </div>

        {/* the nine night colours */}
        <div style={{ display: "flex", gap: 17, marginTop: 52 }}>
          {NIGHTS.map((n) => (
            <div
              key={n.n}
              style={{
                width: 26,
                height: 26,
                borderRadius: 26,
                background: n.dot,
                boxShadow: `0 0 18px ${n.dot}, 0 0 0 2px rgba(255,255,255,0.28)`,
              }}
            />
          ))}
        </div>
      </div>
    ),
    size
  );
}
