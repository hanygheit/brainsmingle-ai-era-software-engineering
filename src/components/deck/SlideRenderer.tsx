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

const LAYOUTS: Record<string, (p: LayoutProps) => React.ReactElement> = {
  title: TitleSlide,
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
  return <Layout slide={slide} step={step} calm={calm} onGoto={onGoto} />;
}
