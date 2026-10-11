import type { Act } from "@/config";

export interface Screen {
  id: string; // "S0".."S49" — always "S" + its index in `screens`
  act: Act;
  title: string;
  durationSec: number;
  /** Number of auto-build phases after the initial state (0 = static). Never driven by clicks. */
  steps: number;
  /** Milliseconds after opening at which phase 1..steps starts. */
  timeline?: number[];
  notes: string; // **bold** = key line
  sourceIds: string[];
  /** Act number (1–6) when this is a navy act-separator slide (shown as agenda stop n+1). */
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
  { id: "S1", act: "Opening", title: "The code is ready", durationSec: 55, steps: 3, timeline: [200, 1700, 2400], notes: 'Let it play; silent 2 s. "Imagine a fresh graduate submitting this tomorrow — as a final-year project, or as their first pull request on your team." **"The code is ready. Are we?"**', sourceIds: [] },
  { id: "S2", act: "Opening", title: "Ready for what?", durationSec: 90, steps: 2, timeline: [60, 120], notes: "Three questions, then the poll. Read the tally after about 15 s. 20-second intro: both sides of this question. Then: \"Here's the route.\"", sourceIds: [] },
  { id: "S3", act: "Opening", title: "Seven stops. One question.", durationSec: 45, steps: 3, timeline: [60, 120, 540], notes: 'Seven stops, one question. "Wherever you voted, your stop is on this line — and **every stop ends with one action you can start this week.**" Point at the stops; don\'t read the promises.', sourceIds: [] },
  sep("S4", 1, "Act 1 · The shift"),
  { id: "S5", act: "Act 1 · The shift", title: "Everyone can build software now", durationSec: 50, steps: 4, timeline: [60, 120, 180, 240], notes: 'People who never coded are building apps and automations (Lovable, n8n) — "this presentation is a Lovable app". Developers moved from assistants to agents (Copilot, Cursor; Claude Code, Codex, Gemini CLI).', sourceIds: ["fortune-lovable-arr", "osika-quote", "so-2026-agents"] },
  { id: "S6", act: "Act 1 · The shift", title: "The unit of delegation changed", durationSec: 40, steps: 1, timeline: [60], notes: '**"The unit of delegation changed — from a line to a task."**', sourceIds: ["github-agents-apr-2026"] },
  { id: "S7", act: "Act 1 · The shift", title: "Then / Now", durationSec: 30, steps: 2, timeline: [60, 180], notes: 'Then vs Now. Close: "When anyone can build a working app, what makes someone an engineer?"', sourceIds: [] },
  { id: "S8", act: "Act 1 · The shift", title: "AI is already inside the workflow", durationSec: 80, steps: 4, timeline: [60, 200, 260, 320], notes: 'Google 25% → 50% → 75%, "approved by engineers". Google is not alone: Anthropic >80% of merged code authored by Claude (May 2026); Coinbase ~40% of daily code (Sep 2025 — "needs to be reviewed and understood"). Company-reported; definitions differ. (Microsoft, Apr 2025: "maybe 20%, 30%" — older, notes only.) Adoption: JetBrains 90% use agents weekly; Stack Overflow: 73% of AI-tool users use them daily. **"Seventy-five percent of the code. A hundred percent of the accountability."**', sourceIds: ["google-q3-2024", "google-pichai-next26", "anthropic-institute-jun-2026", "coinbase-armstrong-sep-2025", "jetbrains-aug-2026", "so-oct-2026-daily"] },
  { id: "S9", act: "Act 1 · The shift", title: "Developers increasingly direct, review and validate", durationSec: 50, steps: 4, timeline: [60, 120, 180, 240], notes: 'Three leaders, one shift — "increasingly", never "nobody writes code". Karpathy: agents are becoming the default, with more oversight. Pichai: engineers orchestrating agents. Dohmke & Kalliamvakou: from writing code to architecting and verifying. Balance: only 7% trust AI with important decisions. **"Developers increasingly direct, review and validate."**', sourceIds: ["karpathy-agentic", "google-pichai-next26", "dohmke-aug-2025", "so-2026-trust"] },
  { id: "S10", act: "Act 1 · The shift", title: "When writing code is no longer the constraint", durationSec: 60, steps: 3, timeline: [60, 120, 180], notes: 'Never "100% by AI". **"A faster implementation workflow can expose a slower delivery system."**', sourceIds: ["anthropic-ci-sep-2026", "axios-cowork-jan-2026"] },
  { id: "S11", act: "Act 1 · The shift", title: "More code is not more engineering value", durationSec: 90, steps: 3, timeline: [60, 120, 180], notes: 'Two studies, two measures. METR: expected +24%, felt +20%, measured 19% slower — METR now marks it out of date and calls its newer data an unreliable signal. Cui: +26% completed tasks. Faros (Sep 2026): PRs merged with no review +76%. **"Code got cheaper. Being wrong didn\'t."**', sourceIds: ["metr-jul-2025", "metr-update-feb-2026", "cui-mgmt-sci", "faros-sep-2026", "dora-mar-2026", "so-2025-ai"] },
  { id: "S12", act: "Act 1 · The shift", title: "Two graduates. Same perfect project.", durationSec: 105, steps: 1, timeline: [60], notes: 'Press 1/2/3 to reveal answers. Two graduates, same project — audience votes 1, 2 or 3. Read the votes, then press the winning number to reveal the answers. A finds line 8; B can\'t. **"The artifact is identical. The engineer is not."** Willison. **"Never delegate what you can\'t verify."**', sourceIds: ["veracode-jul-2025", "github-review-apr-2026", "willison-proven"] },
  { id: "S13", act: "Act 1 · The shift", title: "Your move · Never delegate what you can't verify", durationSec: 30, steps: 4, timeline: [60, 120, 180, 240], notes: 'Your move — four things for everyone, this week. Stack Overflow 2025: the biggest frustration (66%) is AI output that is "almost right, but not quite" — that\'s why you read every diff. **"Never delegate what you can\'t verify."**', sourceIds: ["so-2025-ai"] },
  sep("S14", 2, "Act 2 · Students"),
  { id: "S15", act: "Act 2 · Students", title: "Concepts outlive tools", durationSec: 40, steps: 2, timeline: [60, 120], notes: '**"Frameworks change. Engineering principles travel with you."** (First cut if late.)', sourceIds: [] },
  { id: "S16", act: "Act 2 · Students", title: "Learn with AI — and without it", durationSec: 95, steps: 3, timeline: [60, 120, 180], notes: '50% vs 67% (Anthropic RCT, 29 Jan 2026); explain ≥65% vs delegate <40%. DORA: lower barriers risk bypassing the "productive struggle". **"Use AI to accelerate learning — not to skip learning."**', sourceIds: ["anthropic-skills-jan-2026", "dora-mar-2026", "gregg-stanford"] },
  { id: "S17", act: "Act 2 · Students", title: "Your plan · Learn with AI, prove it without AI", durationSec: 75, steps: 4, timeline: [60, 120, 180, 240], notes: 'Skills, habits, one project built twice. Ng: telling people not to learn to code will be "some of the worst career advice ever given." Tools are examples, not endorsements; the full plan is on /blueprint. **"This month: build one small API by hand, extend it with an agent — and explain both."**', sourceIds: ["lee-chi-2025", "ng-batch-mar-2025", "github-copilot-students"] },
  sep("S18", 3, "Act 3 · Universities & educators"),
  { id: "S19", act: "Act 3 · Universities & educators", title: "AI-native is not fundamentals-free · Keep, Shift", durationSec: 40, steps: 1, timeline: [60], notes: 'Keep · Shift. "The bug you just saw was a fundamentals bug."', sourceIds: [] },
  { id: "S20", act: "Act 3 · Universities & educators", title: "AI-native is not fundamentals-free · Add, Prove", durationSec: 40, steps: 1, timeline: [60], notes: "Add · Prove.", sourceIds: [] },
  { id: "S21", act: "Act 3 · Universities & educators", title: "AI-native is not fundamentals-free · Dohmke", durationSec: 25, steps: 1, timeline: [60], notes: "Dohmke & Kalliamvakou: specification is the new coding.", sourceIds: ["dohmke-aug-2025"] },
  { id: "S22", act: "Act 3 · Universities & educators", title: "If AI can build it, what are we assessing?", durationSec: 110, steps: 4, timeline: [60, 120, 180, 240], notes: 'What we graded vs what we should grade. The changed requirement. The Anthropic hiring test. Faculty agree: 54% say current evaluation methods are no longer adequate (DEC 2025). **"Are we developing people who can produce an answer — or engineers who can tell whether the answer is right?"**', sourceIds: ["anthropic-takehome-jan-2026", "dec-faculty-2025"] },
  { id: "S23", act: "Act 3 · Universities & educators", title: "Your rollout · Change one assignment this term", durationSec: 75, steps: 4, timeline: [60, 120, 180, 240], notes: 'Students are already there: HEPI 2026 — 95% use AI; only 48% feel staff help them build AI skills. Three horizons. The per-assignment rule: two lanes (Sydney) or the AI Assessment Scale. Purdue rebuilt 22 courses and 300+ plans of study for its AI competency requirement. **"This term: change one assignment — AI allowed, explanation required."**', sourceIds: ["hepi-2026", "sydney-two-lane", "ai-assessment-scale", "purdue-ai-competency"] },
  sep("S24", 4, "Act 4 · Fresh graduates"),
  { id: "S25", act: "Act 4 · Fresh graduates", title: "The entry door is narrowing", durationSec: 30, steps: 2, timeline: [60, 120], notes: "Industry goes first. Indeed: 4.5% entry-level vs 69.3% senior (US postings, Q1 2026). SignalFire: new-grad hiring ~65% below 2019 at the Tech Majors.", sourceIds: ["indeed-jul-2026", "signalfire-2026"] },
  { id: "S26", act: "Act 4 · Fresh graduates", title: "The entry door is narrowing · 22–25-year-olds", durationSec: 30, steps: 2, timeline: [60, 120], notes: "Stanford (Aug 2026 revision): 22–25-year-olds in AI-exposed jobs are 19% below the path of less-exposed peers — mostly through less hiring. NY Fed: recent-grad unemployment 7.0% in CS, 7.8% in Computer Engineering, 4.2% for all majors.", sourceIds: ["stanford-canaries", "nyfed-recent-grads"] },
  { id: "S27", act: "Act 4 · Fresh graduates", title: "The entry door is narrowing · Garman", durationSec: 25, steps: 2, timeline: [60, 120], notes: "Garman (via The Register). Then: narrower, not closed — IBM is tripling entry-level hiring, including software developers; AWS is hiring 11,000 interns and new grads.", sourceIds: ["garman-register", "ibm-fortune-feb-2026", "garman-platformer-jun-2026"] },
  { id: "S28", act: "Act 4 · Fresh graduates", title: "Yesterday's senior skills are today's junior foundation", durationSec: 45, steps: 2, timeline: [60, 420], notes: 'Walk the five shifts. BairesDev: only 16% of senior developers say juniors fully understand the AI code they submit. **"Yesterday\'s senior skills are today\'s junior foundation."**', sourceIds: ["bairesdev-q2-2026"] },
  { id: "S29", act: "Act 4 · Fresh graduates", title: "The new entry-level bar", durationSec: 80, steps: 8, timeline: [60, 120, 180, 240, 300, 360, 420, 480], notes: 'Walk the ladder. **"Build it with AI. Explain it without AI."**', sourceIds: ["bairesdev-q2-2026"] },
  { id: "S30", act: "Act 4 · Fresh graduates", title: "Senior reach ≠ senior judgment", durationSec: 65, steps: 2, timeline: [60, 600], notes: '**"AI gives juniors senior reach — not senior judgment."** The mentoring zone.', sourceIds: [] },
  { id: "S31", act: "Act 4 · Fresh graduates", title: "Your first 90 days", durationSec: 75, steps: 4, timeline: [60, 120, 180, 240], notes: 'How to stand out, then 30 / 60 / 90. DX: daily AI users reached their 10th PR in 49 days vs 91. Full plan on /blueprint. **"Make your first 90 days visible: every PR explained, every agent mistake logged."**', sourceIds: ["dx-onboarding"] },
  sep("S32", 5, "Act 5 · Current engineers"),
  { id: "S33", act: "Act 5 · Current engineers", title: "The job changed. The skills model must follow.", durationSec: 45, steps: 1, timeline: [60], notes: "Effort moves to understand, verify, own. T toggles 2022/2026.", sourceIds: [] },
  { id: "S34", act: "Act 5 · Current engineers", title: "The job changed · Amodei", durationSec: 35, steps: 2, timeline: [60, 200], notes: 'The forgotten half of Amodei. A Mar 2025 forecast ("three to six months").', sourceIds: ["amodei-cfr"] },
  { id: "S35", act: "Act 5 · Current engineers", title: "The job changed · Staying narrow", durationSec: 25, steps: 1, timeline: [60], notes: '**"Lowers the cost of learning — raises the cost of staying narrow."**', sourceIds: [] },
  { id: "S36", act: "Act 5 · Current engineers", title: "Agentic coding is learned, not prompted", durationSec: 100, steps: 7, timeline: [60, 120, 180, 240, 300, 360, 420], notes: '"At CognitionX and DevOpsDays I covered how to engineer with agents; today, how people learn it." L1–L5 ladder; starter repo; the AGENTS.md audience line. **"Agentic coding is learned, not prompted."**', sourceIds: ["karpathy-vibe", "karpathy-agentic"] },
  { id: "S37", act: "Act 5 · Current engineers", title: "One career, different learning paths", durationSec: 110, steps: 0, timeline: [], notes: 'Press 1, 3, 4, 5, 6. Seniors develop others. **"Seniority is measured by what you can safely delegate — and still own."**', sourceIds: [] },
  { id: "S38", act: "Act 5 · Current engineers", title: "Your learning system · New ways to grow", durationSec: 70, steps: 4, timeline: [60, 120, 180, 240], notes: 'Four practices, every level. Microsoft Work Trend Index 2026: top performers deliberately work without AI to keep skills sharp (43% vs 30%). **"This sprint: review one agent session as a team — and do one task AI-off."**', sourceIds: ["ms-wti-2026"] },
  sep("S39", 6, "Act 6 · Companies"),
  { id: "S40", act: "Act 6 · Companies", title: "AI adoption is no longer optional", durationSec: 45, steps: 4, timeline: [60, 120, 180, 240], notes: 'Shopify (Apr 2025) and Microsoft (Jun 2025): AI use is now an expectation. DORA 2025: 90% already use AI at work. BCG 2026: 72% say expected skills shifted; only 36% feel adequately upskilled. **"No longer optional — but a licence is not a strategy."**', sourceIds: ["lutke-apr-2025", "liuson-bi-jun-2025", "dora-2025-report", "bcg-2026"] },
  { id: "S41", act: "Act 6 · Companies", title: "An AI subscription is not a development strategy", durationSec: 45, steps: 2, timeline: [60, 120], notes: '**"100% licensed is not the same as AI-ready."**', sourceIds: [] },
  { id: "S42", act: "Act 6 · Companies", title: "An AI subscription is not a development strategy · Before / after", durationSec: 60, steps: 4, timeline: [60, 120, 180, 240], notes: "Z zooms the competency row if time allows.", sourceIds: [] },
  { id: "S43", act: "Act 6 · Companies", title: "An AI subscription is not a development strategy · Evidence", durationSec: 35, steps: 1, timeline: [60], notes: "Mentoring channel going quiet. Beck.", sourceIds: ["dx-onboarding", "anthropic-work-dec-2025", "beck-juniors"] },
  { id: "S44", act: "Act 6 · Companies", title: "Measure outcomes, not lines of AI code", durationSec: 80, steps: 2, timeline: [60, 120], notes: 'Activity vs outcomes. McKinsey 2026: 80% report productivity gains, only 37% see any EBIT impact; high performers are twice as likely to measure impact. **"Don\'t measure how much AI they use. Measure what they can safely own."**', sourceIds: ["faros-sep-2026", "dora-mar-2026", "mckinsey-2026"] },
  { id: "S45", act: "Act 6 · Companies", title: "Your 90-day roadmap", durationSec: 80, steps: 4, timeline: [60, 120, 180, 240], notes: 'Foundations, capability, measure & scale — baseline before rollout. DORA AI Capabilities Model as the checklist; BCG: regular use is sharply higher with ≥5 hours of training. **"Start Monday: baseline first — then adopt, train and measure together."**', sourceIds: ["dora-ai-capabilities", "bcg-2025"] },
  { id: "S46", act: "Synthesis", title: "The new engineering contract", durationSec: 65, steps: 1, timeline: [60], notes: "A responsibility framework, not a sequence. Engineer of record. Keys 1–6 change stage. Teach · Prepare · Develop · Enable. Keep it to one minute.", sourceIds: [] },
  { id: "S47", act: "Q&A", title: "Where should we raise the engineering bar first?", durationSec: 60, steps: 0, timeline: [], notes: '"Most of you said [X]. Where should we raise the bar first?" Answer the top card, then open Q&A.', sourceIds: [] },
  { id: "S48", act: "Closing", title: "The code is ready. Are we? Yes — we can be.", durationSec: 90, steps: 3, timeline: [60, 120, 180], notes: 'Back to the cold open. "The code is ready. Are we?" **"Yes — we can be."** One line per role. **"AI can write the code. Engineers still own the outcome."**', sourceIds: [] },
  { id: "S49", act: "Closing", title: "The final line", durationSec: 30, steps: 0, timeline: [], notes: '**"AI is changing how we build software. We must change how we develop software engineers."** Then: "The three QR codes take you to my LinkedIn, my BrainsMingle profile, and this presentation with the PDF."', sourceIds: [] },
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
