// Every videoId below was verified against YouTube for playabilityStatus=OK
// AND playableInEmbed=true. If you add a track, verify it the same way or the
// player silently dies on that entry.

export type Phase = "aarti" | "traditional" | "falguni" | "nonstop";

export type Track = {
  id: string;
  title: string;
  artist: string;
  seconds: number;
  phase: Phase;
};

export const TRACKS: Track[] = [
  // --- aarti: how every garba night actually opens ---
  {
    id: "U_DTkSAakVQ",
    title: "Jai Adhyashakti",
    artist: "Ratansinh Vaghela & Damyanti Barot",
    seconds: 813,
    phase: "aarti",
  },

  // --- traditional taali garba: the slow build ---
  // Reordered so the same singer never opens back-to-back — Atul Purohit had
  // two in a row.
  {
    id: "9SqGPYaZlk4",
    title: "Garbo Maa No Ghumto Aayo",
    artist: "Rakesh Barot",
    seconds: 344,
    phase: "traditional",
  },
  {
    id: "6MpjP4w8Gtk",
    title: "Tara Vina Shyam",
    artist: "Atul Purohit",
    seconds: 438,
    phase: "traditional",
  },
  {
    id: "xJsvTCMg0qA",
    title: "Mor Bani Thanghat Kare",
    artist: "Osman Mir & Aditi Paul",
    seconds: 212,
    phase: "traditional",
  },
  {
    id: "-Fk3RK2V27M",
    title: "Ke Hove Hove",
    artist: "Atul Purohit & Himali Vora",
    seconds: 328,
    phase: "traditional",
  },

  // --- Falguni: peak nostalgia, ~10pm ---
  // All-Gujarati now — the two Hindi Falguni Pathak tracks are gone, and this
  // hour opens with three different singers instead of the same one three
  // times running.
  {
    id: "ccqg6e2rfLU",
    title: "Gori Radha Ne Kalo Kaan",
    artist: "Kirtidan Gadhvi",
    seconds: 178,
    phase: "falguni",
  },
  {
    id: "rdDe6VWP-9s",
    title: "Kesariyo Rang Tane Lagyo",
    artist: "Falguni Pathak",
    seconds: 743,
    phase: "falguni",
  },
  {
    id: "Te-1fu0UdQE",
    title: "Galgoto Me Zukine Lidho",
    artist: "Geeta Rabari",
    seconds: 619,
    phase: "falguni",
  },

  // --- non-stop: past midnight, nobody is sitting down ---
  // Chogada and Nagada Sang Dhol (the old "everyone knows this one" phase)
  // and Kamariya are gone — all three were Hindi film songs, and nobody at an
  // actual garba is dancing to Bollywood. This block now covers the whole
  // stretch from midnight on.
  {
    id: "Fi7fxozoDPY",
    title: "Aangadiye Aavo",
    artist: "Aditya Gadhvi & Bhoomi Trivedi",
    seconds: 252,
    phase: "nonstop",
  },
  {
    id: "Gdgm79jAa3I",
    title: "Char Char Bangdi Vali Gadi",
    artist: "Kinjal Dave",
    seconds: 300,
    phase: "nonstop",
  },
  {
    id: "9n7tWwa77mY",
    title: "Ramo Re",
    artist: "Jigardan Gadhavi, Janki Bodiwala & Kavya Limaye",
    seconds: 230,
    phase: "nonstop",
  },
  {
    id: "t7wSjy9Lv-o",
    title: "Khalasi",
    artist: "Aditya Gadhvi x Achint",
    seconds: 264,
    phase: "nonstop",
  },
];

export const PHASE_LABEL: Record<Phase, string> = {
  aarti: "Aarti",
  traditional: "Taali garba",
  falguni: "The Falguni hour",
  nonstop: "Non-stop",
};

export function coverUrl(id: string) {
  // mqdefault has no letterboxing, unlike hqdefault — crop it square with object-cover.
  return `https://i.ytimg.com/vi/${id}/mqdefault.jpg`;
}

/**
 * A real garba night has a shape. Drop the listener in at the point of the night
 * that matches the actual hour in India — aarti at 8pm, non-stop past midnight.
 */
export function phaseForIstHour(hour: number): Phase {
  if (hour >= 20 && hour < 21) return "aarti";
  if (hour >= 21 && hour < 22) return "traditional";
  if (hour >= 22 && hour < 24) return "falguni";
  if (hour >= 0 && hour < 5) return "nonstop";
  return "falguni"; // daytime: drop them straight into the good stuff
}

export function startIndexForIstHour(hour: number): number {
  const phase = phaseForIstHour(hour);
  const i = TRACKS.findIndex((t) => t.phase === phase);
  return i === -1 ? 0 : i;
}

export function istHourNow(now = new Date()): number {
  const ist = new Date(now.getTime() + (330 + now.getTimezoneOffset()) * 60_000);
  return ist.getHours();
}
