import { describe, expect, it } from "vitest";
import { TARGET_TOTAL_SEC } from "@/config";
import { CLOSE_INDEX, closeTotalSec, QA_INDEX, screens, slideLabel, talkTotalSec } from "@/content/screens";
import { sources } from "@/content/sources";
import { normalizeState, stepBack, stepForward, type DeckState } from "./store";
import { paceColor } from "@/components/deck/PresenterPanel";

const s = (index: number, enter: 1 | -1 = 1): DeckState => ({ index, enter, replay: 0, choice: null });

describe("deck engine", () => {
  it("has 52 screens S0–S51, each id matching its index", () => {
    expect(screens).toHaveLength(52);
    screens.forEach((sc, i) => expect(sc.id).toBe(`S${i}`));
    expect(slideLabel(5)).toBe("5 / 51 · Everyone can build software now");
    expect(slideLabel(3)).toBe("3 / 51 · Seven stops. One question.");
    expect(slideLabel(46)).toBe("46 / 51 · Stop 07 · Software buyers & stakeholders");
    expect(slideLabel(47)).toBe("47 / 51 · Faster — not free, and not instant");
  });
  it("has seven navy stop separators (agenda stops 01–07) at 4, 14, 20, 24, 32, 39, 46", () => {
    expect(screens.flatMap((sc, i) => (sc.separator ? [i] : []))).toEqual([4, 14, 20, 24, 32, 39, 46]);
    expect(screens.filter((sc) => sc.separator).map((sc) => sc.separator)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(slideLabel(14)).toBe("14 / 51 · Stop 02 · Universities & educators");
    expect(slideLabel(20)).toBe("20 / 51 · Stop 03 · Students");
    expect(slideLabel(24)).toBe("24 / 51 · Stop 04 · Fresh graduates & juniors");
    expect(screens.slice(21, 24).map((sc) => sc.durationSec)).toEqual([60, 75, 75]);
    expect(screens[46]!.act).toBe("Act 7 · Software buyers & stakeholders");
    expect(screens[47]!.act).toBe("Act 7 · Software buyers & stakeholders");
    expect(screens[48]!.act).toBe("Synthesis");
  });
  it("sources and slides point at each other", () => {
    const ids = new Set(sources.map((s) => s.id));
    for (const sc of screens) for (const id of sc.sourceIds) {
      expect(ids.has(id), `${sc.id} → ${id}`).toBe(true);
      expect(sources.find((s) => s.id === id)!.screens, `${id} lists ${sc.id}`).toContain(sc.id);
    }
    for (const s of sources) for (const id of s.screens) {
      expect(screens.find((sc) => sc.id === id)?.sourceIds, `${id} cites ${s.id}`).toContain(s.id);
    }
  });
  it("every build finishes within 0.8 s except the cold open", () => {
    for (const sc of screens.slice(2)) expect(Math.max(0, ...(sc.timeline ?? []))).toBeLessThanOrEqual(600);
    expect(Math.max(...screens[1]!.timeline!)).toBeLessThanOrEqual(2500);
  });
  it("slides 1–49 add up to exactly 41:30; close 50–51 is 2:00; slide 0 untimed; the final slide holds for Q&A", () => {
    expect(CLOSE_INDEX).toBe(50);
    expect(QA_INDEX).toBe(51);
    expect(TARGET_TOTAL_SEC).toBe(2490);
    expect(talkTotalSec()).toBe(2490);
    expect(closeTotalSec()).toBe(120);
    expect(screens[0]!.durationSec).toBe(0);
  });
  it("one press moves exactly one slide; back shows the final state", () => {
    expect(stepForward(s(3))).toEqual(s(4, 1));
    expect(stepBack(s(4))).toEqual(s(3, -1));
    expect(stepForward(s(51))).toEqual(s(51));
    expect(stepBack(s(0))).toEqual(s(0));
  });
  it("walks S0→S51 and back in 51 presses each way", () => {
    let st = s(0);
    for (let i = 0; i < 51; i++) st = stepForward(st);
    expect(st.index).toBe(51);
    for (let i = 0; i < 51; i++) st = stepBack(st);
    expect(st.index).toBe(0);
  });
  it("clamps bad incoming state and ignores old step values", () => {
    expect(normalizeState({ index: 99, step: 99 })?.index).toBe(51);
    expect(normalizeState({ index: 4, step: 3 })).toEqual(s(4));
    expect(normalizeState("x")).toBeNull();
  });
  it("countdown turns amber at 0 and red at +30 s", () => {
    expect(paceColor(1)).toBe("var(--text)");
    expect(paceColor(0)).toBe("var(--validate)");
    expect(paceColor(-30)).toBe("var(--fail)");
  });
});
