import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { ArcMotif, EASE, Eyebrow, StatNumber } from "@/components/kit";
import type { ScreenProps } from "@/components/deck/ScreenRenderer";
import c from "@/content/act1.json";
import { Chip, Reveal, SrcTag, Tag } from "./shared";

const H = "font-display font-bold tracking-[-0.03em] text-text";

/** Types `text` in ~720 ms once `active` turns on. */
function TypeIn({ text, active }: { text: string; active: boolean }) {
  const reduce = useReducedMotion();
  // Already active on mount = opened in its final state (back / print): show full text.
  const activeAtMount = useRef(active);
  const [n, setN] = useState(text.length);
  useEffect(() => {
    if (!active || reduce || activeAtMount.current) return setN(text.length);
    setN(0);
    const per = Math.max(1, Math.ceil(text.length / 36));
    const id = setInterval(() => setN((v) => (v >= text.length ? (clearInterval(id), v) : v + per)), 20);
    return () => clearInterval(id);
  }, [text, active, reduce]);
  return <>{text.slice(0, n)}</>;
}

/* ---------- S5 · Everyone can build software now ---------- */
export function S5({ step }: ScreenProps) {
  const s = c.s3;
  return (
    <div className="relative flex h-full w-full flex-col p-[96px]">
      <p className={`${H} text-[72px]`}>{s.headline}</p>
      <div className="mt-[56px] grid flex-1 grid-cols-[1fr_1px_1fr] gap-[64px] pb-[48px]">
        <div className="flex flex-col gap-[28px]">
          <Eyebrow>{s.left}</Eyebrow>
          <Reveal on={step >= 1}>
            {[s.appBuilders, s.workflow].map((g) => (
              <div key={g.label} className="mb-[28px]">
                <p className="mb-[14px] text-[26px] text-muted">{g.label}</p>
                <div className="flex flex-wrap gap-[14px]">
                  {g.items.map((t) => <Chip key={t} color="var(--direct)">{t}</Chip>)}
                </div>
              </div>
            ))}
            <p className="text-[30px] leading-[1.3] text-text">{s.caption}</p>
          </Reveal>
          <Reveal on={step >= 2} className="mt-auto flex flex-col gap-[16px]">
            <Chip color="var(--validate)">{s.evidence1}</Chip>
            <p className="text-[28px] text-text">{s.evidence2}</p>
            <span className="self-start rounded-full bg-own-fill/15 px-[20px] py-[10px] font-mono text-[20px] text-own">{s.badge}</span>
          </Reveal>
        </div>
        <div className="bg-line" />
        <div className="flex flex-col gap-[28px]">
          <Eyebrow>{s.right}</Eyebrow>
          <Reveal on={step >= 3}>
            <p className="mb-[14px] text-[26px] text-muted">{s.assist.label}</p>
            <div className="flex flex-wrap gap-[14px]">
              {s.assist.items.map((t) => <Chip key={t} color="var(--direct)">{t}</Chip>)}
            </div>
          </Reveal>
          <Reveal on={step >= 4} className="mt-[28px]">
            <p className="mb-[14px] text-[26px] text-muted">{s.agents.label}</p>
            <div className="flex flex-wrap gap-[14px]">
              {s.agents.items.map((t) => <Chip key={t} color="var(--own)">{t}</Chip>)}
            </div>
            <div className="mt-[24px]"><Tag>{s.agentsTag}</Tag></div>
          </Reveal>
        </div>
      </div>
      <SrcTag items={[step >= 2 && "Fortune, Nov 2025", step >= 4 && "Stack Overflow 2026"]} />
    </div>
  );
}

