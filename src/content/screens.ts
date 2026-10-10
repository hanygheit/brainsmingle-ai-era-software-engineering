import type { Act } from "@/config";

export interface Screen {
  id: string; // "S0".."S23"
  act: Act;
  title: string;
  durationSec: number;
  /** Number of auto-build phases after the initial state (0 = static). Never driven by clicks. */
  steps: number;
  /** Milliseconds after opening at which phase 1..steps starts. */
  timeline?: number[];
  notes: string; // **bold** = key line
  sourceIds: string[];
}

export const screens: Screen[] = [
  { id: "S0", act: "Lobby", title: "Lobby", durationSec: 0, steps: 0, timeline: [], notes: "Lobby. Press → at 20:00 to start.", sourceIds: [] },
  { id: "S1", act: "Opening", title: "The code is ready", durationSec: 60, steps: 3, timeline: [400, 4400, 5300], notes: "Let it play; silent 2 s. \"Imagine a fresh graduate submitting this tomorrow — as a final-year project, or as their first pull request on your team.\" **\"The code is ready. Are we?\"**", sourceIds: [] },
  { id: "S2", act: "Opening", title: "Ready for what?", durationSec: 120, steps: 3, timeline: [400, 900, 1400], notes: "Three questions, then the poll. Read the tally after about 15 s. 20-second intro: both sides of this question. Route line.", sourceIds: [] },
  { id: "S3", act: "Act 1 · The work has changed", title: "Everyone can build software now", durationSec: 150, steps: 8, timeline: [600, 1200, 1800, 2400, 3300, 4000, 4700, 5400], notes: "Two lanes: people who never coded are building apps and automations (Lovable, n8n; \"this presentation is a Lovable app\"); developers moved from assistants to agents (Copilot and Cursor; Claude Code, Codex, Gemini CLI). Then the ladder and Then/Now. **\"The unit of delegation changed — from a line to a task.\"** Close: \"When anyone can build a working app, what makes someone an engineer?\"", sourceIds: ["fortune-lovable-arr", "osika-quote", "so-2026-agents", "github-agents-apr-2026"] },
  { id: "S4", act: "Act 1 · The work has changed", title: "AI is already inside the workflow", durationSec: 90, steps: 5, timeline: [700, 1400, 2100, 2600, 3100], notes: "**\"Seventy-five percent of the code. A hundred percent of the accountability.\"**", sourceIds: ["google-q3-2024", "google-pichai-next26", "so-oct-2026-daily", "jetbrains-aug-2026"] },
  { id: "S5", act: "Act 1 · The work has changed", title: "When writing code is no longer the constraint", durationSec: 90, steps: 3, timeline: [1000, 1600, 2200], notes: "Never \"100% by AI\". **\"A faster implementation workflow can expose a slower delivery system.\"**", sourceIds: ["anthropic-ci-sep-2026", "axios-cowork-jan-2026"] },
  { id: "S6", act: "Act 1 · The work has changed", title: "More code is not more engineering value", durationSec: 120, steps: 3, timeline: [600, 1200, 1800], notes: "Two studies, two measures. METR now calls its newer evidence weak. **\"Code got cheaper. Being wrong didn't.\"**", sourceIds: ["metr-jul-2025", "metr-update-feb-2026", "cui-mgmt-sci", "faros-apr-2026", "dora-ai", "dora-2025-report"] },
  { id: "S7", act: "Act 1 · The work has changed", title: "Two graduates. Same perfect project.", durationSec: 120, steps: 1, timeline: [600], notes: "Press 1/2/3 to reveal answers. Two graduates, same project — audience votes 1, 2 or 3. Read the votes, then press the winning number to reveal the answers. A finds line 8; B can't. **\"The artifact is identical. The engineer is not.\"** Willison. **\"Never delegate what you can't verify.\"**", sourceIds: ["veracode-jul-2025", "github-review-apr-2026", "willison-proven"] },
  { id: "S8", act: "Act 2 · Students and educators", title: "AI-native is not fundamentals-free", durationSec: 120, steps: 5, timeline: [400, 700, 1000, 1300, 1900], notes: "Keep · Shift · Add · Prove. \"The bug you just saw was a fundamentals bug.\"", sourceIds: ["dohmke-aug-2025"] },
  { id: "S9", act: "Act 2 · Students and educators", title: "Concepts outlive tools", durationSec: 60, steps: 2, timeline: [400, 1600], notes: "**\"Frameworks change. Engineering principles travel with you.\"** (First cut if late.)", sourceIds: [] },
  { id: "S10", act: "Act 2 · Students and educators", title: "Learn with AI — and without it", durationSec: 120, steps: 3, timeline: [600, 1200, 1800], notes: "50% vs 67%; explain vs delegate. **\"Use AI to accelerate learning — not to skip learning.\"**", sourceIds: ["anthropic-skills-jan-2026", "dora-mar-2026", "gregg-stanford"] },
  { id: "S11", act: "Act 2 · Students and educators", title: "If AI can build it, what are we assessing?", durationSec: 150, steps: 4, timeline: [500, 1100, 1600, 2200], notes: "What we graded vs what we should grade. The changed requirement. The Anthropic hiring test. **\"Are we developing people who can produce an answer — or engineers who can tell whether the answer is right?\"** Click a rubric row to open its detail.", sourceIds: ["anthropic-takehome-jan-2026"] },
  { id: "S12", act: "Act 3 · Fresh graduates", title: "The entry door is narrowing", durationSec: 90, steps: 2, timeline: [700, 1400], notes: "Industry goes first. 4.5%. Garman.", sourceIds: ["indeed-jul-2026", "stanford-canaries", "garman-register"] },
  { id: "S13", act: "Act 3 · Fresh graduates", title: "The new entry-level bar", durationSec: 135, steps: 8, timeline: [300, 450, 600, 750, 900, 1050, 1200, 1700], notes: "Walk the ladder. **\"Build it with AI. Explain it without AI.\"**", sourceIds: ["bairesdev-q2-2026"] },
  { id: "S14", act: "Act 3 · Fresh graduates", title: "Senior reach ≠ senior judgment", durationSec: 105, steps: 2, timeline: [600, 2600], notes: "**\"AI gives juniors senior reach — not senior judgment.\"** The mentoring zone.", sourceIds: [] },
  { id: "S15", act: "Act 4 · Engineers already inside", title: "The job changed. The skills model must follow.", durationSec: 120, steps: 3, timeline: [1000, 1900, 3800], notes: "Effort moves to understand, verify, own. The forgotten half of Amodei. **\"Lowers the cost of learning — raises the cost of staying narrow.\"** T toggles 2022/2026.", sourceIds: ["amodei-cfr"] },
  { id: "S16", act: "Act 4 · Engineers already inside", title: "Agentic coding is learned, not prompted", durationSec: 135, steps: 7, timeline: [500, 800, 1100, 1400, 1700, 2300, 2900], notes: "\"At CognitionX and DevOpsDays I covered how to engineer with agents; today, how people learn it.\" L1–L5 ladder; starter repo; the AGENTS.md audience line. **\"Agentic coding is learned, not prompted.\"**", sourceIds: ["karpathy-vibe", "karpathy-agentic"] },
  { id: "S17", act: "Act 4 · Engineers already inside", title: "One career, different learning paths", durationSec: 195, steps: 0, timeline: [], notes: "Press 1, 3, 4, 5, 6. Seniors develop others. **\"Seniority is measured by what you can safely delegate — and still own.\"**", sourceIds: [] },
  { id: "S18", act: "Act 5 · Companies", title: "An AI subscription is not a development strategy", durationSec: 180, steps: 5, timeline: [600, 900, 1200, 1500, 2300], notes: "Z zooms the competency row if time allows. **\"100% licensed is not the same as AI-ready.\"** Mentoring channel going quiet. Beck.", sourceIds: ["dx-onboarding", "anthropic-work-dec-2025", "beck-juniors"] },
  { id: "S19", act: "Act 5 · Companies", title: "Measure outcomes, not lines of AI code", durationSec: 120, steps: 2, timeline: [1500, 2100], notes: "Activity vs outcomes. **\"Don't measure how much AI they use. Measure what they can safely own.\"**", sourceIds: ["faros-apr-2026", "dora-ai"] },
  { id: "S20", act: "Synthesis", title: "The new engineering contract", durationSec: 150, steps: 1, timeline: [1200], notes: "A responsibility framework, not a sequence. Engineer of record. Keys 1–6 change stage. Teach · Prepare · Develop · Enable.", sourceIds: [] },
  { id: "S21", act: "Q&A", title: "Where should we raise the engineering bar first?", durationSec: 60, steps: 0, timeline: [], notes: "\"Most of you said [X]. Where should we raise the bar first?\" Answer the top card, then open Q&A.", sourceIds: [] },
  { id: "S22", act: "Closing", title: "The code is ready. Are we? — the answer", durationSec: 90, steps: 4, timeline: [800, 1800, 2600, 3400], notes: "Evidence, **\"AI can write the code. Engineers still own the outcome.\"**, one change in seven days.", sourceIds: [] },
  { id: "S23", act: "Closing", title: "The final line", durationSec: 30, steps: 0, timeline: [], notes: "**\"AI is changing how we build software. We must change how we develop software engineers.\"** Then: \"The three QR codes take you to my LinkedIn, my BrainsMingle profile, and this presentation with the PDF.\"", sourceIds: [] },
];

export const TOTAL_SCREENS = screens.length;

/** Timed talk = S1–S21 (S0 is the lobby; S22–S23 are the separate close). */
export const TALK_SCREENS = screens.slice(1, 22);
export const CLOSE_SCREENS = screens.slice(22);
export const talkTotalSec = () => TALK_SCREENS.reduce((a, s) => a + s.durationSec, 0);
export const closeTotalSec = () => CLOSE_SCREENS.reduce((a, s) => a + s.durationSec, 0);
