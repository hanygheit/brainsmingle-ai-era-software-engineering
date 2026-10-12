import type { ReactNode } from "react";
import { EVENT, SPEAKER } from "@/config";
import opening from "@/content/opening.json";

/** Light page shell for the phone pages (/vote, /feedback, /results, /thanks): navy stage theme, no images, no animation library. */
export function MobileShell({ children, wide = false, maxW }: { children: ReactNode; wide?: boolean; maxW?: string }) {
  return (
    <main className="deck-room relative min-h-dvh overflow-x-hidden px-4 pt-5 pb-10 font-sans text-text sm:px-6" style={{ ["--ambient" as string]: "#5EE6AA" }}>
      <div className="room-backdrop" aria-hidden />
      <div className={`relative mx-auto ${maxW ?? (wide ? "max-w-5xl" : "max-w-md")}`}>
        <header className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border border-line font-display text-[14px] font-bold text-own" aria-hidden>
            {SPEAKER.monogram}
          </span>
          <div className="min-w-0 leading-tight">
            <p className="truncate font-display text-[15px] font-bold">{opening.s0.title}</p>
            <p className="truncate font-mono text-[11px] tracking-[0.12em] text-muted uppercase">{EVENT.name}</p>
          </div>
        </header>
        <div className="mt-5 flex gap-[5px]" style={{ width: 120 }} aria-hidden>
          {["var(--delegate-fill)", "var(--direct-fill)", "var(--validate-fill)", "var(--own-fill)"].map((c) => (
            <span key={c} className="h-[3px] flex-1 rounded-full" style={{ background: c }} />
          ))}
        </div>
        {children}
        <footer className="mt-12 flex items-center justify-between gap-4 border-t border-line pt-5 font-mono text-[11px] tracking-[0.12em] text-muted uppercase">
          <span>{SPEAKER.name}</span>
          <span className="text-right">{EVENT.track}</span>
        </footer>
      </div>
    </main>
  );
}

/** Live status pill with a soft pulsing dot. */
export function StatusPill({ children, live = true }: { children: ReactNode; live?: boolean }) {
  return (
    <p className="inline-flex items-center gap-2 rounded-full border border-line px-3 py-1.5 font-mono text-[12px] tracking-[0.14em] text-muted uppercase">
      <span className="relative flex h-2 w-2" aria-hidden>
        {live ? <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-own-fill opacity-60" /> : null}
        <span className={`relative inline-flex h-2 w-2 rounded-full ${live ? "bg-own-fill" : "bg-muted"}`} />
      </span>
      {children}
    </p>
  );
}

/** Compact horizontal bars for phones and the results page. */
export function MiniBars({ labels, counts, highlight }: { labels: string[]; counts: number[]; highlight?: number | null }) {
  const total = counts.reduce((a, b) => a + b, 0);
  const max = Math.max(0, ...counts);
  return (
    <ul className="space-y-3">
      {labels.map((label, i) => {
        const n = counts[i] ?? 0;
        const pct = total ? Math.round((n / total) * 100) : 0;
        const lead = total > 0 && n === max;
        return (
          <li key={label}>
            <div className="flex items-baseline justify-between gap-3 text-[15px] leading-snug">
              <span className="min-w-0">
                {label}
                {highlight === i + 1 ? <span className="ml-2 font-mono text-[11px] tracking-[0.12em] text-own uppercase">· you</span> : null}
              </span>
              <span className="shrink-0 font-mono text-[14px] tabular-nums" style={{ color: lead ? "var(--own)" : "var(--muted)" }}>
                {n} · {pct}%
              </span>
            </div>
            <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-line/70">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${pct}%`,
                  background: lead ? "var(--own-fill)" : "color-mix(in oklab, var(--muted) 55%, transparent)",
                  transition: "width 300ms cubic-bezier(0.22, 1, 0.36, 1)",
                }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
