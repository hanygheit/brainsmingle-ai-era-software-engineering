import { describe, expect, it } from "vitest";
import { TARGET_TOTAL_SEC } from "@/config";
import { screens } from "@/content/screens";
import { normalizeState, stepBack, stepForward } from "./store";
import { paceColor } from "@/components/deck/PresenterPanel";

const s = (index: number, step = 0) => ({ index, step, replay: 0, choice: null });

describe("deck engine", () => {
  it("has 24 screens S0–S23", () => {
    expect(screens).toHaveLength(24);
    expect(screens[0]!.id).toBe("S0");
    expect(screens[23]!.id).toBe("S23");
  });
  it("total duration equals the 41:30 target", () => {
    expect(TARGET_TOTAL_SEC).toBe(2490);
    expect(screens.reduce((a, x) => a + x.durationSec, 0)).toBe(2490);
  });
  it("forward then back restores the exact state", () => {
    const start = s(3);
    expect(stepBack(stepForward(start))).toEqual({ ...start, step: screens[3]!.steps });
    expect(stepForward(s(23))).toEqual(s(23));
    expect(stepBack(s(0))).toEqual(s(0));
  });
  it("clamps bad incoming state", () => {
    expect(normalizeState({ index: 99, step: 99 })?.index).toBe(23);
    expect(normalizeState("x")).toBeNull();
  });
  it("countdown turns amber at 0 and red at +30 s", () => {
    expect(paceColor(1)).toBe("var(--text)");
    expect(paceColor(0)).toBe("var(--validate)");
    expect(paceColor(-30)).toBe("var(--fail)");
  });
});
