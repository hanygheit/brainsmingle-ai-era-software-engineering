import { motion, useReducedMotion } from "framer-motion";
import { usePrintMode } from "@/deck/print-mode";
import { useEffect, useRef, useState } from "react";
import { ArcMotif, EASE, Eyebrow, QuoteCard, QuoteGlyph } from "@/components/kit";
import type { ScreenProps } from "@/components/deck/ScreenRenderer";
import { BLUEPRINT_PATH } from "@/config";
import c from "@/content/act3.json";
import cm from "@/content/careerMatrix.json";
import { Reveal, SrcTag, Tag } from "./shared";

const H = "font-display font-bold tracking-[-0.03em] text-text";
const FILL: Record<string, string> = { direct: "var(--direct-fill)", delegate: "var(--delegate-fill)", validate: "var(--validate-fill)", own: "var(--own-fill)", neutral: "var(--text)" };
const COL: Record<string, string> = {
  direct: "var(--direct)",
  delegate: "var(--delegate)",
  validate: "var(--validate)",
  own: "var(--own)",
  neutral: "var(--text)",
  grey: "var(--line)",
};

/** Local T-key toggle that resets whenever the step changes. */
function useToggleT(step: number) {
  const [on, setOn] = useState(false);
  useEffect(() => setOn(false), [step]);
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key === "t" || e.key === "T") setOn((v) => !v);
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, []);
  return on;
}

/* ---------- S19–S21 · The entry door is narrowing (4.5% / Stanford / Garman) ---------- */
export function S19({ step }: ScreenProps) {
  const s = c.s12;
  return (
    <div className="relative flex h-full w-full flex-col p-[96px]">
      <SrcTag items={[s.statSrc]} />
      <p className={`${H} text-[72px]`}>{s.headline}</p>
      <div className="flex flex-1 items-center gap-[96px]">
        <Reveal on={step >= 1}>
          <div className="grid grid-cols-10 gap-[8px]">
            {Array.from({ length: 100 }, (_, i) => (
              <div key={i} className="relative h-[40px] w-[40px] overflow-hidden rounded-[6px] bg-line">
                {i < 5 ? <div className="absolute inset-y-0 left-0 bg-own-fill" style={{ width: i === 4 ? "50%" : "100%" }} /> : null}
              </div>
            ))}
          </div>
        </Reveal>
        <Reveal on={step >= 1} delay={0.06} className="flex-1">
          <p className="font-display text-[56px] leading-[1.15] font-bold text-text">{s.stat}</p>
          <div className="mt-[16px]"><Tag>{s.statSrc}</Tag></div>
        </Reveal>
      </div>
    </div>
  );
}
export function S20({ step }: ScreenProps) {
  const s = c.s12;
  return (
    <div className="relative flex h-full w-full flex-col p-[96px]">
      <SrcTag items={[s.stanfordSrc]} />
      <p className={`${H} text-[72px]`}>{s.headline}</p>
      <div className="flex flex-1 items-center">
        <Reveal on={step >= 1}>
          <p className="max-w-[1500px] font-display text-[72px] leading-[1.1] font-bold tracking-[-0.02em] text-validate">{s.stanford}</p>
          <div className="mt-[20px]"><Tag>{s.stanfordSrc}</Tag></div>
        </Reveal>
      </div>
    </div>
  );
}
export function S21({ step }: ScreenProps) {
  const s = c.s12;
  return (
    <div className="relative flex h-full w-full items-center justify-center p-[96px]">
      <SrcTag items={["The Register, Aug 2025"]} />
      <Reveal on={step >= 1}>
        <QuoteCard quote={s.quote} speaker={s.speaker} role={s.role} source={s.source} date={s.date} />
      </Reveal>
    </div>
  );
}

/* ---------- S22 ---------- */
export function S22({ step }: ScreenProps) {
  const s = c.s13;
  return (
    <div className="relative flex h-full w-full flex-col p-[96px]">
      <SrcTag items={[step >= 8 && "BairesDev Q2 2026"]} />
      <p className={`${H} text-[64px]`}>{s.headline}</p>
      <div className="mt-[36px] flex flex-col gap-[12px]">
        {s.rows.map(([k, col, txt], i) => (
          <Reveal key={k} on={step >= i + 1} y={10}>
            <div className="flex items-center gap-[32px] rounded-[14px] border-l-[8px] bg-surface px-[28px] py-[16px]" style={{ borderColor: COL[col!] }}>
              <span className="w-[300px] font-display text-[30px] font-bold" style={{ color: col === "grey" ? "var(--muted)" : "var(--text)" }}>{k}</span>
              <span className="text-[26px]" style={{ color: col === "grey" ? "var(--muted)" : "var(--text)" }}>{txt}</span>
            </div>
          </Reveal>
        ))}
      </div>
      <Reveal on={step >= 8} className="mt-auto">
        <Tag>{s.tag}</Tag>
        <p className={`${H} mt-[16px] text-[56px]`}>{s.last}</p>
      </Reveal>
    </div>
  );
}

