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
    id: "Tfjoyp0g5HA",
    title: "Dholi Taaro Dhol Baaje",
    artist: "Kavita Krishnamurthy, Vinod Rathod & Karsan Sagthiya",
    seconds: 371,
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
    id: "jXhJMrAkkqM",
    title: "Dholida Dhol Re Vagade",
    artist: "Traditional Garba",
    seconds: 502,
    phase: "traditional",
  },

  // --- Falguni: peak nostalgia, ~10pm — also the daytime default phase ---
  // Hu Gokul No Govadiyo leads so daytime visitors hit it first. Ramo Re and
  // Chaniyacholi moved here from non-stop (this is the middle of the night,
  // not the last leg). Jigardan Gadhavi now has three tracks in this phase,
  // spaced apart so none of them repeat back-to-back.
  {
    id: "Lj_2wb9akZM",
    title: "Hu Gokul No Govadiyo",
    artist: "Atul Purohit",
    seconds: 302,
    phase: "falguni",
  },
  {
    id: "9n7tWwa77mY",
    title: "Ramo Re",
    artist: "Jigardan Gadhavi, Janki Bodiwala & Kavya Limaye",
    seconds: 230,
    phase: "falguni",
  },
  {
    id: "5MMqwxJ3VBY",
    title: "Tetudo 2",
    artist: "Geeta Rabari & Rahul Munjariya",
    seconds: 280,
    phase: "falguni",
  },
  {
    id: "mN5atYdWd3o",
    title: "Kanudo Shu Jaane Mari Preet",
    artist: "Jigardan Gadhavi & Hardik Trivedi",
    seconds: 207,
    phase: "falguni",
  },
  {
    id: "2l-JHpsRVJE",
    title: "Sanedo",
    artist: "Jignesh Barot, Maniraj Barot & Parth Thakkar",
    seconds: 464,
    phase: "falguni",
  },
  {
    id: "EG4gFxczkH8",
    title: "Chaniyacholi",
    artist: "Jigardan Gadhavi & Yati Upadhyay",
    seconds: 214,
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
  {
    id: "NpiD70ZrZTc",
    title: "Vichudo",
    artist: "Kinjal Dave",
    seconds: 210,
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