/* ---------- S6 · The unit of delegation changed ---------- */
export function S6({ step }: ScreenProps) {
  const [pop, setPop] = useState(false);
  const s = c.s3;
  const pct = step >= 1 ? 92 : 18;
  return (
    <div className="relative h-full w-full overflow-hidden p-[96px]">
      <SrcTag items={["GitHub, Apr 2026"]} />
      <p className={`${H} text-[72px]`}>{s.ladderHeadline}</p>
      <div className="pointer-events-none absolute -bottom-[420px] -left-[300px] opacity-70">
        <motion.div initial={false} animate={{ scale: pct / 100 }} transition={{ duration: 0.6, ease: EASE }}>
          <ArcMotif count={6} radius={640} />
        </motion.div>
      </div>
      <div className="relative mt-[56px] flex flex-col items-start gap-[18px]">
        {s.rungs.map(([name, hand], i) => {
          const last = i === 5;
          return (
            <Reveal key={name} on={step >= 1} delay={i * 0.06} y={10}>
              <button
                type="button"
                disabled={!last}
                onClick={(e) => {
                  e.stopPropagation();
                  setPop((p) => !p);
                }}
                className="flex items-baseline gap-[24px] rounded-[16px] border bg-surface px-[28px] py-[12px] text-left"
                style={{
                  marginLeft: i * 72,
                  borderColor: last ? "var(--own)" : "var(--line)",
                  boxShadow: last ? "0 0 0 1px var(--own), 0 18px 44px -18px color-mix(in oklab, var(--own) 55%, transparent)" : undefined,
                }}
              >
                <span className="act-ink font-mono text-[24px] font-semibold">{i + 1}</span>
                <span className={`${H} text-[44px] ${last ? "underline decoration-own decoration-2 underline-offset-8" : ""}`}>{name}</span>
                <span className="text-[30px] text-muted">— {hand}</span>
              </button>
            </Reveal>
          );
        })}
        {pop ? (
          <div className="absolute top-full left-[420px] mt-[20px] max-w-[760px] rounded-[16px] border border-own bg-surface p-[28px] text-[26px] text-text">
            {s.popover}
          </div>
        ) : null}
      </div>
    </div>
  );
}

/* ---------- S7 · Then / Now ---------- */
export function S7({ step }: ScreenProps) {
  const s = c.s3;
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center gap-[40px] p-[96px]">
      <Reveal on={step >= 1} className="w-[1500px]">
        <div className="theme-stage rounded-[24px] border border-line bg-surface p-[48px]">
          <p className="t-tag text-muted">Then</p>
          <p className="mt-[16px] font-mono text-[44px] text-muted">{s.then}</p>
        </div>
      </Reveal>
      <Reveal on={step >= 2} className="w-[1500px]">
        <div className="theme-stage rounded-[24px] border border-own bg-surface p-[48px]">
          <p className="t-tag text-own">Now</p>
          <p className="mt-[16px] min-h-[248px] font-mono text-[44px] leading-[1.4] text-text">
            <TypeIn text={s.now} active={step === 2} />
          </p>
        </div>
      </Reveal>
    </div>
  );
}

