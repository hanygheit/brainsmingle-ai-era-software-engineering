export type SlideBg = "navy" | "paper" | "cream" | "amber";

export type SectionId = "intro" | "gate1" | "gate2" | "gate3" | "gate4" | "gate5" | "outro";

export interface SectionMeta {
  id: SectionId;
  label: string;
  short: string;
}

export const SECTIONS: SectionMeta[] = [
  { id: "intro", label: "Intro", short: "INTRO" },
  { id: "gate1", label: "Gate I · Lead", short: "GATE I · LEAD" },
  { id: "gate2", label: "Gate II · Context", short: "GATE II · CONTEXT" },
  { id: "gate3", label: "Gate III · Isolate", short: "GATE III · ISOLATE" },
  { id: "gate4", label: "Gate IV · Bound", short: "GATE IV · BOUND" },
  { id: "gate5", label: "Gate V · Prove", short: "GATE V · PROVE" },
  { id: "outro", label: "Outro", short: "OUTRO" },
];

export interface SlideNotes {
  cue: string;
  say: string;
  fact?: string;
  targetSec: number;
  skipIfLate?: boolean;
}

export interface Slide {
  id: number;
  section: SectionId;
  bg: SlideBg;
  layout: string;
  kicker: string;
  title: string;
  subtitle?: string;
  steps: number;
  notes: SlideNotes;
  sources?: string;
  /** Layout-specific payload; each layout component narrows this itself. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any;
}

export const SPEAKER = {
  name: "Hany Saad",
  role: "Senior Software Engineering Manager · ITWorx",
  talk: "BEFORE YOU PUT AN AI AGENT ON CALL",
  event: "DevOpsDays Cairo 2026",
};

export const KIT_URL = "https://github.com/hanygheit/ai-agent-on-call";
export const TOTAL_SLOT_SEC = 600;
