import type { Act } from "@/config";

export interface Screen {
  id: string; // "S0".."S38" — always "S" + its index in `screens`
  act: Act;
  title: string;
  durationSec: number;
  /** Number of auto-build phases after the initial state (0 = static). Never driven by clicks. */
  steps: number;
  /** Milliseconds after opening at which phase 1..steps starts. */
  timeline?: number[];
  notes: string; // **bold** = key line
  sourceIds: string[];
  /** Act number (1–5) when this is a navy act-separator slide. */
  separator?: number;
}

const SEPARATOR_NOTES = "Read the question line, one breath, move on.";
const sep = (id: string, n: number, act: Act): Screen => ({
  id,
  act,
  title: act,
  durationSec: 10,
  steps: 3,
  timeline: [60, 120, 180],
  notes: SEPARATOR_NOTES,
  sourceIds: [],
  separator: n,
});

export const screens: Screen[] = [
  { id: "S0", act: "Lobby", title: "Lobby", durationSec: 0, steps: 0, timeline: [], notes: "Lobby. Press → at 20:00 to start.", sourceIds: [] },
  { id: "S1", act: "Opening", title: "The code is ready", durationSec: 60, steps: 3, timeline: [200, 1700, 2400], notes: 'Let it play; silent 2 s. "Imagine a fresh graduate submitting this tomorrow — as a final-year project, or as their first pull request on your team." **"The code is ready. Are we?"**', sourceIds: [] },
  { id: "S2", act: "Opening", title: "Ready for what?", durationSec: 120, steps: 3, timeline: [60, 120, 180], notes: "Three questions, then the poll. Read the tally after about 15 s. 20-second intro: both sides of this question. Route line.", sourceIds: [] },
  sep("S3", 1, "Act 1 · The work has changed"),
  { id: "S4", act: "Act 1 · The work has changed", title: "Everyone can build software now", durationSec: 60, steps: 4, timeline: [60, 120, 180, 240], notes: 'People who never coded are building apps and automations (Lovable, n8n) — "this presentation is a Lovable app". Developers moved from assistants to agents (Copilot, Cursor; Claude Code, Codex, Gemini CLI).', sourceIds: ["fortune-lovable-arr", "osika-quote", "so-2026-agents"] },
  { id: "S5", act: "Act 1 · The work has changed", title: "The unit of delegation changed", durationSec: 50, steps: 1, timeline: [60], notes: '**"The unit of delegation changed — from a line to a task."**', sourceIds: ["github-agents-apr-2026"] },
  { id: "S6", act: "Act 1 · The work has changed", title: "Then / Now", durationSec: 40, steps: 2, timeline: [60, 180], notes: 'Then vs Now. Close: "When anyone can build a working app, what makes someone an engineer?"', sourceIds: [] },
  { id: "S7", act: "Act 1 · The work has changed", title: "AI is already inside the workflow", durationSec: 90, steps: 4, timeline: [60, 200, 260, 320], notes: '**"Seventy-five percent of the code. A hundred percent of the accountability."**', sourceIds: ["google-q3-2024", "google-pichai-next26", "so-oct-2026-daily", "jetbrains-aug-2026"] },
  { id: "S8", act: "Act 1 · The work has changed", title: "When writing code is no longer the constraint", durationSec: 90, steps: 3, timeline: [60, 120, 180], notes: 'Never "100% by AI". **"A faster implementation workflow can expose a slower delivery system."**', sourceIds: ["anthropic-ci-sep-2026", "axios-cowork-jan-2026"] },
  { id: "S9", act: "Act 1 · The work has changed", title: "More code is not more engineering value", durationSec: 120, steps: 3, timeline: [60, 120, 180], notes: 'Two studies, two measures. METR now calls its newer evidence weak. **"Code got cheaper. Being wrong didn\'t."**', sourceIds: ["metr-jul-2025", "metr-update-feb-2026", "cui-mgmt-sci", "faros-apr-2026", "dora-ai", "dora-2025-report"] },
  { id: "S10", act: "Act 1 · The work has changed", title: "Two graduates. Same perfect project.", durationSec: 120, steps: 1, timeline: [60], notes: 'Press 1/2/3 to reveal answers. Two graduates, same project — audience votes 1, 2 or 3. Read the votes, then press the winning number to reveal the answers. A finds line 8; B can\'t. **"The artifact is identical. The engineer is not."** Willison. **"Never delegate what you can\'t verify."**', sourceIds: ["veracode-jul-2025", "github-review-apr-2026", "willison-proven"] },
  sep("S11", 2, "Act 2 · Students and educators"),
  { id: "S12", act: "Act 2 · Students and educators", title: "AI-native is not fundamentals-free · Keep, Shift", durationSec: 45, steps: 1, timeline: [60], notes: "Keep · Shift. \"The bug you just saw was a fundamentals bug.\"", sourceIds: [] },
  { id: "S13", act: "Act 2 · Students and educators", title: "AI-native is not fundamentals-free · Add, Prove", durationSec: 45, steps: 1, timeline: [60], notes: "Add · Prove.", sourceIds: [] },
  { id: "S14", act: "Act 2 · Students and educators", title: "AI-native is not fundamentals-free · Dohmke", durationSec: 30, steps: 1, timeline: [60], notes: "Dohmke: specification is the new coding.", sourceIds: ["dohmke-aug-2025"] },
  { id: "S15", act: "Act 2 · Students and educators", title: "Concepts outlive tools", durationSec: 60, steps: 2, timeline: [60, 120], notes: '**"Frameworks change. Engineering principles travel with you."** (First cut if late.)', sourceIds: [] },
  { id: "S16", act: "Act 2 · Students and educators", title: "Learn with AI — and without it", durationSec: 120, steps: 3, timeline: [60, 120, 180], notes: '50% vs 67%; explain vs delegate. **"Use AI to accelerate learning — not to skip learning."**', sourceIds: ["anthropic-skills-jan-2026", "dora-mar-2026", "gregg-stanford"] },
  { id: "S17", act: "Act 2 · Students and educators", title: "If AI can build it, what are we assessing?", durationSec: 150, steps: 4, timeline: [60, 120, 180, 240], notes: 'What we graded vs what we should grade. The changed requirement. The Anthropic hiring test. **"Are we developing people who can produce an answer — or engineers who can tell whether the answer is right?"** Click a rubric row to open its detail.', sourceIds: ["anthropic-takehome-jan-2026"] },
  sep("S18", 3, "Act 3 · Fresh graduates"),
  { id: "S19", act: "Act 3 · Fresh graduates", title: "The entry door is narrowing", durationSec: 30, steps: 1, timeline: [60], notes: "Industry goes first. 4.5%.", sourceIds: ["indeed-jul-2026"] },
  { id: "S20", act: "Act 3 · Fresh graduates", title: "The entry door is narrowing · 22–25-year-olds", durationSec: 30, steps: 1, timeline: [60], notes: "Stanford: 19% below trend for 22–25-year-olds in AI-exposed jobs.", sourceIds: ["stanford-canaries"] },
  { id: "S21", act: "Act 3 · Fresh graduates", title: "The entry door is narrowing · Garman", durationSec: 30, steps: 1, timeline: [60], notes: "Garman.", sourceIds: ["garman-register"] },
  { id: "S22", act: "Act 3 · Fresh graduates", title: "The new entry-level bar", durationSec: 125, steps: 8, timeline: [60, 120, 180, 240, 300, 360, 420, 480], notes: 'Walk the ladder. **"Build it with AI. Explain it without AI."**', sourceIds: ["bairesdev-q2-2026"] },
  { id: "S23", act: "Act 3 · Fresh graduates", title: "Senior reach ≠ senior judgment", durationSec: 105, steps: 2, timeline: [60, 600], notes: '**"AI gives juniors senior reach — not senior judgment."** The mentoring zone.', sourceIds: [] },
  sep("S24", 4, "Act 4 · Engineers already inside"),
  { id: "S25", act: "Act 4 · Engineers already inside", title: "The job changed. The skills model must follow.", durationSec: 50, steps: 1, timeline: [60], notes: "Effort moves to understand, verify, own. T toggles 2022/2026.", sourceIds: [] },
  { id: "S26", act: "Act 4 · Engineers already inside", title: "The job changed · Amodei", durationSec: 40, steps: 2, timeline: [60,200], notes: "The forgotten half of Amodei.", sourceIds: ["amodei-cfr"] },
  { id: "S27", act: "Act 4 · Engineers already inside", title: "The job changed · Staying narrow", durationSec: 30, steps: 1, timeline: [60], notes: "**\"Lowers the cost of learning — raises the cost of staying narrow.\"**", sourceIds: [] },
  { id: "S28", act: "Act 4 · Engineers already inside", title: "Agentic coding is learned, not prompted", durationSec: 135, steps: 7, timeline: [60, 120, 180, 240, 300, 360, 420], notes: '"At CognitionX and DevOpsDays I covered how to engineer with agents; today, how people learn it." L1–L5 ladder; starter repo; the AGENTS.md audience line. **"Agentic coding is learned, not prompted."**', sourceIds: ["karpathy-vibe", "karpathy-agentic"] },
  { id: "S29", act: "Act 4 · Engineers already inside", title: "One career, different learning paths", durationSec: 180, steps: 0, timeline: [], notes: 'Press 1, 3, 4, 5, 6. Seniors develop others. **"Seniority is measured by what you can safely delegate — and still own."**', sourceIds: [] },
  sep("S30", 5, "Act 5 · Companies"),
  { id: "S31", act: "Act 5 · Companies", title: "An AI subscription is not a development strategy", durationSec: 55, steps: 2, timeline: [60,120], notes: "**\"100% licensed is not the same as AI-ready.\"**", sourceIds: [] },
  { id: "S32", act: "Act 5 · Companies", title: "An AI subscription is not a development strategy · Before / after", durationSec: 70, steps: 4, timeline: [60,120,180,240], notes: "Z zooms the competency row if time allows.", sourceIds: [] },
  { id: "S33", act: "Act 5 · Companies", title: "An AI subscription is not a development strategy · Evidence", durationSec: 40, steps: 1, timeline: [60], notes: "Mentoring channel going quiet. Beck.", sourceIds: ["dx-onboarding","anthropic-work-dec-2025","beck-juniors"] },
  { id: "S34", act: "Act 5 · Companies", title: "Measure outcomes, not lines of AI code", durationSec: 110, steps: 2, timeline: [60, 120], notes: 'Activity vs outcomes. **"Don\'t measure how much AI they use. Measure what they can safely own."**', sourceIds: ["faros-apr-2026", "dora-ai"] },
  { id: "S35", act: "Synthesis", title: "The new engineering contract", durationSec: 150, steps: 1, timeline: [60], notes: "A responsibility framework, not a sequence. Engineer of record. Keys 1–6 change stage. Teach · Prepare · Develop · Enable.", sourceIds: [] },
  { id: "S36", act: "Q&A", title: "Where should we raise the engineering bar first?", durationSec: 60, steps: 0, timeline: [], notes: '"Most of you said [X]. Where should we raise the bar first?" Answer the top card, then open Q&A.', sourceIds: [] },
  { id: "S37", act: "Closing", title: "The code is ready. Are we? — the answer", durationSec: 90, steps: 4, timeline: [60, 120, 180, 240], notes: 'Evidence, **"AI can write the code. Engineers still own the outcome."**, one change in seven days.', sourceIds: [] },
  { id: "S38", act: "Closing", title: "The final line", durationSec: 30, steps: 0, timeline: [], notes: '**"AI is changing how we build software. We must change how we develop software engineers."** Then: "The three QR codes take you to my LinkedIn, my BrainsMingle profile, and this presentation with the PDF."', sourceIds: [] },
];

export const TOTAL_SCREENS = screens.length;

/** The Q&A slide: the talk timer covers slides 1..QA_INDEX; its countdown stops at 0. */
export const QA_INDEX = screens.findIndex((s) => s.act === "Q&A");

/** Timed talk = slides 1..Q&A (slide 0 is the lobby); the slides after Q&A are the separate close. */
export const TALK_SCREENS = screens.slice(1, QA_INDEX + 1);
export const CLOSE_SCREENS = screens.slice(QA_INDEX + 1);
export const talkTotalSec = () => TALK_SCREENS.reduce((a, s) => a + s.durationSec, 0);
export const closeTotalSec = () => CLOSE_SCREENS.reduce((a, s) => a + s.durationSec, 0);

/** "N / total · title" — the one label used by the control bar, presenter window and page title. */
export function slideLabel(index: number) {
  const i = Math.max(0, Math.min(TOTAL_SCREENS - 1, Math.trunc(index) || 0));
  return `${i} / ${TOTAL_SCREENS} · ${screens[i]!.title}`;
}
