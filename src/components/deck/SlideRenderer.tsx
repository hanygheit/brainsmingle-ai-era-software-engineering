import { useEffect, useRef, useState } from "react";
import type { Slide } from "@/content/types";
import type { LayoutProps } from "./layouts/frame";
import {
  BigNumberSlide,
  FourCardsSlide,
  GatesSlide,
  PollSlide,
  ShiftSlide,
  TerminalListSlide,
  TitleSlide,
} from "./layouts/intro";
import { GateSlide } from "./layouts/gate";
import { HookDemoSlide, RepoTreeSlide, SixCardsSlide, TwoCodeSlide } from "./layouts/context";
import { BranchesSlide } from "./layouts/scope";
import { CloseSlide, GearboxSlide, OfferLetterSlide, TimelineSlide } from "./layouts/outro";
import { OpeningQuestionSlide, RewindSlide } from "./layouts/approved";

const LAYOUTS: Record<string, (p: LayoutProps) => React.ReactElement> = {
  title: TitleSlide,
  openingQuestion: OpeningQuestionSlide,
  bigNumber: BigNumberSlide,
  shift: ShiftSlide,
  terminalPlusList: TerminalListSlide,
  fourCards: FourCardsSlide,
  poll: PollSlide,
  gates: GatesSlide,
  gate: GateSlide,
  repoTree: RepoTreeSlide,
  hookDemo: HookDemoSlide,
  twoCode: TwoCodeSlide,
  sixCards: SixCardsSlide,
  branches: BranchesSlide,
  timeline: TimelineSlide,
  gearbox: GearboxSlide,
  offerLetter: OfferLetterSlide,
  close: CloseSlide,
  rewind: RewindSlide,
};

export function SlideRenderer({
  slide,
  step,
  calm = false,
  onGoto,
}: {
  slide: Slide;
  step: number;
  calm?: boolean;
  onGoto?: ((index: number) => void) | undefined;
}) {
  const Layout = LAYOUTS[slide.layout];
  if (!Layout) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-paper font-mono text-[28px] text-deny">
        Unknown layout: {slide.layout}
      </div>
    );
  }
  return <AutoPlay key={slide.id} Layout={Layout} slide={slide} step={slide.steps} calm={calm} onGoto={onGoto} />;
}

/** Plays a slide's internal builds automatically after a single click. */
function AutoPlay({
  Layout,
  slide,
  step,
  calm,
  onGoto,
}: {
  Layout: (p: LayoutProps) => React.ReactElement;
  slide: Slide;
  step: number;
  calm: boolean;
  onGoto?: ((index: number) => void) | undefined;
}) {
  const [shown, setShown] = useState(calm ? step : 0);
  const prevTarget = useRef(calm ? step : 0);
  useEffect(() => {
    const from = prevTarget.current;
    prevTarget.current = step;
    if (calm || step <= from || false) {
      setShown(step);
      return;
    }
    let cur = from + 1;
    setShown(cur);
    const id = window.setInterval(() => {
      cur += 1;
      setShown(cur);
      if (cur >= step) window.clearInterval(id);
    }, 550);
    return () => window.clearInterval(id);
  }, [step, calm]);
  return <Layout slide={slide} step={Math.min(shown, step)} calm={calm} onGoto={onGoto} />;
}