/* ---------- S23 ---------- */
export function S23({ step }: ScreenProps) {
  const s = c.s14;
  const grown = step >= 1;
  const outer = grown ? 330 : 110;
  const inner = grown ? 115 : 100;
  return (
    <div className="relative h-full w-full overflow-hidden p-[96px]">
      <div className="absolute top-[96px] right-[96px] font-mono text-[28px] text-muted">{grown ? "2026" : "2022"}</div>
      <div className="absolute top-[440px] left-[640px]">
        {/* SVG circles: large rounded divs print with a flattened bottom in Chromium's PDF output */}
        <svg className="absolute overflow-visible" width={1} height={1} aria-hidden>
          <motion.circle cx={0} cy={0} strokeWidth={3} initial={false} animate={{ r: outer - 1.5 }} transition={{ duration: 0.6, ease: EASE }} style={{ stroke: "var(--direct)", fill: "color-mix(in oklab, var(--direct) 6%, transparent)" }} />
          <motion.circle cx={0} cy={0} strokeWidth={3} initial={false} animate={{ r: inner - 1.5 }} transition={{ duration: 0.6, ease: EASE }} style={{ stroke: "var(--own)", fill: "color-mix(in oklab, var(--own) 18%, var(--bg))" }} />
        </svg>
        <p className="absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-center font-display text-[26px] font-bold text-own">{s.judgment}<span className="block text-[16px] font-normal text-muted">{s.judgmentSub}</span></p>
        <motion.p className="absolute -translate-x-1/2 whitespace-nowrap text-center font-display text-[26px] font-bold text-direct" initial={false} animate={{ y: -outer - 70 }} transition={{ duration: 0.6, ease: EASE }}>
          {s.reach}<span className="block text-[16px] font-normal text-muted">{s.reachSub}</span>
        </motion.p>
        <Reveal on={grown} delay={0.18} className="absolute -translate-x-1/2" >
          <p className="-translate-y-[220px] whitespace-nowrap font-mono text-[20px] text-muted">{s.zone}</p>
        </Reveal>
        {s.examples.map((ex, i) => {
          const a = (-50 + i * 25) * (Math.PI / 180);
          return (
            <Reveal key={ex} on={grown} delay={0.06 + i * 0.06} className="absolute">
              <span className="block whitespace-nowrap rounded-full border border-direct bg-surface px-[16px] py-[6px] text-[20px] text-text" style={{ transform: `translate(${Math.cos(a) * 350}px, ${Math.sin(a) * 350 - 18}px)` }}>{ex}</span>
            </Reveal>
          );
        })}
      </div>
      <Reveal on={step >= 2} className="absolute right-[96px] bottom-[96px] left-[96px]">
        <p className={`${H} text-[56px]`}>{s.headline}</p>
        <p className="mt-[12px] text-[30px] text-muted">{s.sub}</p>
      </Reveal>
    </div>
  );
}

