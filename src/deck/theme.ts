import type { Act } from "@/config";
import { screens } from "@/content/screens";

/** Light "paper" content theme covers the content slides of Acts 1–5; separators and everything else are the navy stage. */
const PAPER = new Set(
  screens.filter((s) => s.act.startsWith("Act ") && !s.separator).map((s) => s.id),
);
export const isPaper = (screenId: string) => PAPER.has(screenId);

export const ACT_COLORS: Partial<Record<Act, string>> = {
  "Act 1 · The work has changed": "#2563EB",
  "Act 2 · Students and educators": "#0E9F6E",
  "Act 3 · Fresh graduates": "#B7791F",
  "Act 4 · Engineers already inside": "#7C3AED",
  "Act 5 · Companies": "#DC2626",
};
