import type { Night } from "@/lib/nights";

/* Deterministic PRNG — the scene must render identically on server and client
   or React will scream about a hydration mismatch. Never use Math.random here. */
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const W = 1600;
const H = 900;
const CX = 800;
const GROUND_Y = 640;

/** A single stylised garba dancer: head, flared chaniya choli, arms mid-clap. */
function Dancer({ pose }: { pose: 0 | 1 }) {
  return (
    <g>
      <circle cx="20" cy="9" r="6.4" />
      {/* torso tapering into the skirt flare */}
      <path d="M20 15.5 L14.5 30 L25.5 30 Z" />
      <path d="M14.5 30 L8.5 62 Q20 67 31.5 62 L25.5 30 Z" />
      {pose === 0 ? (
        <>
          {/* both arms overhead, hands about to meet */}
          <path d="M15.5 19 L5 7 L8.5 4 L18.5 16 Z" />
          <path d="M24.5 19 L35 7 L31.5 4 L21.5 16 Z" />
        </>
      ) : (
        <>
          {/* arms out to the sides, taali position */}
          <path d="M15 20 L2 16 L2.5 11.5 L16.5 16.5 Z" />
          <path d="M25 20 L38 16 L37.5 11.5 L23.5 16.5 Z" />
        </>
      )}
    </g>
  );
}

type Placed = {
  x: number;
  y: number;
  scale: number;
  pose: 0 | 1;
  opacity: number;
  tint: string;
};

/** Lay dancers around concentric ellipses — the garba circle, seen at a slight tilt. */
function buildRings(night: Night): Placed[] {
  const rnd = mulberry32(20261011);
  const rings = [
    { rx: 250, ry: 62, cy: GROUND_Y - 108, count: 16, base: 0.5, backlit: true },
    { rx: 420, ry: 100, cy: GROUND_Y - 60, count: 22, base: 0.72, backlit: true },
    { rx: 620, ry: 145, cy: GROUND_Y + 5, count: 26, base: 0.95, backlit: false },
    { rx: 820, ry: 190, cy: GROUND_Y + 80, count: 28, base: 1.25, backlit: false },
  ];

  const out: Placed[] = [];
  for (const ring of rings) {
    for (let i = 0; i < ring.count; i++) {
      // jitter the angle so it reads as a crowd, not a clock face
      const a = ((i + rnd() * 0.55 - 0.275) / ring.count) * Math.PI * 2;
      const x = CX + ring.rx * Math.cos(a);
      const y = ring.cy + ring.ry * Math.sin(a);
      // figures at the front of the ellipse (sin ~ 1) sit closer to camera
      const depth = (Math.sin(a) + 1) / 2;
      const scale = ring.base * (0.82 + depth * 0.36) * (0.93 + rnd() * 0.14);
      out.push({
        x,
        y,
        scale,
        pose: rnd() > 0.45 ? 0 : 1,
        opacity: ring.backlit ? 0.55 + depth * 0.25 : 0.78 + depth * 0.22,
        tint: ring.backlit ? night.glow : "#05070a",
      });
    }
  }
  // painter's algorithm: back of the ground first
  return out.sort((p, q) => p.y - q.y);
}

/** Points along a quadratic bezier, for hanging bulbs on a sagging wire. */
function bezierPoints(
  p0: [number, number],
  p1: [number, number],
  p2: [number, number],
  n: number
) {
  const pts: [number, number][] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const u = 1 - t;
    pts.push([
      u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0],
      u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1],
    ]);
  }
  return pts;
}

