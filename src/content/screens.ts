import type { Act } from "@/config";

export interface Screen {
  id: string; // "S0".."S23"
  act: Act;
  title: string;
  durationSec: number;
  steps: number; // number of reveal steps after the initial state (0 = static)
  notes: string; // markdown
  sourceIds: string[];
}

/**
 * Ordered screen list. Titles, durations and notes are placeholders until the
 * screen prompts fill them in; durations are split so the total equals 41:30.
 */
const ACT_OF: Act[] = [
  "Lobby",
  "Opening",
  "Opening",
  "Act 1 · The work has changed",
  "Act 1 · The work has changed",
  "Act 2 · Students and educators",
  "Act 2 · Students and educators",
  "Act 3 · Fresh graduates",
  "Act 3 · Fresh graduates",
  "Act 3 · Fresh graduates",
  "Act 4 · Engineers already inside",
  "Act 4 · Engineers already inside",
  "Act 4 · Engineers already inside",
  "Act 4 · Engineers already inside",
  "Act 5 · Companies",
  "Act 5 · Companies",
  "Act 5 · Companies",
  "Act 5 · Companies",
  "Synthesis",
  "Synthesis",
  "Synthesis",
  "Synthesis",
  "Q&A",
  "Closing",
];

const DURATIONS = [0, 90, 120, 120, 120, 120, 120, 120, 120, 90, 120, 120, 120, 90, 120, 120, 90, 120, 90, 120, 90, 90, 300, 60];

export const screens: Screen[] = ACT_OF.map((act, i) => ({
  id: `S${i}`,
  act,
  title: `Screen ${i}`,
  durationSec: DURATIONS[i] ?? 60,
  steps: 0,
  notes: "_Notes to be written._",
  sourceIds: [],
}));

export const TOTAL_SCREENS = screens.length;