/** Types `text` in ~0.5 s once `active` turns on. */
function TypeIn({ text, active }: { text: string; active: boolean }) {
  const reduce = useReducedMotion();
  // Already active on mount = opened in its final state (back / print): show full text.
  const activeAtMount = useRef(active);
  const [n, setN] = useState(text.length);
  useEffect(() => {
    if (!active || reduce || activeAtMount.current) return setN(text.length);
    setN(0);
    const id = setInterval(() => setN((v) => (v >= text.length ? (clearInterval(id), v) : v + Math.max(1, Math.ceil(text.length / 25)))), 20);
    return () => clearInterval(id);
  }, [text, active, reduce]);
  return <>{text.slice(0, n)}</>;
}
/* ---------- S25–S27 · The job changed (effort bar / Amodei / staying narrow) ---------- */
export function S25({ step }: ScreenProps) {
  const s = c.s15;
  const flipped = useToggleT(step);
  const y2026 = (step >= 1) !== flipped;
  return (
    <div className="relative flex h-full w-full flex-col p-[96px]">
      <p className={`${H} text-[72px]`}>{s.headline}</p>
      <div className="flex flex-1 flex-col justify-center">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[36px] text-muted">{y2026 ? "2026" : "2022"}</span>
          <Tag>{s.tag}</Tag>
        </div>
        <div className="mt-[20px] flex h-[180px] w-full overflow-hidden rounded-[20px]">
          {s.segments.map(([name, col, a, b]) => (
            <motion.div key={name as string} className="flex items-center justify-center overflow-hidden text-[30px] font-semibold whitespace-nowrap" initial={false} animate={{ width: `${y2026 ? b : a}%` }} transition={{ duration: 0.6, ease: EASE }} style={{ background: FILL[col as string], color: "#14161C" }}>
              {name as string} {(y2026 ? b : a) as number}%
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
export function S26({ step }: ScreenProps) {
  const s = c.s15;
  return (
    <div className="relative flex h-full w-full flex-col justify-center p-[96px]">
      <SrcTag items={["Dario Amodei, Council on Foreign Relations, 10 Mar 2025"]} />
      <QuoteGlyph className="absolute top-[150px] left-[70px]" size={420} />
      <div className="relative max-w-[1600px]">
        <Reveal on={step >= 1}><p className={`${H} text-[64px]`}>{s.q1}</p></Reveal>
        <Reveal on={step >= 2} className="mt-[40px]">
          <p className="min-h-[178px] text-[44px] leading-[1.35] text-text"><TypeIn text={s.q2} active={step === 2} /></p>
          <p className="mt-[20px] text-[28px] text-muted">— {s.by}</p>
        </Reveal>
      </div>
    </div>
  );
}
export function S27({ step }: ScreenProps) {
  const s = c.s15;
  return (
    <div className="relative flex h-full w-full flex-col justify-center p-[96px]">
      <Reveal on={step >= 1}>
        <div className="mb-[48px] h-[6px] w-[160px] rounded-full bg-[var(--act)]" />
        <p className={`${H} max-w-[1600px] text-[80px] leading-[1.12] !text-own`}>{s.last}</p>
      </Reveal>
    </div>
  );
}

/* ---------- S28 ---------- */
export function S28({ step }: ScreenProps) {
  const s = c.s16;
  return (
    <div className="relative flex h-full w-full flex-col p-[96px]">
      <SrcTag items={["Karpathy, Feb 2025", "Karpathy, Feb 2026"]} />
      <div className="flex items-start gap-[32px] border-b border-line pb-[24px]">
        <div><p className="font-mono text-[28px] text-muted line-through">{s.from}</p><p className="text-[18px] text-muted">{s.fromQ}</p></div>
        <span className="text-[36px] text-muted">→</span>
        <div><p className="font-mono text-[28px] text-own">{s.to}</p><p className="text-[18px] text-muted">{s.toQ}</p></div>
      </div>
      <div className="mt-[36px] flex flex-1 gap-[56px]">
        <div className="flex flex-1 flex-col">
          <div className="flex flex-col-reverse gap-[12px]">
            {s.levels.map(([name, ex], i) => (
              <Reveal key={name} on={step >= i + 1} y={10}>
                <div className="rounded-[14px] border border-line bg-surface px-[24px] py-[14px]" style={{ marginLeft: (4 - i) * 0 + i * 40 }}>
                  <p className="font-display text-[28px] font-bold text-text">{name}</p>
                  <p className="text-[20px] text-muted">{ex}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <div className="mt-[24px] flex gap-[8px]">
            {s.flow.map(([n, col], i) => (
              <span key={n} className="flex items-center gap-[8px] font-mono text-[20px]" style={{ color: COL[col!] }}>
                {n}{i < s.flow.length - 1 ? <span className="text-muted">→</span> : null}
              </span>
            ))}
          </div>
        </div>
        <div className="w-[720px]">
          <div className="theme-stage overflow-hidden rounded-[16px] border border-line bg-surface">
            <div className="border-b border-line px-[24px] py-[12px] t-tag text-muted">{s.file}</div>
            <div className="space-y-[6px] p-[24px] font-mono text-[20px] leading-[1.5]">
              {s.code.map((l, i) => (
                <p key={l} className="rounded-[6px] px-[8px] transition-colors duration-300" style={{ background: i === 0 && step >= 6 ? "color-mix(in oklab, var(--validate-fill) 22%, transparent)" : "transparent", color: "var(--text)" }}>
                  {i === 0 && step >= 6 ? <>{l.split("audience")[0]}<span className="text-validate font-bold">audience</span>{l.split("audience")[1]}</> : l}
                </p>
              ))}
            </div>
          </div>
          <a href={s.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="mt-[16px] block font-mono text-[20px] text-own underline underline-offset-4">{s.link}</a>
        </div>
      </div>
      <Reveal on={step >= 7} className="mt-[24px]">
        <p className={`${H} text-[56px]`}>{s.last}</p>
      </Reveal>
    </div>
  );
}

/* ---------- S29 ---------- */
export function S29({ choice }: ScreenProps) {
  const print = usePrintMode();
  const idx = choice && choice >= 1 && choice <= 6 ? choice - 1 : 2;
  const [sel, setSel] = useState(idx);
  useEffect(() => setSel(idx), [idx]);
  const prevSel = useRef(sel);
  const prev = prevSel.current;
  useEffect(() => { prevSel.current = sel; }, [sel]);
  const panel = cm.panels[sel]!;
  return (
    <div className="relative flex h-full w-full flex-col p-[96px]">
      <div className="flex gap-[12px]">
        {cm.tabs.map((t, i) => (
          <button key={t} type="button" onClick={(e) => { e.stopPropagation(); setSel(i); }} className="rounded-full border px-[22px] py-[10px] text-[22px] transition-colors" style={{ borderColor: i === sel ? "var(--own)" : "var(--line)", color: i === sel ? "var(--text)" : "var(--muted)", background: i === sel ? "color-mix(in oklab, var(--own) 14%, transparent)" : "transparent" }}>
            <span className="font-mono text-muted">{i + 1}</span> {t}
          </button>
        ))}
        <a href={BLUEPRINT_PATH} onClick={(e) => e.stopPropagation()} className="ml-auto self-center font-mono text-[20px] text-own underline underline-offset-4">{cm.link} {BLUEPRINT_PATH}</a>
      </div>
      <div className="mt-[40px] flex flex-1 gap-[64px]">
        <div className="relative flex-1">
          <div className="pointer-events-none absolute -bottom-[200px] -left-[200px] opacity-50">
            <motion.div initial={false} animate={{ scale: 0.35 + sel * 0.13 }} transition={{ duration: 0.6, ease: EASE }}><ArcMotif count={6} radius={500} /></motion.div>
          </div>
          <p className="relative font-mono text-[20px] text-muted">radius · <span className="text-own">{cm.radius[sel]}</span></p>
          {print ? (
            <table className="relative mt-[20px] w-full border-separate border-spacing-[6px] text-[20px]">
              <thead><tr><th />{cm.stages.map((st, i) => <th key={st} className={`font-mono text-[16px] font-normal ${i === sel ? "text-text" : "text-muted"}`}>{st}</th>)}</tr></thead>
              <tbody>
                {cm.groups.map(([label, vals]) => (
                  <tr key={label as string}>
                    <td className="pr-[12px] text-text">{label as string}</td>
                    {(vals as number[]).map((v, i) => (
                      <td key={i} className="h-[44px] rounded-[8px] text-center font-mono font-bold" style={{ background: `color-mix(in oklab, var(--own-fill) ${v * 18}%, var(--surface))`, color: "#14161C", outline: i === sel ? "2px solid var(--own)" : undefined }}>{v}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
          <div className="relative mt-[20px] space-y-[16px]">
            {cm.groups.map(([label, vals]) => {
              const v = (vals as number[])[sel]!;
              const dropped = sel !== prev && v < ((vals as number[])[prev] ?? 0) && sel > prev;
              return (
                <div key={label as string}>
                  <div className="mb-[6px] flex justify-between text-[22px]"><span className="text-text">{label as string}</span><span className="font-mono text-muted">{v}</span></div>
                  <div className="h-[14px] rounded-full bg-line">
                    <motion.div key={dropped ? `d-${sel}` : "s"} className="h-full rounded-full" initial={false} animate={{ width: `${v * 20}%`, backgroundColor: dropped ? ["var(--validate-fill)", "var(--validate)", "var(--own-fill)"] : "var(--own-fill)" }} transition={{ duration: 0.6, ease: EASE }} />
                  </div>
                </div>
              );
            })}
          </div>
          )}
          <div className="relative mt-[16px]"><Tag>{cm.tag}</Tag></div>
        </div>
        <div className="w-[640px] rounded-[20px] border border-line bg-surface p-[36px]">
          <Eyebrow>Your next 90 days</Eyebrow>
          <ul className="mt-[14px] space-y-[10px] text-[24px] text-text">{panel.next.map((n) => <li key={n}>· {n}</li>)}</ul>
          <div className="mt-[32px]"><Eyebrow color="var(--validate)">Never delegate</Eyebrow></div>
          <p className="mt-[10px] text-[24px] text-text">{panel.never}</p>
          <div className="mt-[32px]"><Eyebrow color="var(--own)">Ready for next level when…</Eyebrow></div>
          <p className="mt-[10px] text-[24px] text-text">{panel.ready}</p>
        </div>
      </div>
      <p className="mt-[24px] font-display text-[34px] font-bold text-text">{cm.footer}</p>
    </div>
  );
}
