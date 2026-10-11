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

/** Act colours lifted for text on the navy stage (all ≥ 4.5:1 on #0F1B33). */
export const ACT_COLORS_ON_NAVY: Partial<Record<Act, string>> = {
  "Act 1 · The work has changed": "#8AB6FF",
  "Act 2 · Students and educators": "#5EE6AA",
  "Act 3 · Fresh graduates": "#F6C35C",
  "Act 4 · Engineers already inside": "#B9A2FF",
  "Act 5 · Companies": "#FF8A80",
};

/** The five numbered acts, in order, split into number and name. */
export const NUMBERED_ACTS = (Object.keys(ACT_COLORS) as Act[]).map((act, i) => ({
  act,
  n: i + 1,
  name: act.split(" · ")[1] ?? act,
}));
export const actInfo = (act: Act) => NUMBERED_ACTS.find((a) => a.act === act);