/* ---------- S8 · AI is already inside the workflow ---------- */
export function S8({ step }: ScreenProps) {
  const s = c.s4;
  const grown = step >= 1;
  const idx = grown ? 2 : 0;
  const pts = s.points;
  const W = 760, Hh = 300;
  const xy = (i: number) => [80 + (i * (W - 160)) / 2, Hh - 30 - ((pts[i]?.value ?? 0) / 100) * (Hh - 60)] as const;
  let d = "";
  for (let i = 0; i < pts.length; i++) {
    const [x, y] = xy(i);
    if (i === 0) d = `M${x},${y}`;
    else d += ` H${x} V${y}`;
  }
  return (
    <div className="relative flex h-full w-full flex-col p-[96px]">
      <SrcTag items={["Google, Oct 2024 · Apr 2026", step >= 3 && "Anthropic, Jun 2026", step >= 3 && "Coinbase, Sep 2025", step >= 3 && "JetBrains, Aug 2026", step >= 3 && "Stack Overflow, Oct 2026"]} />
      <div className="flex items-end gap-[80px]">
        <div>
          <StatNumber value={pts[idx]?.value ?? 0} suffix="%" color="var(--own)" label={`${s.statLabel} · ${pts[idx]?.label ?? ""}`} />
        </div>
        <svg width={W} height={Hh} aria-hidden>
          <motion.path d={d} fill="none" stroke="var(--own-fill)" strokeWidth={4} initial={false} animate={{ pathLength: grown ? 1 : 0 }} transition={{ duration: 0.6, ease: "linear" }} />
          {pts.map((p, i) => {
            const [x, y] = xy(i);
            return (
              <motion.g key={p.label} initial={false} animate={{ opacity: i <= idx ? 1 : 0.2 }} transition={{ duration: 0.15, delay: grown ? i * 0.28 : 0 }}>
                <circle cx={x} cy={y} r={9} fill="var(--own-fill)" />
                <text x={x} y={Hh - 2} textAnchor="middle" fill="var(--muted)" fontSize={20} fontFamily="JetBrains Mono">{p.label}</text>
              </motion.g>
            );
          })}
        </svg>
      </div>
      <div className="mt-[36px]">
        <Reveal on={step >= 2}>
          <figure className="max-w-[1500px] rounded-[20px] border border-line bg-surface px-[40px] py-[32px]">
            <blockquote className="text-[36px] leading-[1.25] text-text">
              “{s.quoteBefore}<span className="underline decoration-own decoration-4 underline-offset-8">{s.quoteMark}</span>{s.quoteAfter}”
            </blockquote>
            <figcaption className="mt-[20px] text-[24px]">
              <span className="font-semibold text-text">{s.speaker}</span>
              <span className="text-muted"> · {s.role} · {s.source}</span>
            </figcaption>
          </figure>
        </Reveal>
        <div className="mt-[24px] grid grid-cols-4 gap-[20px]">
          {s.tiles.map(([v, label, src], i) => (
            <Reveal key={src} on={step >= 3} delay={i * 0.06} className="h-full">
              <div className="h-full rounded-[16px] border border-line bg-surface px-[24px] py-[18px]">
                <p className="font-display text-[44px] leading-[1] font-bold text-own tabular-nums">{v}</p>
                <p className="mt-[10px] text-[19px] leading-[1.3] text-text">{label}</p>
                <p className="mt-[8px] font-mono text-[14px] text-muted">{src}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
      <Reveal on={step >= 4} className="mt-auto">
        <p className={`${H} keyline text-[64px]`}>{s.last}</p>
      </Reveal>
    </div>
  );
}

/* ---------- S10 · When writing code is no longer the constraint ---------- */
export function S10({ step }: ScreenProps) {
  const s = c.s5;
  const reduce = useReducedMotion();
  const ci = 3;
  return (
    <div className="relative flex h-full w-full flex-col p-[96px]">
      <SrcTag items={[step >= 1 && "Anthropic, 14 Sep 2026", "Axios, Jan 2026"]} />
      <div className="relative">
        <div className="flex gap-[36px]">
          {s.stages.map((st, i) => {
            const hot = i === ci;
            return (
              <div
                key={st}
                className="relative flex h-[120px] flex-1 items-center justify-center rounded-[16px] border bg-surface text-center text-[26px] font-semibold transition-colors duration-700"
                style={{ borderColor: hot ? "var(--validate)" : "var(--line)", color: hot ? "var(--validate)" : "var(--text)", boxShadow: hot ? "0 0 48px color-mix(in oklab, var(--validate) 45%, transparent)" : undefined }}
              >
                {st}
                {i < s.stages.length - 1 ? (
                  <svg className="absolute top-1/2 -right-[30px] -translate-y-1/2" width="24" height="24" viewBox="0 0 24 24" aria-hidden>
                    <path d="M9 5l7 7-7 7" fill="none" stroke="var(--muted)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : null}
              </div>
            );
          })}
        </div>
        <motion.div
          className="pointer-events-none absolute -top-[16px] h-[152px] w-[16%] rounded-[20px]"
          style={{ background: "linear-gradient(90deg, transparent, color-mix(in oklab, var(--validate) 25%, transparent), transparent)" }}
          initial={false}
          animate={{ left: reduce ? "50%" : ["0%", "50%"] }}
          transition={{ duration: reduce ? 0 : 0.6, ease: EASE }}
        />
      </div>
      <div className="mt-[56px]">
        <Reveal on={step >= 1}>
          <p className="font-display text-[40px] font-bold text-text">{s.numbers}</p>
          <div className="mt-[14px] flex gap-[24px]"><Tag>{s.numbersSource}</Tag><Tag>· {s.tag}</Tag></div>
        </Reveal>
        <Reveal on={step >= 2} className="mt-[40px]">
          <blockquote className="max-w-[1500px] border-l-4 border-validate pl-[32px] text-[36px] leading-[1.3] text-text">
            “{s.quote}”
            <span className="mt-[12px] block text-[22px] text-muted">— {s.speaker}, {s.role}</span>
          </blockquote>
        </Reveal>
      </div>
      <div className="mt-auto">
        <Reveal on={step >= 3}>
          <p className={`${H} keyline text-[56px]`}>{s.last}</p>
        </Reveal>
        <p className="mt-[28px] max-w-[1600px] text-[20px] text-muted">{s.footer}</p>
      </div>
    </div>
  );
}

/* ---------- S11 · More code is not more engineering value ---------- */
export function S11({ step }: ScreenProps) {
  const s = c.s6;
  const max = 30;
  return (
    <div className="relative flex h-full w-full flex-col p-[96px]">
      <SrcTag items={["METR, Jul 2025 · Feb 2026", step >= 1 && "Cui et al., Management Science", step >= 2 && "Faros AI, Sep 2026", step >= 2 && "DORA, Mar 2026", step >= 2 && "Stack Overflow, 2025"]} />
      <Eyebrow>{s.label}</Eyebrow>
      <div className="mt-[32px] grid grid-cols-2 gap-[48px]">
        <div className="rounded-[20px] border border-line bg-surface p-[40px]">
          <p className="font-display text-[36px] font-bold text-text">{s.metr.title}</p>
          <p className="mt-[6px] text-[20px] text-muted">{s.metr.meta}</p>
          <div className="relative mt-[36px] flex h-[300px] items-center gap-[48px] px-[24px]">
            <div className="absolute inset-x-0 top-1/2 h-px bg-muted" />
            {s.metr.bars.map((b, i) => {
              const neg = b.value < 0;
              const h = (Math.abs(b.value) / max) * 140;
              return (
                <div key={b.label} className="relative flex h-full flex-1 flex-col items-center">
                  <motion.div
                    className="absolute left-1/2 w-[72px] -translate-x-1/2 rounded-[6px]"
                    style={{ background: neg ? "var(--fail)" : "var(--direct-fill)", [neg ? "top" : "bottom"]: "50%" }}
                    initial={false}
                    animate={{ height: step >= 1 || i < 2 ? h : 0 }}
                    transition={{ duration: 0.6, ease: EASE }}
                  />
                  <p className="absolute font-mono text-[26px] tabular-nums" style={{ color: neg ? "var(--fail)" : "var(--text)", [neg ? "top" : "bottom"]: `calc(50% + ${h + 8}px)`, opacity: step >= 1 || i < 2 ? 1 : 0 }}>
                    {"text" in b && b.text ? b.text : `${b.value > 0 ? "+" : "−"}${Math.abs(b.value)}%`}
                  </p>
                  <p className="absolute -bottom-[32px] text-[20px] text-muted">{b.label}</p>
                </div>
              );
            })}
          </div>
          <p className="mt-[48px] text-[20px] text-muted">{s.metr.unit}</p>
        </div>
        <Reveal on={step >= 1}>
          <div className="h-full rounded-[20px] border border-line bg-surface p-[40px]">
            <p className="font-display text-[36px] font-bold text-text">{s.cui.title}</p>
            <p className="mt-[6px] text-[20px] text-muted">{s.cui.meta}</p>
            <p className="mt-[60px] font-display text-[120px] leading-[1] font-bold text-own">+{s.cui.value}%</p>
            <p className="mt-[12px] text-[28px] text-text">{s.cui.valueLabel}</p>
            <p className="mt-[24px] text-[24px] text-muted">{s.cui.note}</p>
          </div>
        </Reveal>
      </div>
      <Reveal on={step >= 2} className="mt-[36px] flex flex-col gap-[10px]">
        {s.band.map((b) => <Tag key={b}>{b}</Tag>)}
      </Reveal>
      <Reveal on={step >= 3} className="mt-auto">
        <p className={`${H} keyline text-[64px]`}>{s.last}</p>
      </Reveal>
    </div>
  );
}
