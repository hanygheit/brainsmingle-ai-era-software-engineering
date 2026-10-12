import { ArcMotif } from "@/components/kit";
import type { ScreenProps } from "@/components/deck/ScreenRenderer";
import { ACT_COLORS, ACT_COLORS_ON_NAVY, stopColors } from "@/deck/theme";
import c from "@/content/separators.json";
import agenda from "@/content/agenda.json";
import { Reveal } from "./shared";

/* ---------- Act separators (navy) ---------- */
export function ActSeparator({ screen, step }: ScreenProps) {
  const s = c[String(screen.separator) as keyof typeof c];
  const n = screen.separator ?? 1;
  const stop = n; // act n is agenda stop n
  const fill = ACT_COLORS[screen.act] ?? "#4C8DFF";
  const ink = ACT_COLORS_ON_NAVY[screen.act] ?? "var(--text)";
  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* act-coloured glow behind the numeral */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: `radial-gradient(ellipse 48% 68% at 78% 46%, color-mix(in oklab, ${fill} 30%, transparent) 0%, transparent 70%)` }}
        aria-hidden
      />
      <div className="pointer-events-none absolute top-[470px] left-[1490px] h-0 w-0" aria-hidden>
        <div className="absolute -translate-x-1/2 -translate-y-1/2 opacity-60">
          <ArcMotif count={5} radius={470} color={`color-mix(in oklab, ${ink} 22%, transparent)`} />
        </div>
        <Reveal on={step >= 1} y={0} className="absolute -translate-x-1/2 -translate-y-1/2">
          <span
            className="block font-display leading-[0.8] font-bold tracking-[-0.06em] whitespace-nowrap"
            style={{
              fontSize: 560,
              color: "transparent",
              backgroundImage: `linear-gradient(180deg, ${ink} 0%, color-mix(in oklab, ${ink} 55%, transparent) 55%, color-mix(in oklab, ${ink} 6%, transparent) 100%)`,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
            }}
          >
            {String(stop).padStart(2, "0")}
          </span>
        </Reveal>
      </div>

      <div className="absolute top-0 bottom-[200px] left-[160px] flex w-[980px] flex-col justify-center">
        <Reveal on={step >= 1} y={10}>
          <span
            className="inline-flex items-center gap-[14px] rounded-full border px-[22px] py-[10px] font-mono text-[18px] font-semibold tracking-[0.2em]"
            style={{ borderColor: `color-mix(in oklab, ${ink} 45%, transparent)`, color: ink, background: `color-mix(in oklab, ${ink} 10%, transparent)` }}
          >
            <span className="h-[9px] w-[9px] rounded-full" style={{ background: ink }} />
            {s.eyebrow}
          </span>
        </Reveal>
        <Reveal on={step >= 1} delay={0.06} y={12}>
          <h2 className="mt-[36px] font-display text-[120px] leading-[0.98] font-bold tracking-[-0.04em] text-text">{s.title}</h2>
        </Reveal>
        <Reveal on={step >= 2} y={10}>
          <p className="mt-[36px] max-w-[900px] text-[40px] leading-[1.3] text-muted">{s.question}</p>
        </Reveal>
        <Reveal on={step >= 3} y={0}>
          <div className="mt-[48px] h-[4px] w-[240px] rounded-full" style={{ background: `linear-gradient(90deg, ${ink}, ${fill})` }} />
        </Reveal>
      </div>

      {/* Seven-stop roadmap (same as the agenda): where we are in the talk */}
      <Reveal on={step >= 2} y={8} className="absolute right-[160px] bottom-[88px] left-[160px]">
        <ol className="grid grid-cols-7 gap-[20px]">
          {agenda.stops.map((a, i) => {
            const k = i + 1;
            const cur = k === stop;
            const past = k < stop;
            const { fill: aFill, ink: aInk } = stopColors(k);
            return (
              <li key={a.n} className="flex flex-col gap-[14px]">
                <span
                  className="h-[4px] rounded-full"
                  style={{ background: cur ? `linear-gradient(90deg, ${aInk}, ${aFill})` : past ? `color-mix(in oklab, ${aInk} 40%, var(--line))` : "var(--line)" }}
                />
                <span className="flex items-baseline gap-[10px] text-[18px] leading-[1.25]" style={{ color: cur ? "var(--text)" : "var(--muted)" }}>
                  <span className="font-mono text-[15px] font-semibold tracking-[0.12em]" style={{ color: cur || past ? aInk : "var(--muted)" }}>
                    {a.n}
                  </span>
                  <span className={cur ? "font-semibold" : ""}>{a.name}</span>
                </span>
              </li>
            );
          })}
        </ol>
      </Reveal>
    </div>
  );
}
