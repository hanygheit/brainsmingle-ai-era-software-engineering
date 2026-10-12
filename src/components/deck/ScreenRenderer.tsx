import { useEffect, useState, type ComponentType } from "react";
import { useReducedMotion } from "framer-motion";
import { screens, type Screen } from "@/content/screens";
import { ArcMotif, Eyebrow, Headline } from "@/components/kit";
import { SPEAKER } from "@/config";
import opening from "@/content/opening.json";
import { ACT_COLORS, actInfo, isPaper, stopLabel } from "@/deck/theme";
import { S0, S1, S2 } from "@/components/screens/opening";
import { S5, S6, S7, S8, S10, S11 } from "@/components/screens/act1";
import { S12, S19, S20, S21, S15, S16, S22 } from "@/components/screens/act2";
import { S25, S26, S27, S29, S30, S33, S34, S35, S36, S37 } from "@/components/screens/act3";
import { S41, S42, S43, S44, S48, S49, S50, S51 } from "@/components/screens/act5";
import { ActSeparator } from "@/components/screens/separators";
import { S3, S9, S13, S17, S23, S28, S31, S38, S40, S45, S47 } from "@/components/screens/stops";

const TALK_TITLE = opening.s0.title;

export interface ScreenProps {
  screen: Screen;
  /** Current build phase, 0..screen.steps. Driven by the auto sequence, never by clicks. */
  step: number;
  /** Screen-local choice from keys 1–6. */
  choice: number | null;
}

const REGISTRY: Partial<Record<string, ComponentType<ScreenProps>>> = {
  S0, S1, S2, S3, S5, S6, S7, S8, S9, S10, S11, S12, S13, S15, S16, S17, S19, S20, S21, S22, S23, S25, S26, S27, S28, S29, S30, S31,
  S33, S34, S35, S36, S37, S38, S40, S41, S42, S43, S44, S45, S47, S48, S49, S50, S51,
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
  if (!isPaper(screen.id)) {
    return (
      <div className="slide-root relative h-full w-full">
        <div className="stage-atmosphere pointer-events-none absolute inset-0" aria-hidden />
        <div className="relative h-full w-full">
          <C screen={screen} step={step} choice={choice} />
        </div>
      </div>
    );
  }
  const act = ACT_COLORS[screen.act] ?? "var(--ink)";
  return (
    <div className="slide-root theme-paper relative h-full w-full" style={{ ["--act" as string]: act }}>
      <div className="paper-atmosphere pointer-events-none absolute inset-0" aria-hidden />
      <div className="pointer-events-none absolute -top-[260px] -right-[260px] opacity-[0.06]" aria-hidden>
        <ArcMotif radius={410} color="var(--ink)" />
      </div>
      <div className="pointer-events-none absolute top-0 right-0 left-0 z-20 h-[4px]" style={{ background: act }} aria-hidden />
      <PaperFrame screen={screen} />
      <div className="relative h-full w-full">
        <C screen={screen} step={step} choice={choice} />
      </div>
    </div>
  );
}

/** Running header (act marker) and footer (talk · speaker · slide number) on every paper slide. */
function PaperFrame({ screen }: { screen: Screen }) {
  const info = actInfo(screen.act);
  const n = screens.indexOf(screen);
  return (
    <div className="pointer-events-none absolute inset-0 z-10 font-mono text-[17px] tracking-[0.14em] uppercase" aria-hidden>
      {info ? (
        <div className="absolute top-[30px] left-[96px] flex items-center gap-[14px]">
          <span className="h-[8px] w-[8px] rounded-full" style={{ background: "var(--act)" }} />
          <span className="act-ink font-semibold">{stopLabel(info.stop)}</span>
          <span className="h-[14px] w-px bg-[var(--rule)]" />
          <span className="text-muted">{info.name}</span>
        </div>
      ) : null}
      <div className="absolute bottom-[40px] left-[96px] flex items-center gap-[14px] text-[15px] text-muted">
        <span className="act-ink font-semibold tabular-nums">{String(n).padStart(2, "0")}</span>
        <span className="h-[12px] w-px bg-[var(--rule)]" />
        <span>{TALK_TITLE}</span>
        <span className="opacity-60">·</span>
        <span>{SPEAKER.name}</span>
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
