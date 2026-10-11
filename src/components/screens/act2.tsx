import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { CodeDiff, EASE, Eyebrow, QRTile } from "@/components/kit";
import type { ScreenProps } from "@/components/deck/ScreenRenderer";
import { voteUrl } from "@/config";
import iv from "@/content/interview.json";
import a2 from "@/content/act2.json";
import asm from "@/content/assessment.json";
import { usePollCounts } from "@/lib/poll";
import { Chip, Reveal, SrcTag, Tag } from "./shared";

const H = "font-display font-bold tracking-[-0.03em] text-text";

/* ---------- S10 · Two graduates ---------- */
export function S10({ step, choice }: ScreenProps) {
  const s = iv.s7;
  const { counts, total } = usePollCounts("s7-interview");
  const url = voteUrl("s7-interview");
  const picked = choice && choice <= 3 ? choice - 1 : null;
  if (picked === null) {
    return (
      <div className="relative h-full w-full overflow-hidden p-[96px]">
        <div className="grid grid-cols-2 gap-[48px]">
          {s.candidates.map((cnd) => (
            <div key={cnd} className="rounded-[20px] border border-line bg-surface p-[36px]">
              <p className={`${H} text-[48px]`}>{cnd}</p>
              <p className="mt-[14px] font-mono text-[24px] text-muted">{s.project}</p>
            </div>
          ))}
        </div>
        <div className="mt-[14px]"><Tag>{s.tag}</Tag></div>
        <Reveal on={step >= 1} className="mt-[48px] flex gap-[56px]">
          <div className="flex-1">
            <p className={`${H} text-[52px]`}>{s.prompt}</p>
            <div className="mt-[28px] flex flex-col gap-[16px]">
              {iv.poll.options.map((o, i) => {
                const pct = total ? Math.round((counts[i]! / total) * 100) : 0;
                return (
                  <div key={o} className="relative overflow-hidden rounded-[14px] border border-line bg-surface px-[28px] py-[20px]">
                    <motion.div className="absolute inset-y-0 left-0 bg-own-fill/15" animate={{ width: `${pct}%` }} transition={{ duration: 0.2, ease: EASE }} />
                    <p className="relative flex justify-between gap-[24px] text-[30px] text-text">
                      <span><span className="font-display font-bold text-muted">{i + 1}</span> · {o}</span>
                      <span className="font-mono text-[22px] text-muted tabular-nums">{counts[i]} · {pct}%</span>
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="flex flex-col items-center gap-[10px] self-end">
            <QRTile url={url} size={200} />
            <p className="max-w-[260px] text-center font-mono text-[16px] break-all text-muted">{url.replace(/^https?:\/\//, "")}</p>
          </div>
        </Reveal>
      </div>
    );
  }
  const ans = s.answers[picked]!;
  return (
    <div className="relative h-full w-full overflow-hidden p-[96px]">
      <SrcTag items={["Veracode, Jul 2025", "GitHub, Apr 2026"]} />
      <p className="font-mono text-[22px] text-muted">Q{picked + 1} · {iv.poll.options[picked]}</p>
      <div className="mt-[20px] grid grid-cols-2 gap-[40px]">
        <Reveal on className="rounded-[20px] border border-own bg-surface p-[28px]">
          <p className="font-display text-[30px] font-bold text-own">Graduate A</p>
          <p className="mt-[10px] text-[23px] leading-[1.4] text-text">{ans.a}</p>
        </Reveal>
        <Reveal on delay={0.06} className="rounded-[20px] border border-line bg-surface p-[28px]">
          <p className="font-display text-[30px] font-bold text-muted">Graduate B</p>
          <p className="mt-[10px] text-[23px] leading-[1.4] text-muted">{ans.b}</p>
        </Reveal>
      </div>
      <div className="mt-[28px] flex gap-[48px]">
        <Reveal on delay={0.12} className="origin-top-left" >
          <div style={{ transform: "scale(0.86)", transformOrigin: "top left", width: 946 }}>
            <CodeDiff code={s.code} highlightLines={[8]} title="Program.cs" />
          </div>
        </Reveal>
        <div className="flex flex-1 flex-col gap-[20px]">
          {s.lines.map((l, i) => (
            <Reveal key={l} on delay={0.18 + i * 0.06}>
              <p className={`${H} text-[36px] leading-[1.15] ${i === 2 ? "!text-own" : ""}`}>{l}</p>
            </Reveal>
          ))}
          <Reveal on delay={0.42} className="mt-[8px] flex flex-col gap-[8px]">
            {s.tags.map((t) => <Tag key={t}>{t}</Tag>)}
          </Reveal>
        </div>
      </div>
    </div>
  );
}

/* ---------- S12 · AI-native is not fundamentals-free ---------- */
export function S12({ step }: ScreenProps) {
  const s = a2.s8;
  return (
    <div className="relative flex h-full w-full flex-col p-[96px]">
      <SrcTag items={[step >= 5 && "Thomas Dohmke, Aug 2025"]} />
      <p className={`${H} text-[72px]`}>{s.headline}</p>
      <div className="mt-[36px] grid grid-cols-4 gap-[28px]">
        {s.columns.map((c, i) => {
          const prove = c.key === "PROVE";
          return (
            <Reveal key={c.key} on={step >= i + 1}>
              <div className="h-full rounded-[20px] border bg-surface p-[32px]" style={{ borderColor: prove ? "var(--own)" : "var(--line)" }}>
                <p className="font-display text-[40px] font-bold" style={{ color: prove ? "var(--own)" : "var(--text)" }}>{c.key}</p>
                <p className="text-[20px] text-muted">— {c.sub}</p>
                <ul className="mt-[20px] space-y-[8px] text-[22px] text-text">
                  {c.items.map((it) => <li key={it}>{it}</li>)}
                </ul>
                {"chip" in c && c.chip ? <p className="mt-[20px] rounded-[12px] border border-validate px-[14px] py-[10px] text-[18px] text-validate">{c.chip}</p> : null}
              </div>
            </Reveal>
          );
        })}
      </div>
      <Reveal on={step >= 5} className="mt-auto pt-[24px]">
        <blockquote className="max-w-[1500px] border-l-4 border-own pl-[32px] text-[32px] leading-[1.3] text-text">
          “{s.quote}”<span className="mt-[10px] block text-[22px] text-muted">— {s.quoteBy}</span>
        </blockquote>
      </Reveal>
    </div>
  );
}

/* ---------- S13 · Concepts outlive tools ---------- */
export function S13({ step }: ScreenProps) {
  const s = a2.s9;
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setI((v) => (v + 1) % s.rows.length), 1500);
    return () => clearInterval(id);
  }, [reduce, s.rows.length]);
  return (
    <div className="relative flex h-full w-full flex-col p-[96px]">
      <p className={`${H} text-[72px]`}>{s.headline}</p>
      <div className="mt-[56px] grid grid-cols-2 gap-[64px] text-[22px]">
        <Eyebrow>{s.colTools}</Eyebrow>
        <Eyebrow>{s.colConcepts}</Eyebrow>
      </div>
      <Reveal on={step >= 1} className="mt-[20px] grid grid-cols-2 gap-[64px]">
        <div className="relative h-[120px] rounded-[20px] border border-line bg-surface">
          <AnimatePresence mode="wait">
            <motion.p key={i} className="absolute inset-0 flex items-center px-[40px] font-mono text-[40px] text-text" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
              {s.rows[i]![0]}
            </motion.p>
          </AnimatePresence>
        </div>
        <div className="flex flex-col gap-[14px]">
          {s.rows.map(([, concept], k) => (
            <p key={concept} className={`${H} text-[36px] transition-colors duration-300`} style={{ color: k === i ? "var(--own)" : "var(--text)" }}>{concept}</p>
          ))}
        </div>
      </Reveal>
      <Reveal on={step >= 2} className="mt-auto">
        <p className={`${H} text-[60px]`}>{s.last}</p>
      </Reveal>
    </div>
  );
}

/* ---------- S14 · Learn with AI — and without it ---------- */
export function S14({ step }: ScreenProps) {
  const s = a2.s10;
  return (
    <div className="relative flex h-full w-full flex-col p-[96px]">
      <SrcTag items={["Anthropic, Jan 2026", step >= 2 && "DORA, Mar 2026", step >= 2 && "Stanford Daily, Mar 2026"]} />
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
        <Reveal on={step >= 1}>
          <div className="grid grid-cols-2 gap-[20px]">
            {s.loop.map((l, i) => (
              <div key={l} className="rounded-[18px] border border-line bg-surface p-[28px]">
                <p className="font-mono text-[22px] text-own">{i + 1} {i === 3 ? "↺" : "→"}</p>
                <p className="mt-[8px] text-[28px] text-text">{l}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
      <Reveal on={step >= 2} className="mt-[40px] flex flex-col gap-[8px]">
        <p className="text-[22px] text-muted">{s.dora}</p>
        <p className="text-[22px] text-muted">{s.gregg}</p>
      </Reveal>
      <Reveal on={step >= 3} className="mt-auto">
        <p className={`${H} text-[60px]`}>{s.last}</p>
      </Reveal>
    </div>
  );
}

/* ---------- S15 · If AI can build it, what are we assessing? ---------- */
export function S15({ step }: ScreenProps) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="relative flex h-full w-full flex-col p-[96px]">
      <SrcTag items={[step >= 3 && "Anthropic, 21 Jan 2026"]} />
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
      </Reveal>
      <Reveal on={step >= 4} className="mt-auto">
        <p className={`${H} text-[44px] leading-[1.15]`}>{asm.headline}</p>
      </Reveal>
    </div>
  );
}
