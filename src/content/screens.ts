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

const DURATIONS = [0, 90, 120, 120, 120, 120, 120, 120, 120, 90, 120, 120, 120, 90, 120, 120, 90, 120, 90, 120, 90, 90, 120, 60];

export const screens: Screen[] = ACT_OF.map((act, i) => ({
  id: `S${i}`,
  act,
  title: `Screen ${i}`,
  durationSec: DURATIONS[i] ?? 60,
  steps: 0,
  notes: "_Notes to be written._",
  sourceIds: [],
}));

/** Real content for built screens; others keep placeholders. */
const BUILT: Record<string, Partial<Screen>> = {
  S0: { title: "Lobby", durationSec: 0, steps: 0, notes: "Pre-show while people join. Not timed. Advance to S1 at start.", sourceIds: [] },
  S1: { title: "The code is ready", durationSec: 60, steps: 3, notes: "Cold open. Let the terminal run. Pause on **Are we?**", sourceIds: [] },
  S2: { title: "Ready for what?", durationSec: 120, steps: 2, notes: "Ask: which is your biggest challenge? 1, 2 or 3 in chat or via the QR. Then title + journey.", sourceIds: [] },
  S3: { title: "Everyone can build software now", durationSec: 150, steps: 8, notes: "Two lanes → delegation ladder → then/now prompts. Click AI-native delivery for the GitHub example.", sourceIds: ["fortune-lovable-arr", "osika-quote", "so-2026-agents", "github-agents-apr-2026"] },
  S4: { title: "AI is already inside the workflow", durationSec: 90, steps: 3, notes: "25 → 50 → 75. Stress *approved by engineers*.", sourceIds: ["google-pichai-next26", "so-oct-2026-daily", "jetbrains-aug-2026"] },
  S5: { act: "Act 1 · The work has changed", title: "When writing code is no longer the constraint", durationSec: 90, steps: 3, notes: "One organisation's setting. Never say 100%.", sourceIds: ["anthropic-ci-sep-2026", "axios-cowork-jan-2026"] },
  S6: { act: "Act 1 · The work has changed", title: "More code is not more engineering value", durationSec: 120, steps: 3, notes: "Separate studies, separate scales — never compare on one axis.", sourceIds: ["metr-jul-2025", "cui-mgmt-sci", "faros-apr-2026", "dora-ai"] },
};
for (const s of screens) Object.assign(s, BUILT[s.id] ?? {});

export const TOTAL_SCREENS = screens.length;
