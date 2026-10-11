import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState, type ReactNode } from "react";
import { EASE } from "@/components/kit";
import { SPEAKER } from "@/config";
import monogram from "@/assets/hs-monogram.png.asset.json";

/** Fades/slides in when `on`; fully reversible (renders hidden when off). */
export function Reveal({
  on,
  delay = 0,
  y = 16,
  children,
  className = "",
}: {
  on: boolean;
  delay?: number;
  y?: number;
  children: ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={false}
      animate={on ? { opacity: 1, y: 0 } : { opacity: 0, y: reduce ? 0 : y }}
      transition={{ duration: reduce ? 0.15 : 0.2, ease: EASE, delay: on && !reduce ? delay : 0 }}
      aria-hidden={!on}
    >
      {children}
    </motion.div>
  );
}

/** Counts 0→count at `ms` intervals while active; jumps to count when `done`. */
export function useTicker(count: number, ms: number, active: boolean, done: boolean) {
  const reduce = useReducedMotion();
  const [n, setN] = useState(done || (active && reduce) ? count : 0);
  useEffect(() => {
    if (done || (active && reduce)) return setN(count);
    if (!active) return setN(0);
    setN(1);
    const id = setInterval(() => setN((v) => (v >= count ? (clearInterval(id), v) : v + 1)), ms);
    return () => clearInterval(id);
  }, [count, ms, active, done, reduce]);
  return n;
}

export function Chip({ children, on = true, color = "var(--line)" }: { children: ReactNode; on?: boolean; color?: string }) {
  return (
    <span
      className="inline-flex items-center rounded-full border px-[20px] py-[10px] font-mono text-[22px] transition-colors duration-300"
      style={{
        borderColor: on ? color : "var(--line)",
        color: on ? "var(--text)" : "var(--muted)",
        background: on && color !== "var(--line)" ? `color-mix(in oklab, ${color} 8%, transparent)` : "transparent",
      }}
    >
      {children}
    </span>
  );
}

/** Signature rule: the four framework colours (delegate · direct · validate · own). */
export function BrandBar({ width = 240, height = 4 }: { width?: number; height?: number }) {
  return (
    <div className="flex gap-[6px]" style={{ width }} aria-hidden>
      {["var(--delegate-fill)", "var(--direct-fill)", "var(--validate-fill)", "var(--own-fill)"].map((c) => (
        <span key={c} className="flex-1 rounded-full" style={{ height, background: c }} />
      ))}
    </div>
  );
}

/** Pill-shaped eyebrow used for event / context labels on the stage. */
export function Pill({ children, size = "stage" }: { children: ReactNode; size?: "stage" | "page" }) {
  const cls =
    size === "stage" ? "gap-[12px] px-[22px] py-[10px] text-[17px]" : "gap-2 px-3 py-1.5 text-[12px]";
  return (
    <span className={`inline-flex items-center rounded-full border border-line bg-surface/60 font-mono tracking-[0.14em] text-muted uppercase ${cls}`}>
      <span className={`rounded-full bg-own-fill ${size === "stage" ? "h-[8px] w-[8px]" : "h-[6px] w-[6px]"}`} />
      {children}
    </span>
  );
}

export function SpeakerBlock({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-[24px]">
      <img src={monogram.url} alt={SPEAKER.monogram} className={compact ? "h-[64px] w-[64px]" : "h-[96px] w-[96px]"} />
      <div>
        <p className={`font-display font-bold text-text ${compact ? "text-[28px]" : "text-[36px]"}`}>{SPEAKER.name}</p>
        {SPEAKER.roles.map((r) => (
          <p key={r} className={`text-muted ${compact ? "text-[18px]" : "text-[22px]"}`}>
            {r}
          </p>
        ))}
      </div>
    </div>
  );
}

export function Tag({ children }: { children: ReactNode }) {
  return <p className="font-mono text-[20px] text-muted">{children}</p>;
}

/** On-slide source line: small, bottom right, 14 px muted. */
export function SrcTag({ items }: { items: (string | false | null | undefined)[] }) {
  const list = items.filter(Boolean) as string[];
  if (!list.length) return null;
  return (
    <p className="pointer-events-none absolute right-[96px] bottom-[44px] max-w-[1160px] text-right font-mono text-[14px] leading-[1.4] text-muted">
      Sources: {list.join(" · ")}
    </p>
  );
}
