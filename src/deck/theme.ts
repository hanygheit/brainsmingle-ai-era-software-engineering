import type { Act } from "@/config";
import { screens } from "@/content/screens";

/** Light "paper" content theme covers the content slides of Acts 1–6; separators and everything else are the navy stage. */
const PAPER = new Set(
  screens.filter((s) => s.act.startsWith("Act ") && !s.separator).map((s) => s.id),
);
export const isPaper = (screenId: string) => PAPER.has(screenId);

export const ACT_COLORS: Partial<Record<Act, string>> = {
  "Act 1 · The shift": "#2563EB",
  "Act 2 · Students": "#0E9F6E",
  "Act 3 · Universities & educators": "#BE185D",
  "Act 4 · Fresh graduates": "#B7791F",
  "Act 5 · Current engineers": "#7C3AED",
  "Act 6 · Companies": "#DC2626",
};

/** Act colours lifted for text on the navy stage (all ≥ 4.5:1 on #0F1B33). */
export const ACT_COLORS_ON_NAVY: Partial<Record<Act, string>> = {
  "Act 1 · The shift": "#8AB6FF",
  "Act 2 · Students": "#5EE6AA",
  "Act 3 · Universities & educators": "#F9A8D4",
  "Act 4 · Fresh graduates": "#F6C35C",
  "Act 5 · Current engineers": "#B9A2FF",
  "Act 6 · Companies": "#FF8A80",
};

/** The Opening is stop 01 on the agenda, so act n is shown to the audience as "Stop n+1". */
export const stopLabel = (stop: number) => `Stop ${String(stop).padStart(2, "0")}`;

/** The six numbered acts, in order: act number, agenda stop number and short name. */
export const NUMBERED_ACTS = (Object.keys(ACT_COLORS) as Act[]).map((act, i) => ({
  act,
  n: i + 1,
  stop: i + 2,
  name: act.split(" · ")[1] ?? act,
}));
export const actInfo = (act: Act) => NUMBERED_ACTS.find((a) => a.act === act);

/** Fill and on-navy ink for agenda stop 1–7 (stop 01, the Opening, uses the brand "own" green). */
export function stopColors(stop: number) {
  const a = NUMBERED_ACTS[stop - 2];
  if (!a) return { fill: "#3DDC97", ink: "#5EE6AA" };
  return { fill: ACT_COLORS[a.act]!, ink: ACT_COLORS_ON_NAVY[a.act]! };
}
