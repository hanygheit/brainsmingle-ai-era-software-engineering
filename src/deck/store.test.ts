import { describe, expect, it } from "vitest";
import { TARGET_TOTAL_SEC } from "@/config";
import { closeTotalSec, QA_INDEX, screens, slideLabel, talkTotalSec } from "@/content/screens";
import { normalizeState, stepBack, stepForward, type DeckState } from "./store";
import { paceColor } from "@/components/deck/PresenterPanel";

const s = (index: number, enter: 1 | -1 = 1): DeckState => ({ index, enter, replay: 0, choice: null });

describe("deck engine", () => {
  it("has 31 screens S0–S30, each id matching its index", () => {
    expect(screens).toHaveLength(31);
    screens.forEach((sc, i) => expect(sc.id).toBe(`S${i}`));
    expect(slideLabel(4)).toBe("4 / 31 · Everyone can build software now");
  });
  it("has five navy act separators at 3, 11, 16, 20, 24", () => {
    expect(screens.flatMap((sc, i) => (sc.separator ? [i] : []))).toEqual([3, 11, 16, 20, 24]);
  });
  it("every build finishes within 0.8 s except the cold open", () => {
    for (const sc of screens.slice(2)) expect(Math.max(0, ...(sc.timeline ?? []))).toBeLessThanOrEqual(600);
    expect(Math.max(...screens[1]!.timeline!)).toBeLessThanOrEqual(2500);
  });
  it("slides 1–28 add up to exactly 41:30; close 29–30 is 2:00; slide 0 untimed", () => {
    expect(QA_INDEX).toBe(28);
    expect(TARGET_TOTAL_SEC).toBe(2490);
    expect(talkTotalSec()).toBe(2490);
    expect(closeTotalSec()).toBe(120);
    expect(screens[0]!.durationSec).toBe(0);
  });
  it("one press moves exactly one slide; back shows the final state", () => {
    expect(stepForward(s(3))).toEqual(s(4, 1));
    expect(stepBack(s(4))).toEqual(s(3, -1));
    expect(stepForward(s(30))).toEqual(s(30));
    expect(stepBack(s(0))).toEqual(s(0));
  });
  it("walks S0→S30 and back in 30 presses each way", () => {
    let st = s(0);
    for (let i = 0; i < 30; i++) st = stepForward(st);
    expect(st.index).toBe(30);
    for (let i = 0; i < 30; i++) st = stepBack(st);
    expect(st.index).toBe(0);
  });
  it("clamps bad incoming state and ignores old step values", () => {
    expect(normalizeState({ index: 99, step: 99 })?.index).toBe(30);
    expect(normalizeState({ index: 4, step: 3 })).toEqual(s(4));
    expect(normalizeState("x")).toBeNull();
  });
  it("countdown turns amber at 0 and red at +30 s", () => {
    expect(paceColor(1)).toBe("var(--text)");
    expect(paceColor(0)).toBe("var(--validate)");
    expect(paceColor(-30)).toBe("var(--fail)");
  });
});
