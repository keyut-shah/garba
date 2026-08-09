// The nine nights of Sharad Navratri 2026 (Oct 11–19).
// Each night has a canonical colour people actually dress in, and a form of Durga.
// `sky`/`glow`/`accent` re-grade the SVG scene; `dot` is the pure colour for the switcher.

export type Night = {
  n: number;
  date: string;
  weekday: string;
  colour: string;
  goddess: string;
  meaning: string;
  dot: string;
  sky: [string, string];
  glow: string;
  accent: string;
};

export const NIGHTS: Night[] = [
  {
    n: 1,
    date: "Oct 11",
    weekday: "Sunday",
    colour: "Orange",
    goddess: "Maa Shailputri",
    meaning: "Energy",
    dot: "#FF7A18",
    sky: ["#2A0E04", "#5C1F06"],
    glow: "#FF8A2B",
    accent: "#FFC46B",
  },
  {
    n: 2,
    date: "Oct 12",
    weekday: "Monday",
    colour: "White",
    goddess: "Maa Brahmacharini",
    meaning: "Peace",
    dot: "#F2F5F8",
    sky: ["#0E1116", "#2B3440"],
    glow: "#E8EEF5",
    accent: "#FFFFFF",
  },
  {
    n: 3,
    date: "Oct 13",
    weekday: "Tuesday",
    colour: "Red",
    goddess: "Maa Chandraghanta",
    meaning: "Power",
    dot: "#E52438",
    sky: ["#2A0308", "#6A0F1B"],
    glow: "#FF3B4E",
    accent: "#FF8A96",
  },
  {
    n: 4,
    date: "Oct 14",
    weekday: "Wednesday",
    colour: "Royal Blue",
    goddess: "Maa Kushmanda",
    meaning: "Calm",
    dot: "#2547D0",
    sky: ["#050C2E", "#12277A"],
    glow: "#3D6DFF",
    accent: "#8FB0FF",
  },
  {
    n: 5,
    date: "Oct 15",
    weekday: "Thursday",
    colour: "Yellow",
    goddess: "Maa Skandamata",
    meaning: "Happiness",
    dot: "#F5C518",
    sky: ["#241A02", "#5E4406"],
    glow: "#FFC61A",
    accent: "#FFE694",
  },
  {
    n: 6,
    date: "Oct 16",
    weekday: "Friday",
    colour: "Green",
    goddess: "Maa Katyayani",
    meaning: "Growth",
    dot: "#1FA65A",
    sky: ["#04180C", "#0C4423"],
    glow: "#2FBF6B",
    accent: "#93E9B8",
  },
  {
    n: 7,
    date: "Oct 17",
    weekday: "Saturday",
    colour: "Grey",
    goddess: "Maa Kalaratri",
    meaning: "Strength",
    dot: "#7C8794",
    sky: ["#0B0D10", "#262B33"],
    glow: "#9AA5B4",
    accent: "#D3DAE4",
  },
  {
    n: 8,
    date: "Oct 18",
    weekday: "Sunday",
    colour: "Purple",
    goddess: "Maa Mahagauri",
    meaning: "Grace",
    dot: "#8B37D8",
    sky: ["#170526", "#45106E"],
    glow: "#A855F7",
    accent: "#D7A9FF",
  },
  {
    n: 9,
    date: "Oct 19",
    weekday: "Monday",
    colour: "Peacock Green",
    goddess: "Maa Siddhidatri",
    meaning: "Fulfilment",
    dot: "#0FA89B",
    sky: ["#021A1C", "#06514E"],
    glow: "#14C4B4",
    accent: "#7BEFE2",
  },
];

/**
 * During Navratri 2026 the switcher defaults to tonight. Outside it, defaults to Night 1.
 * A "night" rolls over at 4am IST, not midnight — garba runs past 12.
 */
export function currentNightIndex(now = new Date()): number {
  // Shift the instant into IST, then back 4h so a "night" rolls over at 4am —
  // someone opening this at 1am is still on the previous night's colour.
  const ist = new Date(now.getTime() + (330 + now.getTimezoneOffset()) * 60_000);
  const shifted = new Date(ist.getTime() - 4 * 3600_000);

  const today = new Date(
    shifted.getFullYear(),
    shifted.getMonth(),
    shifted.getDate()
  );
  const start = new Date(2026, 9, 11); // 11 Oct 2026
  const days = Math.round((today.getTime() - start.getTime()) / 86_400_000);

  return days >= 0 && days < 9 ? days : 0;
}
