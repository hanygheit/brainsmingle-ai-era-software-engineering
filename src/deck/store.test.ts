import { describe, expect, it } from "vitest";
import { TARGET_TOTAL_SEC } from "@/config";
import { closeTotalSec, screens, talkTotalSec } from "@/content/screens";
import { normalizeState, stepBack, stepForward, type DeckState } from "./store";
import { paceColor } from "@/components/deck/PresenterPanel";

const s = (index: number, enter: 1 | -1 = 1): DeckState => ({ index, enter, replay: 0, choice: null });

describe("deck engine", () => {
  it("has 24 screens S0–S23", () => {
    expect(screens).toHaveLength(24);
    expect(screens[0]!.id).toBe("S0");
    expect(screens[23]!.id).toBe("S23");
  });
  it("S1–S21 add up to exactly 41:30; close S22–S23 is 2:00; S0 untimed", () => {
    expect(TARGET_TOTAL_SEC).toBe(2490);
    expect(talkTotalSec()).toBe(2490);
    expect(closeTotalSec()).toBe(120);
    expect(screens[0]!.durationSec).toBe(0);
  });
  it("one press moves exactly one slide; back shows the final state", () => {
    expect(stepForward(s(3))).toEqual(s(4, 1));
    expect(stepBack(s(4))).toEqual(s(3, -1));
    expect(stepForward(s(23))).toEqual(s(23));
    expect(stepBack(s(0))).toEqual(s(0));
  });
  it("walks S0→S23 and back in 23 presses each way", () => {
    let st = s(0);
    for (let i = 0; i < 23; i++) st = stepForward(st);
    expect(st.index).toBe(23);
    for (let i = 0; i < 23; i++) st = stepBack(st);
    expect(st.index).toBe(0);
  });
  it("clamps bad incoming state and ignores old step values", () => {
    expect(normalizeState({ index: 99, step: 99 })?.index).toBe(23);
    expect(normalizeState({ index: 4, step: 3 })).toEqual(s(4));
    expect(normalizeState("x")).toBeNull();
  });
  it("countdown turns amber at 0 and red at +30 s", () => {
    expect(paceColor(1)).toBe("var(--text)");
    expect(paceColor(0)).toBe("var(--validate)");
    expect(paceColor(-30)).toBe("var(--fail)");
  });
});
