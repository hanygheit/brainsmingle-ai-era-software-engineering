import { motion } from "framer-motion";
import { useState } from "react";
import { CodeDiff, EASE, Eyebrow, QuoteGlyph } from "@/components/kit";
import type { ScreenProps } from "@/components/deck/ScreenRenderer";
import tk from "@/content/tasks.json";
import a2 from "@/content/act2.json";
import asm from "@/content/assessment.json";
import { LiveVote } from "./live-vote";
import { Chip, Reveal, SrcTag, Tag } from "./shared";

const H = "font-display font-bold tracking-[-0.03em] text-text";

/* ---------- S12 · Tasks vs engineering (Act 1 close) ---------- */
export function S12({ step }: ScreenProps) {
  const s = tk.s12;
  return (
    <div className="relative flex h-full w-full flex-col p-[96px]">
      <p className={`${H} max-w-[1600px] text-[64px] leading-[1.08]`}>{s.headline}</p>
      <div className="flex flex-1 items-center py-[40px]">
      <div className="grid w-full grid-cols-[660px_1fr] gap-[40px]">
        {/* The agent's side: muted, terminal-style ticks — the opening's terminal, replayed. */}
        <Reveal on={step >= 1} className="h-full">
          <div className="h-full rounded-[20px] border border-line bg-surface px-[44px] py-[44px]">
            <p className="font-mono text-[22px] tracking-[0.12em] text-muted uppercase">{s.agentLabel}</p>
            <ul className="mt-[32px] space-y-[26px] font-mono text-[29px] text-muted">
              {s.agent.map((t) => (
                <li key={t} className="flex items-center gap-[16px]">
                  <span className="text-own" aria-hidden>✓</span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
        {/* Your side: the accent, larger. */}
        <Reveal on={step >= 2} className="h-full">
          <div className="h-full rounded-[20px] border-l-[8px] bg-surface px-[48px] py-[44px]" style={{ borderColor: "var(--act)" }}>
            <p className="act-ink font-display text-[38px] font-bold tracking-[-0.01em]">{s.youLabel}</p>
            <div className="mt-[26px] space-y-[20px]">
              {s.you.map((t, i) => (
                <Reveal key={t} on={step >= 2} delay={0.06 * (i + 1)} y={8}>
                  <p className="flex items-baseline gap-[20px] text-[38px] leading-[1.25] font-semibold text-text">
                    <span className="block h-[13px] w-[13px] shrink-0 -translate-y-[6px] rounded-full" style={{ background: "var(--act)" }} aria-hidden />
                    {t}
                  </p>
                </Reveal>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
      </div>
      <Reveal on={step >= 3}>
        <p className={`${H} keyline text-[56px]`}>{s.line}</p>
      </Reveal>
    </div>
  );
}

/* ---------- S15–S17 · AI-native is not fundamentals-free (Keep · Shift / Add · Prove / Dohmke) ---------- */
function FundamentalsColumns({ step, keys }: { step: number; keys: string[] }) {
  const s = a2.s8;
  return (
    <div className="relative flex h-full w-full flex-col p-[96px]">
      <p className={`${H} text-[72px]`}>{s.headline}</p>
      <div className="mt-[48px] grid grid-cols-2 gap-[40px]">
        {s.columns
          .filter((c) => keys.includes(c.key))
          .map((c, i) => {
            const prove = c.key === "PROVE";
            return (
              <Reveal key={c.key} on={step >= 1} delay={i * 0.06}>
                <div className="relative h-full overflow-hidden rounded-[20px] border bg-surface p-[44px]" style={{ borderColor: prove ? "var(--own)" : "var(--line)" }}>
                  <div className="absolute inset-x-0 top-0 h-[6px]" style={{ background: prove ? "var(--own-fill)" : "var(--act)" }} />
                  <div className="flex items-baseline gap-[20px] border-b border-line pb-[20px]">
                    <p className="font-display text-[56px] leading-none font-bold" style={{ color: prove ? "var(--own)" : "var(--text)" }}>{c.key}</p>
                    <p className="text-[26px] text-muted">— {c.sub}</p>
                  </div>
                  <ul className="mt-[24px] space-y-[10px] text-[28px] leading-[1.3] text-text">
                    {c.items.map((it) => (
                      <li key={it} className="flex items-baseline gap-[16px]">
                        <span className="h-[8px] w-[8px] shrink-0 -translate-y-[4px] rounded-full" style={{ background: prove ? "var(--own-fill)" : "var(--act)" }} />
                        {it}
                      </li>
                    ))}
                  </ul>
                  {"chip" in c && c.chip ? <p className="mt-[24px] rounded-[12px] border border-validate px-[18px] py-[12px] text-[24px] text-validate">{c.chip}</p> : null}
                </div>
              </Reveal>
            );
          })}
      </div>
    </div>
  );
}
export function S15({ step }: ScreenProps) {
  return <FundamentalsColumns step={step} keys={["KEEP", "SHIFT"]} />;
}
export function S16({ step }: ScreenProps) {
  return <FundamentalsColumns step={step} keys={["ADD", "PROVE"]} />;
}
export function S17({ step }: ScreenProps) {
  const s = a2.s8;
  return (
    <div className="relative flex h-full w-full flex-col justify-center p-[96px]">
      <SrcTag items={["Thomas Dohmke, Aug 2025"]} />
      <QuoteGlyph className="absolute top-[150px] left-[70px]" size={420} />
      <Reveal on={step >= 1}>
        <blockquote className="max-w-[1560px] border-l-[6px] border-own pl-[48px] font-display text-[60px] leading-[1.2] font-bold tracking-[-0.02em] text-text">
          “{s.quote}”<span className="mt-[28px] block font-sans text-[30px] font-normal tracking-normal text-muted">— {s.quoteBy}</span>
        </blockquote>
      </Reveal>
    </div>
  );
}

/* ---------- S22 · Learn with AI — and without it ---------- */
export function S22({ step }: ScreenProps) {
  const s = a2.s10;
  return (
    <div className="relative flex h-full w-full flex-col p-[96px]">
      <SrcTag items={["Anthropic, 29 Jan 2026", step >= 2 && "DORA, Mar 2026", step >= 2 && "Stanford Daily, Mar 2026"]} />
      <p className={`${H} text-[64px]`}>{s.headline}</p>
      <div className="mt-[40px] grid grid-cols-2 gap-[72px]">
        <div>
          <p className="text-[20px] text-muted">{s.trial}</p>
          <div className="mt-[28px] space-y-[24px]">
            {s.bars.map((b, i) => (
              <div key={b.label}>
                <div className="mb-[8px] flex justify-between text-[28px]"><span className="text-text">{b.label}</span><span className="font-mono tabular-nums" style={{ color: i ? "var(--own)" : "var(--text)" }}>{b.value}%</span></div>
                <div className="h-[22px] rounded-full bg-line">
                  <motion.div className="h-full rounded-full" style={{ background: i ? "var(--own-fill)" : "var(--direct-fill)" }} initial={{ width: 0 }} animate={{ width: `${b.value}%` }} transition={{ duration: 0.2, ease: EASE }} />
                </div>
              </div>
            ))}
          </div>
          <p className="mt-[28px] font-mono text-[24px] text-text">{s.patterns}</p>
          <div className="mt-[8px]"><Tag>{s.patternsTag}</Tag></div>
        </div>
        <div>
          <p className="act-ink font-mono text-[18px] font-semibold tracking-[0.16em] uppercase">{s.orderLabel}</p>
          <ol className="mt-[16px] flex flex-col gap-[14px]">
            {s.order.map((l, i) => (
              <Reveal key={l} on={step >= 1} delay={i * 0.06}>
                <li className="flex items-center gap-[24px] rounded-[18px] border border-l-[6px] border-line bg-surface px-[28px] py-[20px]" style={{ borderLeftColor: "var(--act)" }}>
                  <span className="act-ink w-[40px] shrink-0 font-display text-[48px] leading-none font-bold">{i + 1}</span>
                  <span className="text-[28px] leading-[1.25] text-text">{l}</span>
                </li>
              </Reveal>
            ))}
          </ol>
          <Reveal on={step >= 1} delay={0.18}>
            <p className="mt-[16px] text-[22px] leading-[1.35] text-muted">{s.orderCaption}</p>
          </Reveal>
        </div>
      </div>
      <Reveal on={step >= 2} className="mt-[40px] flex flex-col gap-[8px]">
        <p className="text-[22px] text-muted">{s.dora}</p>
        <p className="text-[22px] text-muted">{s.gregg}</p>
      </Reveal>
      <Reveal on={step >= 3} className="mt-auto">
        <p className={`${H} keyline text-[60px]`}>{s.last}</p>
      </Reveal>
    </div>
  );
}

/* ---------- S18 · If AI can build it, what are we assessing? ---------- */
export function S18({ step }: ScreenProps) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="relative flex h-full w-full flex-col p-[96px]">
      <SrcTag items={[step >= 3 && "Anthropic, 21 Jan 2026", step >= 3 && "Digital Education Council, Jan 2025"]} />
      <p className={`${H} text-[52px]`}>{asm.title}</p>
      <div className="relative mt-[28px] grid grid-cols-[560px_1fr] gap-[32px]">
        <div className="relative rounded-[20px] border border-line bg-surface p-[28px] opacity-70">
          <Eyebrow>{asm.graded.label}</Eyebrow>
          <ul className="mt-[16px] space-y-[8px] text-[24px] text-muted">
            {asm.graded.items.map((it) => <li key={it}>{it}</li>)}
          </ul>
          <span className="absolute top-[24px] right-[28px] font-display text-[80px] font-bold text-muted line-through decoration-fail decoration-[6px]">{asm.graded.grade}</span>
          <div className="pointer-events-none absolute inset-x-[20px] top-1/2 h-[4px] -rotate-[8deg] bg-fail/70" />
        </div>
        <Reveal on={step >= 1}>
          <div className="rounded-[20px] border border-own bg-surface p-[24px]">
            <Eyebrow color="var(--own)">{asm.should.label}</Eyebrow>
            <div className="mt-[8px] divide-y divide-line">
              {asm.should.rows.map((r, i) => (
                <button
                  key={r.from}
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setOpen((o) => (o === i ? null : i)); }}
                  className="grid w-full grid-cols-[1fr_1.4fr] gap-[24px] py-[10px] text-left"
                >
                  <span className="text-[21px] text-muted line-through decoration-muted/50">{r.from}</span>
                  <span className="text-[21px] text-text">→ {r.to}</span>
                  {open === i ? <span className="col-span-2 text-[19px] text-own">{r.detail}</span> : null}
                </button>
              ))}
            </div>
          </div>
        </Reveal>
        <motion.div
          className="absolute -top-[96px] right-[0px] w-[420px] rotate-[2deg] rounded-[8px] bg-validate-fill p-[22px] text-[24px] font-semibold text-background shadow-2xl"
          initial={false}
          animate={step >= 2 ? { opacity: 1, x: 0 } : { opacity: 0, x: 200 }}
          transition={{ duration: 0.2, ease: EASE }}
        >
          {asm.sticky}
        </motion.div>
      </div>
      <Reveal on={step >= 3} className="mt-[28px]">
        <p className="text-[26px] text-text">{asm.case}</p>
        <blockquote className="mt-[10px] border-l-4 border-own pl-[24px] text-[24px] text-text">
          “{asm.quote}”<span className="ml-[12px] text-[18px] text-muted">— {asm.quoteBy}</span>
        </blockquote>
        <p className="mt-[10px] font-mono text-[18px] text-muted">{asm.faculty}</p>
      </Reveal>
      <Reveal on={step >= 4} className="mt-auto">
        <p className={`${H} keyline text-[44px] leading-[1.15]`}>{asm.headline}</p>
      </Reveal>
    </div>
  );
}
