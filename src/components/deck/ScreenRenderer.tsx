import { useEffect, useState, type ComponentType } from "react";
import { useReducedMotion } from "framer-motion";
import type { Screen } from "@/content/screens";
import { ArcMotif, Eyebrow, Headline } from "@/components/kit";
import { ACT_COLORS, isPaper } from "@/deck/theme";
import { S0, S1, S2 } from "@/components/screens/opening";
import { S4, S5, S6, S7, S8, S9 } from "@/components/screens/act1";
import { S10, S12, S13, S14, S15, S16, S17 } from "@/components/screens/act2";
import { S19, S20, S21, S22, S23, S25, S26, S27, S28, S29 } from "@/components/screens/act3";
import { S31, S32, S33, S34, S35, S36, S37, S38 } from "@/components/screens/act5";
import { ActSeparator } from "@/components/screens/separators";

export interface ScreenProps {
  screen: Screen;
  /** Current build phase, 0..screen.steps. Driven by the auto sequence, never by clicks. */
  step: number;
  /** Screen-local choice from keys 1–6. */
  choice: number | null;
}

const REGISTRY: Partial<Record<string, ComponentType<ScreenProps>>> = {
  S0, S1, S2, S4, S5, S6, S7, S8, S9, S10, S12, S13, S14, S15, S16, S17, S19, S20, S21, S22, S23, S25, S26, S27, S28, S29, S31, S32, S33, S34, S35, S36, S37, S38,
};

/** Milliseconds at which phase k (1-based) starts. */
export function phaseTimes(screen: Screen): number[] {
  return Array.from({ length: screen.steps }, (_, i) => screen.timeline?.[i] ?? (i + 1) * 60);
}

/** Plays phases 0→steps on mount when `play`; otherwise (back, print, thumbnails) shows the final state. */
function useAutoPhase(screen: Screen, play: boolean) {
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState(play && !reduce ? 0 : screen.steps);
  useEffect(() => {
    if (!play || reduce) return setPhase(screen.steps);
    setPhase(0);
    const timers = phaseTimes(screen).map((t, i) => setTimeout(() => setPhase(i + 1), t));
    return () => timers.forEach(clearTimeout);
  }, [screen, play, reduce]);
  return phase;
}

export function ScreenRenderer({
  screen,
  choice,
  replay,
  play = false,
}: {
  screen: Screen;
  choice: number | null;
  replay?: number;
  /** true = play the build sequence; false = render the complete final state. */
  play?: boolean;
}) {
  return <Auto key={`${screen.id}-${replay ?? 0}`} screen={screen} choice={choice} play={play} />;
}

function Auto({ screen, choice, play }: { screen: Screen; choice: number | null; play: boolean }) {
  const step = useAutoPhase(screen, play);
  const C = screen.separator ? ActSeparator : (REGISTRY[screen.id] ?? PlaceholderScreen);
  if (!isPaper(screen.id)) return <C screen={screen} step={step} choice={choice} />;
  const act = ACT_COLORS[screen.act] ?? "var(--ink)";
  return (
    <div className="theme-paper relative h-full w-full" style={{ ["--act" as string]: act }}>
      <div className="pointer-events-none absolute -top-[260px] -right-[260px] opacity-[0.06]" aria-hidden>
        <ArcMotif radius={410} color="var(--ink)" />
      </div>
      <div className="pointer-events-none absolute top-0 right-0 left-0 z-20 h-[4px]" style={{ background: act }} aria-hidden />
      <div className="relative h-full w-full">
        <C screen={screen} step={step} choice={choice} />
      </div>
    </div>
  );
}

function PlaceholderScreen({ screen }: ScreenProps) {
  return (
    <div className="flex h-full w-full flex-col justify-center p-[96px]">
      <Eyebrow>{screen.act}</Eyebrow>
      <Headline className="mt-[24px]">{screen.id}</Headline>
    </div>
  );
}
