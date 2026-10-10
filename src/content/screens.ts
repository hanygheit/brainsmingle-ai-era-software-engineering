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
  S4: { title: "AI is already inside the workflow", durationSec: 90, steps: 3, notes: "25 → 50 → 75. Stress *approved by engineers*.", sourceIds: ["google-q3-2024", "google-pichai-next26", "so-oct-2026-daily", "jetbrains-aug-2026"] },
  S5: { act: "Act 1 · The work has changed", title: "When writing code is no longer the constraint", durationSec: 90, steps: 3, notes: "One organisation's setting. Never say 100%.", sourceIds: ["anthropic-ci-sep-2026", "axios-cowork-jan-2026"] },
  S6: { act: "Act 1 · The work has changed", title: "More code is not more engineering value", durationSec: 120, steps: 3, notes: "Separate studies, separate scales — never compare on one axis.", sourceIds: ["metr-jul-2025", "cui-mgmt-sci", "metr-update-feb-2026", "faros-apr-2026", "dora-ai", "dora-2025-report"] },
  S7: { act: "Act 1 · The work has changed", title: "Two graduates. Same perfect project.", durationSec: 120, steps: 4, notes: "Run the s7-interview poll (keys 1/2/3 fallback). Show the winning question's answers, then line 8.", sourceIds: ["veracode-jul-2025", "github-review-apr-2026"] },
  S8: { act: "Act 2 · Students and educators", title: "AI-native is not fundamentals-free", durationSec: 120, steps: 5, notes: "KEEP → SHIFT → ADD → PROVE, then Dohmke.", sourceIds: ["dohmke-aug-2025"] },
  S9: { act: "Act 2 · Students and educators", title: "Concepts outlive tools", durationSec: 60, steps: 2, notes: "Let the tool names cycle; the concepts stay.", sourceIds: [] },
  S10: { act: "Act 2 · Students and educators", title: "Learn with AI — and without it", durationSec: 120, steps: 3, notes: "67% vs 50%. Small pattern groups — directional.", sourceIds: ["anthropic-skills-jan-2026", "dora-mar-2026", "gregg-stanford"] },
  S11: { act: "Act 2 · Students and educators", title: "If AI can build it, what are we assessing?", durationSec: 150, steps: 5, notes: "Step 1 flips to the rubric. Press T to toggle graded view. Click rows for detail.", sourceIds: ["anthropic-takehome-jan-2026"] },
  S12: { act: "Act 3 · Fresh graduates", title: "The entry door is narrowing", durationSec: 90, steps: 2, notes: "4.5 of 100 squares. Then Stanford, then Garman.", sourceIds: ["indeed-jul-2026", "stanford-canaries", "garman-register"] },
  S13: { act: "Act 3 · Fresh graduates", title: "The new entry-level bar", durationSec: 135, steps: 7, notes: "One row per click. Close: build it with AI, explain it without AI.", sourceIds: ["bairesdev-q2-2026"] },
  S14: { act: "Act 3 · Fresh graduates", title: "Senior reach ≠ senior judgment", durationSec: 105, steps: 2, notes: "Click to go 2022 → 2026: reach grows ~3×, judgment barely moves.", sourceIds: [] },
  S15: { act: "Act 4 · Engineers already inside", title: "The job changed. The skills model must follow.", durationSec: 120, steps: 3, notes: "First click morphs 2022 → 2026; T toggles back and forth. Conceptual, not measured.", sourceIds: ["amodei-cfr"] },
  S16: { act: "Act 4 · Engineers already inside", title: "Agentic coding is learned, not prompted", durationSec: 135, steps: 7, notes: "Ladder L1–L5, then highlight the audience line in AGENTS.md.", sourceIds: ["karpathy-vibe", "karpathy-agentic"] },
  S17: { act: "Act 4 · Engineers already inside", title: "One career, different learning paths", durationSec: 195, steps: 0, notes: "Keys 1–6 pick the stage. Default Junior.", sourceIds: [] },
};
for (const s of screens) Object.assign(s, BUILT[s.id] ?? {});

export const TOTAL_SCREENS = screens.length;
