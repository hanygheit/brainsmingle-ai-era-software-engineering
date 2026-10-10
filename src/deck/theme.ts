import type { Act } from "@/config";

/** Light "paper" content theme covers S3–S19; everything else is the dark stage. */
const PAPER = new Set(Array.from({ length: 17 }, (_, i) => `S${i + 3}`));
export const isPaper = (screenId: string) => PAPER.has(screenId);

export const ACT_COLORS: Partial<Record<Act, string>> = {
  "Act 1 · The work has changed": "#2563EB",
  "Act 2 · Students and educators": "#0E9F6E",
  "Act 3 · Fresh graduates": "#B7791F",
  "Act 4 · Engineers already inside": "#7C3AED",
  "Act 5 · Companies": "#DC2626",
};

/** First slide of each act: entering it forward shows the dark act-transition card. */
export const ACT_STARTS: Record<string, number> = { S3: 1, S8: 2, S12: 3, S15: 4, S18: 5 };
export const ACT_CARD_MS = 1200;