export default function GarbaGround({ night }: { night: Night }) {
  const dancers = buildRings(night);
  const rnd = mulberry32(7);

  const wires: { d: string; pts: [number, number][] }[] = [
    { p0: [-60, 40] as [number, number], p1: [800, 210] as [number, number], p2: [1660, 30] as [number, number], n: 26 },
    { p0: [-60, 150] as [number, number], p1: [800, 320] as [number, number], p2: [1660, 130] as [number, number], n: 22 },
    { p0: [-60, 260] as [number, number], p1: [800, 400] as [number, number], p2: [1660, 250] as [number, number], n: 18 },
  ].map((w) => ({
    d: `M${w.p0[0]} ${w.p0[1]} Q${w.p1[0]} ${w.p1[1]} ${w.p2[0]} ${w.p2[1]}`,
    pts: bezierPoints(w.p0, w.p1, w.p2, w.n),
  }));

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
      className="h-full w-full"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={night.sky[0]} />
          <stop offset="70%" stopColor={night.sky[1]} />
          <stop offset="100%" stopColor={night.sky[0]} />
        </linearGradient>

        <radialGradient id="centreGlow" cx="50%" cy="58%" r="52%">
          <stop offset="0%" stopColor={night.glow} stopOpacity="0.62" />
          <stop offset="45%" stopColor={night.glow} stopOpacity="0.20" />
          <stop offset="100%" stopColor={night.glow} stopOpacity="0" />
        </radialGradient>

        <radialGradient id="mandapGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={night.accent} stopOpacity="0.95" />
          <stop offset="55%" stopColor={night.glow} stopOpacity="0.45" />
          <stop offset="100%" stopColor={night.glow} stopOpacity="0" />
        </radialGradient>

        <radialGradient id="bulbGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={night.accent} stopOpacity="0.9" />
          <stop offset="100%" stopColor={night.accent} stopOpacity="0" />
        </radialGradient>

        <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={night.glow} stopOpacity="0.22" />
          <stop offset="100%" stopColor={night.sky[0]} stopOpacity="0" />
        </linearGradient>

        <linearGradient id="vignette" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#000" stopOpacity="0.55" />
          <stop offset="35%" stopColor="#000" stopOpacity="0.05" />
          <stop offset="75%" stopColor="#000" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.8" />
        </linearGradient>

        <symbol id="dancer" viewBox="0 0 40 70" width="40" height="70">
          <Dancer pose={0} />
        </symbol>
        <symbol id="dancerB" viewBox="0 0 40 70" width="40" height="70">
          <Dancer pose={1} />
        </symbol>
      </defs>

      <rect width={W} height={H} fill="url(#sky)" />

      {/* distant bokeh — other grounds, streetlights, the city behind */}
      <g>
        {Array.from({ length: 46 }).map((_, i) => {
          const x = rnd() * W;
          const y = 80 + rnd() * 380;
          const r = 1.4 + rnd() * 3.2;
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={r}
              fill={night.accent}
              opacity={0.10 + rnd() * 0.28}
            />
          );
        })}
      </g>

      <rect width={W} height={H} fill="url(#centreGlow)" />

      {/* the ground itself */}
      <ellipse cx={CX} cy={GROUND_Y + 40} rx={900} ry={250} fill="url(#floor)" />

      {/* ---- mandap: canopy, pillars, and the murti glowing inside ---- */}
      <g>
        <circle cx={CX} cy={GROUND_Y - 190} r={200} fill="url(#mandapGlow)" opacity="0.55" />
        {/* stepped shikhar */}
        <path
          d={`M${CX} ${GROUND_Y - 355} L${CX + 96} ${GROUND_Y - 250} L${CX + 74} ${GROUND_Y - 250}
              L${CX + 128} ${GROUND_Y - 196} L${CX - 128} ${GROUND_Y - 196}
              L${CX - 74} ${GROUND_Y - 250} L${CX - 96} ${GROUND_Y - 250} Z`}
          fill="#05070a"
          opacity="0.92"
        />
        {/* pillars + platform */}
        <rect x={CX - 132} y={GROUND_Y - 196} width={18} height={116} fill="#05070a" opacity="0.92" />
        <rect x={CX + 114} y={GROUND_Y - 196} width={18} height={116} fill="#05070a" opacity="0.92" />
        <rect x={CX - 150} y={GROUND_Y - 84} width={300} height={16} rx={4} fill="#05070a" opacity="0.92" />
        {/* the lit arch */}
        <path
          d={`M${CX - 92} ${GROUND_Y - 84} L${CX - 92} ${GROUND_Y - 150}
              Q${CX} ${GROUND_Y - 214} ${CX + 92} ${GROUND_Y - 150}
              L${CX + 92} ${GROUND_Y - 84} Z`}
          fill={night.accent}
          opacity="0.30"
        />
        {/* murti silhouette with a halo — small, backlit, reverent */}
        <circle cx={CX} cy={GROUND_Y - 156} r={30} fill={night.accent} opacity="0.55" />
        <g fill="#05070a" opacity="0.85">
          <circle cx={CX} cy={GROUND_Y - 158} r={11} />
          <path
            d={`M${CX} ${GROUND_Y - 148} L${CX - 22} ${GROUND_Y - 86} L${CX + 22} ${GROUND_Y - 86} Z`}
          />
        </g>
        {/* two diyas on the platform edge */}
        <circle cx={CX - 118} cy={GROUND_Y - 90} r={7} fill={night.accent} opacity="0.85" />
        <circle cx={CX + 118} cy={GROUND_Y - 90} r={7} fill={night.accent} opacity="0.85" />
      </g>

      {/* ---- string lights ---- */}
      <g>
        {wires.map((w, wi) => (
          <g key={wi}>
            <path d={w.d} fill="none" stroke="#05070a" strokeWidth="2.5" opacity="0.55" />
            {w.pts.map(([x, y], i) => (
              <g key={i}>
                <circle cx={x} cy={y + 7} r={13} fill="url(#bulbGlow)" opacity="0.5" />
                <circle cx={x} cy={y + 7} r={3.4} fill={night.accent} opacity="0.95" />
              </g>
            ))}
          </g>
        ))}
      </g>

      {/* ---- the circle ---- */}
      <g>
        {dancers.map((d, i) => (
          <use
            key={i}
            href={d.pose === 0 ? "#dancer" : "#dancerB"}
            x={d.x - 20 * d.scale}
            y={d.y - 70 * d.scale}
            width={40 * d.scale}
            height={70 * d.scale}
            fill={d.tint}
            opacity={d.opacity}
          />
        ))}
      </g>

      <rect width={W} height={H} fill="url(#vignette)" />
    </svg>
  );
}
