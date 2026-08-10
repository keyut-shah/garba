// Every videoId below was verified against YouTube for playabilityStatus=OK
// AND playableInEmbed=true. If you add a track, verify it the same way or the
// player silently dies on that entry.

export type Phase = "traditional" | "falguni" | "nonstop";

export type Track = {
  id: string;
  title: string;
  artist: string;
  seconds: number;
  phase: Phase;
};

export const TRACKS: Track[] = [
  // --- traditional taali garba: the opener ---
  // Naagar Nandji Na Laal leads now — it's the hook for whoever lands on the
  // site first, including the old 8pm aarti slot (that phase is gone; there's
  // no dedicated devotional opener anymore, this carries it).
  {
    id: "iraezTzB938",
    title: "Naagar Nandji Na Laal",
    artist: "Aditya Gadhvi & Kinjal Rajpriya",
    seconds: 315,
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
  {
    id: "fjQRohT_LFw",
    title: "Moti Veraana",
    artist: "Amit Trivedi feat. Osman Mir",
    seconds: 261,
    phase: "traditional",
  },

  // --- Falguni: peak nostalgia, ~10pm ---
  // All-Gujarati now — the two Hindi Falguni Pathak tracks are gone, and this
  // hour opens with four different singers instead of the same one three
  // times running.
  {
    id: "2l-JHpsRVJE",
    title: "Sanedo",
    artist: "Jignesh Barot, Maniraj Barot & Parth Thakkar",
    seconds: 464,
    phase: "falguni",
  },
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
  // stretch from midnight on. Kinjal Dave and Jigardan Gadhavi each get two
  // tracks here, kept apart so neither singer repeats back-to-back.
  {
    id: "Fi7fxozoDPY",
    title: "Aangadiye Aavo",
    artist: "Aditya Gadhvi & Bhoomi Trivedi",
    seconds: 252,
    phase: "nonstop",
  },
  {
    id: "NpiD70ZrZTc",
    title: "Vichudo",
    artist: "Kinjal Dave",
    seconds: 210,
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
    id: "Gdgm79jAa3I",
    title: "Char Char Bangdi Vali Gadi",
    artist: "Kinjal Dave",
    seconds: 300,
    phase: "nonstop",
  },
  {
    id: "EG4gFxczkH8",
    title: "Chaniyacholi",
    artist: "Jigardan Gadhavi & Yati Upadhyay",
    seconds: 214,
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
 * that matches the actual hour in India — taali garba at 8pm, non-stop past midnight.
 */
export function phaseForIstHour(hour: number): Phase {
  if (hour >= 20 && hour < 22) return "traditional";
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
