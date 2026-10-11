import { ArcMotif } from "@/components/kit";
import type { ScreenProps } from "@/components/deck/ScreenRenderer";
import { ACT_COLORS } from "@/deck/theme";
import c from "@/content/separators.json";
import { Reveal } from "./shared";

/* ---------- Act separators (navy) ---------- */
export function ActSeparator({ screen, step }: ScreenProps) {
  const s = c[String(screen.separator) as keyof typeof c];
  return (
    <div className="relative h-full w-full overflow-hidden">
      <div
        className="pointer-events-none absolute top-1/2 right-[-220px] -translate-y-1/2 opacity-40"
        aria-hidden
      >
        <ArcMotif count={5} radius={480} />
      </div>
      <div className="absolute inset-y-0 left-[160px] flex max-w-[1400px] flex-col justify-center">
        <Reveal on={step >= 1} y={10}>
          <p className="t-tag text-muted">{s.eyebrow}</p>
        </Reveal>
        <Reveal on={step >= 1} delay={0.06} y={12}>
          <h2 className="mt-[24px] font-display text-[96px] leading-[1.02] font-bold tracking-[-0.035em] text-text">
            {s.title}
          </h2>
        </Reveal>
        <Reveal on={step >= 2} y={10}>
          <p className="mt-[32px] text-[36px] leading-[1.3] text-muted">{s.question}</p>
        </Reveal>
        <Reveal on={step >= 3} y={0}>
          <div
            className="mt-[48px] h-[3px] w-[240px]"
            style={{ background: ACT_COLORS[screen.act] }}
          />
        </Reveal>
      </div>
    </div>
  );
}
