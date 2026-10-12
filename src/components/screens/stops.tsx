import { Fragment, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { BookOpen, Building2, GraduationCap, Handshake, Layers, School, ShieldCheck, Terminal, Workflow, Wrench, Zap, type LucideIcon } from "lucide-react";
import { EASE, Eyebrow, QuoteGlyph } from "@/components/kit";
import type { ScreenProps } from "@/components/deck/ScreenRenderer";
import { stopColors } from "@/deck/theme";
import agenda from "@/content/agenda.json";
import st from "@/content/stops.json";
import { Reveal, SrcTag, Tag } from "./shared";

const H = "font-display font-bold tracking-[-0.03em] text-text";
export const ICONS: Record<string, LucideIcon> = {
  terminal: Terminal,
  workflow: Workflow,
  book: BookOpen,
  school: School,
  cap: GraduationCap,
  layers: Layers,
  building: Building2,
  handshake: Handshake,
};

/* ---------- S3 · Agenda: seven stops (navy) ---------- */
export function S3({ step }: ScreenProps) {
  const reduce = useReducedMotion();
  const inks = agenda.stops.map((_, i) => stopColors(i + 1).ink);
  return (
    <div className="relative h-full w-full overflow-hidden">
      <div className="absolute top-[96px] right-[96px] left-[96px]">
        <Reveal on={step >= 1} y={10}>
          <Eyebrow color="var(--own)">{agenda.eyebrow}</Eyebrow>
        </Reveal>
        <Reveal on={step >= 1} delay={0.06} y={12}>
          <h2 className="mt-[20px] font-display text-[96px] leading-[1] font-bold tracking-[-0.04em] text-text">{agenda.headline}</h2>
          <p className="mt-[20px] text-[36px] text-muted">{agenda.question}</p>
        </Reveal>
      </div>

      {/* The journey: one line through seven stops, drawn left to right */}
      <div className="absolute top-[468px] right-[96px] left-[96px]">
        <div className="absolute top-[44px] right-[calc(100%/14)] left-[calc(100%/14)] h-[4px] rounded-full bg-line" aria-hidden />
        <motion.div
          className="absolute top-[44px] right-[calc(100%/14)] left-[calc(100%/14)] h-[4px] origin-left rounded-full"
          style={{ background: `linear-gradient(90deg, ${inks.join(", ")})` }}
          initial={false}
          animate={{ scaleX: step >= 1 ? 1 : 0 }}
          transition={{ duration: reduce ? 0.15 : 0.6, ease: EASE }}
          aria-hidden
        />
        <ol className="relative grid grid-cols-7">
          {agenda.stops.map((s, i) => {
            const Icon = ICONS[s.icon] ?? Terminal;
            const { fill, ink } = stopColors(i + 1);
            return (
              <li key={s.n}>
                <Reveal on={step >= 2} delay={i * 0.06} y={10} className="flex flex-col items-center px-[10px] text-center">
                  {/* SVG ring: big CSS circles print with a flattened bottom in Chromium's PDF output */}
                  <span className="relative block h-[92px] w-[92px]">
                    <svg width={92} height={92} viewBox="0 0 92 92" className="absolute inset-0" aria-hidden>
                      <circle cx={46} cy={46} r={43} style={{ fill: `color-mix(in oklab, ${fill} 18%, #0F1B33)` }} stroke={ink} strokeWidth={3} />
                    </svg>
                    <Icon size={40} strokeWidth={1.75} color={ink} className="absolute top-[26px] left-[26px]" aria-hidden />
                  </span>
                  <span className="mt-[22px] font-mono text-[18px] font-semibold tracking-[0.14em]" style={{ color: ink }}>
                    {s.n}
                  </span>
                  <span className="mt-[6px] font-display text-[30px] leading-[1.1] font-bold text-text">{s.name}</span>
                  <span className="mt-[12px] max-w-[230px] text-[20px] leading-[1.35] text-muted">{s.promise}</span>
                </Reveal>
              </li>
            );
          })}
        </ol>
      </div>

      <Reveal on={step >= 3} y={8} className="absolute right-[96px] bottom-[88px] left-[96px]">
        <div className="flex items-center justify-between border-t border-line pt-[28px]">
          <p className="flex items-center gap-[20px] text-[30px] text-text">
            <span className="rounded-full border border-own px-[16px] py-[6px] font-mono text-[16px] font-semibold tracking-[0.16em] text-own">ACTION</span>
            {agenda.footer}
          </p>
          <p className="font-mono text-[20px] text-muted">
            → {agenda.closing} · <span className="text-own">{agenda.closingSub}</span>
          </p>
        </div>
      </Reveal>
    </div>
  );
}

/* ---------- shared pieces for the stop slides (paper) ---------- */
function StopEyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="act-ink flex items-center gap-[12px] font-mono text-[18px] font-semibold tracking-[0.16em] uppercase">
      <span className="h-[10px] w-[10px] rounded-full" style={{ background: "var(--act)" }} aria-hidden />
      {children}
    </p>
  );
}

/** Quote text with one verbatim phrase underlined in the act colour. */
function Marked({ text, mark }: { text: string; mark?: string | undefined }) {
  const at = mark ? text.indexOf(mark) : -1;
  if (!mark || at < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, at)}
      <span className="underline decoration-[var(--act)] decoration-[3px] underline-offset-[7px]">{mark}</span>
      {text.slice(at + mark.length)}
    </>
  );
}

type Quote = { quote: string; mark?: string; speaker: string; role: string; source: string };
function QuoteCol({ q, size = 30, srcPx = 16 }: { q: Quote; size?: number; srcPx?: number }) {
  return (
    <figure className="relative flex h-full flex-col overflow-hidden rounded-[20px] border border-line bg-surface p-[40px]">
      <QuoteGlyph className="absolute -top-[34px] right-[24px]" size={200} />
      <blockquote className="relative leading-[1.35] text-text" style={{ fontSize: size }}>
        “<Marked text={q.quote} mark={q.mark} />”
      </blockquote>
      <figcaption className="mt-auto pt-[28px]">
        <p className="text-[24px] font-semibold text-text">{q.speaker}</p>
        <p className="text-[20px] text-muted">{q.role}</p>
        <p className="mt-[6px] font-mono text-muted" style={{ fontSize: srcPx }}>{q.source}</p>
      </figcaption>
    </figure>
  );
}

type Col = { label: string; sub?: string; items: string[]; strip?: string };
/**
 * The "Your move" slide that closes every stop: columns (or numbered actions),
 * one evidence line, optional example tools, and the ACTION band (with an optional bridge line under it).
 * Phases: 1 columns · 2 evidence · 3 tools · 4 action. `large` lifts the small labels to 18 px.
 */
function StopPlan({
  step,
  eyebrow,
  headline,
  columns,
  actions,
  evidence,
  tools,
  toolsLabel = "Example tools — not endorsements",
  note,
  action,
  bridge,
  large = false,
  src,
}: {
  step: number;
  eyebrow: string;
  headline: string;
  columns?: Col[];
  actions?: string[][];
  evidence?: string;
  tools?: string[][];
  toolsLabel?: string;
  note?: string;
  action: string;
  bridge?: string;
  large?: boolean;
  src: (string | false)[];
}) {
  const small = large ? "text-[18px]" : "text-[15px]";
  return (
    <div className="relative flex h-full w-full flex-col p-[96px]">
      <SrcTag items={src} />
      <StopEyebrow>{eyebrow}</StopEyebrow>
      <p className={`${H} mt-[14px] text-[64px] leading-[1.05]`}>{headline}</p>

      <div className="flex flex-1 flex-col justify-center py-[28px]">
      {columns ? (
        <div className="grid gap-[24px]" style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}>
          {columns.map((c, i) => (
            <Reveal key={c.label} on={step >= 1} delay={i * 0.06} className="h-full">
              <div className="flex h-full flex-col rounded-[18px] border border-t-[6px] border-line bg-surface p-[28px]" style={{ borderTopColor: "var(--act)" }}>
                <p className="act-ink font-display text-[32px] leading-[1.1] font-bold">{c.label}</p>
                {c.sub ? <p className={`mt-[6px] font-mono ${small} tracking-[0.14em] text-muted uppercase`}>{c.sub}</p> : null}
                <ul className="mt-[18px] space-y-[12px]">
                  {c.items.map((it) => (
                    <li key={it} className="flex gap-[14px] text-[23px] leading-[1.3] text-text">
                      <span className="mt-[11px] h-[7px] w-[7px] shrink-0 rounded-full" style={{ background: "var(--act)" }} aria-hidden />
                      <span>{it}</span>
                    </li>
                  ))}
                </ul>
                {c.strip ? <p className="mt-auto border-t border-line pt-[14px] text-[20px] leading-[1.35] text-muted">{c.strip}</p> : null}
              </div>
            </Reveal>
          ))}
        </div>
      ) : null}

      {actions ? (
        <div className="grid grid-cols-4 gap-[24px]">
          {actions.map(([t, d], i) => (
            <Reveal key={t} on={step >= 1} delay={i * 0.06} className="h-full">
              <div className="h-full rounded-[18px] border border-t-[6px] border-line bg-surface p-[36px]" style={{ borderTopColor: "var(--act)" }}>
                <p className="act-ink font-display text-[88px] leading-[1] font-bold">{i + 1}</p>
                <p className="mt-[24px] font-display text-[38px] leading-[1.12] font-bold text-text">{t}</p>
                <p className="mt-[16px] text-[27px] leading-[1.35] text-muted">{d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      ) : null}

      {evidence ? (
        <Reveal on={step >= 2} className="mt-[28px]">
          <p className="border-l-4 pl-[20px] text-[22px] leading-[1.4] text-muted" style={{ borderColor: "var(--act)" }}>
            {evidence}
          </p>
        </Reveal>
      ) : null}

      {tools ? (
        <Reveal on={step >= 3} className="mt-[20px]">
          <p className={`font-mono ${large ? "text-[18px]" : "text-[14px]"} tracking-[0.14em] text-muted uppercase`}>{toolsLabel}</p>
          <div className="mt-[8px] flex flex-wrap items-baseline gap-x-[36px] gap-y-[8px] text-[20px]">
            {tools.map(([k, v]) => (
              <span key={k}>
                <span className={`act-ink mr-[10px] font-mono ${small} font-semibold tracking-[0.14em] uppercase`}>{k}</span>
                <span className="text-text">{v}</span>
              </span>
            ))}
          </div>
          {note ? <p className="mt-[8px] text-[19px] text-muted">{note}</p> : null}
        </Reveal>
      ) : null}
      </div>

      <ActionBand on={step >= 4}>{action}</ActionBand>
      {bridge ? (
        <Reveal on={step >= 4} delay={0.06}>
          <p className="mt-[14px] text-[20px] text-muted">→ {bridge}</p>
        </Reveal>
      ) : null}
    </div>
  );
}

/** The ACTION band at the foot of every "Your move" slide. */
function ActionBand({ on, children }: { on: boolean; children: ReactNode }) {
  return (
    <Reveal on={on}>
      <div
        className="flex items-center gap-[28px] rounded-[18px] px-[36px] py-[22px]"
        style={{ background: "color-mix(in oklab, var(--act) 9%, var(--surface))", borderLeft: "8px solid var(--act)" }}
      >
        <span className="act-ink shrink-0 font-mono text-[18px] font-semibold tracking-[0.18em]">ACTION</span>
        <p className="font-display text-[34px] leading-[1.2] font-bold text-text">{children}</p>
      </div>
    </Reveal>
  );
}

/* ---------- S9 · Developers increasingly direct, review and validate ---------- */
export function S9({ step }: ScreenProps) {
  const s = st.leaders;
  return (
    <div className="relative flex h-full w-full flex-col p-[96px]">
      <SrcTag items={["Karpathy on X, Feb 2026", "Google Cloud Next '26, Apr 2026", "Dohmke & Kalliamvakou, Aug 2025", step >= 4 && "Stack Overflow, Oct 2026"]} />
      <StopEyebrow>{s.eyebrow}</StopEyebrow>
      <p className={`${H} mt-[14px] text-[64px] leading-[1.05]`}>{s.headline}</p>
      <div className="mt-[40px] grid flex-1 grid-cols-3 gap-[28px]">
        {s.quotes.map((q, i) => (
          <Reveal key={q.speaker} on={step >= i + 1} className="h-full">
            <QuoteCol q={q} size={36} />
          </Reveal>
        ))}
      </div>
      <Reveal on={step >= 4} className="mt-[28px]">
        <div className="flex items-baseline gap-[24px] rounded-[16px] border border-line bg-surface px-[32px] py-[20px]">
          <span className="act-ink shrink-0 font-mono text-[16px] font-semibold tracking-[0.16em] uppercase">{s.balanceLabel}</span>
          <span className="text-[26px] text-text">{s.balance}</span>
        </div>
      </Reveal>
    </div>
  );
}

/* ---------- S13 · Your move (the shift) ---------- */
export function S13({ step }: ScreenProps) {
  const s = st.shiftAction;
  return (
    <StopPlan
      step={step}
      eyebrow={s.eyebrow}
      headline={s.headline}
      actions={s.actions}
      evidence={`${s.evidence} — ${s.evidenceSrc}`}
      action={s.action}
      src={[step >= 2 && "Stack Overflow, 2025"]}
    />
  );
}

/* ---------- S21 · Students: the myth ("AI does everything — so I don't need to learn") ---------- */
export function S21({ step }: ScreenProps) {
  const s = st.studentMyth;
  const reduce = useReducedMotion();
  const bullet = (color: string) => <span className="mt-[15px] h-[9px] w-[9px] shrink-0 rounded-full" style={{ background: color }} aria-hidden />;
  return (
    <div className="relative flex h-full w-full flex-col p-[96px]">
      <SrcTag items={[step >= 2 && "Andrew Ng, The Batch, Mar 2025"]} />
      <StopEyebrow>{s.eyebrow}</StopEyebrow>
      <div className="relative mt-[14px] flex items-center gap-[40px]">
        <p className={`${H} text-[64px] leading-[1.05]`}>{s.headline}</p>
        {/* the slide-1 rubber stamp, smaller, in the fail colour */}
        <motion.p
          className="shrink-0 rounded-[12px] border-[4px] px-[22px] py-[4px] font-display text-[44px] leading-[1.1] font-bold whitespace-nowrap"
          style={{ color: "var(--fail)", borderColor: "var(--fail)", background: "rgba(255, 255, 255, 0.88)", boxShadow: "0 10px 22px -10px rgba(192, 54, 44, 0.45)", rotate: -6 }}
          initial={false}
          animate={step >= 1 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: reduce ? 1 : 1.4 }}
          transition={{ duration: reduce ? 0.15 : 0.18, ease: "easeOut" }}
          aria-hidden={step < 1}
        >
          {s.stamp}
        </motion.p>
      </div>

      <div className="mt-[44px] grid grid-cols-[1fr_1fr_1.05fr] gap-[28px]">
        <Reveal on={step >= 2} className="h-full">
          <div className="h-full rounded-[18px] border border-t-[6px] border-line bg-surface p-[32px]" style={{ borderTopColor: "var(--delegate-fill)" }}>
            <p className="font-display text-[34px] leading-[1.1] font-bold text-delegate">{s.lessLabel}</p>
            <ul className="mt-[20px] space-y-[14px]">
              {s.less.map((it) => (
                <li key={it} className="flex gap-[16px] text-[30px] leading-[1.3] text-muted">{bullet("var(--delegate-fill)")}<span>{it}</span></li>
              ))}
            </ul>
          </div>
        </Reveal>
        <Reveal on={step >= 2} delay={0.06} className="h-full">
          <div className="h-full rounded-[18px] border border-t-[6px] border-line bg-surface p-[32px]" style={{ borderTopColor: "var(--act)" }}>
            <p className="act-ink font-display text-[34px] leading-[1.1] font-bold">{s.moreLabel} <span className="text-text">{s.moreLead}</span></p>
            <ul className="mt-[20px] space-y-[10px]">
              {s.more.map((it) => (
                <li key={it} className="flex gap-[16px] text-[30px] leading-[1.3] text-text">{bullet("var(--act)")}<span>{it}</span></li>
              ))}
            </ul>
          </div>
        </Reveal>
        <Reveal on={step >= 2} delay={0.12} className="h-full">
          <QuoteCol q={s.ng} size={26} srcPx={18} />
        </Reveal>
      </div>
      <Reveal on={step >= 2} delay={0.12}>
        <p className="mt-[24px] text-[26px] leading-[1.35] text-muted">{s.still}</p>
      </Reveal>

      <Reveal on={step >= 3} className="mt-auto">
        <p className={`${H} keyline text-[44px] leading-[1.2]`}>{s.last}</p>
      </Reveal>
    </div>
  );
}

/* ---------- S23 · Your plan (students) ---------- */
export function S23({ step }: ScreenProps) {
  const s = st.studentPlan;
  return (
    <StopPlan
      step={step}
      eyebrow={s.eyebrow}
      headline={s.headline}
      columns={s.columns}
      evidence={s.evidence}
      tools={s.tools}
      action={s.action}
      bridge={s.bridge}
      large
      src={[step >= 2 && "Lee et al., CHI 2025", step >= 3 && "GitHub Docs"]}
    />
  );
}

/* ---------- S19 · Your rollout (universities & educators) ---------- */
export function S19({ step }: ScreenProps) {
  const s = st.educatorRollout;
  return (
    <StopPlan
      step={step}
      eyebrow={s.eyebrow}
      headline={s.headline}
      columns={s.columns}
      evidence={s.evidence}
      action={s.action}
      src={["University of Sydney", "AI Assessment Scale", step >= 2 && "HEPI, Mar 2026", step >= 2 && "Purdue, Aug 2026"]}
    />
  );
}

/* ---------- S28 · Yesterday's senior skills are today's junior foundation ---------- */
export function S28({ step }: ScreenProps) {
  const s = st.seniorSkills;
  return (
    <div className="relative flex h-full w-full flex-col p-[96px]">
      <SrcTag items={[step >= 2 && "BairesDev, Jun 2026"]} />
      <StopEyebrow>{s.eyebrow}</StopEyebrow>
      <p className={`${H} mt-[14px] text-[64px] leading-[1.05]`}>{s.headline}</p>
      <div className="flex flex-1 flex-col justify-center py-[24px]">
      <div className="grid grid-cols-[1fr_64px_1.25fr] items-center gap-x-[20px] gap-y-[12px]">
        <p className="font-mono text-[16px] tracking-[0.14em] text-muted uppercase">{s.from}</p>
        <span />
        <p className="act-ink font-mono text-[16px] font-semibold tracking-[0.14em] uppercase">{s.to}</p>
        {s.rows.map(([a, b], i) => (
          <Fragment key={a}>
            <Reveal on={step >= 1} delay={i * 0.06}>
              <p className="rounded-[14px] border border-line px-[24px] py-[16px] text-[26px] text-muted">{a}</p>
            </Reveal>
            <Reveal on={step >= 1} delay={i * 0.06}>
              <span className="act-ink block text-center font-display text-[34px] font-bold" aria-hidden>
                →
              </span>
            </Reveal>
            <Reveal on={step >= 1} delay={i * 0.06}>
              <p className="rounded-[14px] border bg-surface px-[24px] py-[16px] text-[26px] font-semibold text-text" style={{ borderColor: "var(--act)" }}>
                {b}
              </p>
            </Reveal>
          </Fragment>
        ))}
      </div>
      </div>
      <Reveal on={step >= 2}>
        <div className="flex items-end gap-[32px]">
          <p className="act-ink font-display text-[120px] leading-[0.9] font-bold tracking-[-0.03em]">{s.stat}</p>
          <div className="pb-[8px]">
            <p className="text-[30px] leading-[1.25] text-text">{s.statLabel}</p>
            <div className="mt-[8px]">
              <Tag>{s.statSrc}</Tag>
            </div>
          </div>
        </div>
      </Reveal>
    </div>
  );
}

/* ---------- S31 · Your first 90 days (fresh graduates) ---------- */
export function S31({ step }: ScreenProps) {
  const s = st.first90;
  return (
    <StopPlan
      step={step}
      eyebrow={s.eyebrow}
      headline={s.headline}
      columns={s.columns}
      evidence={s.evidence}
      tools={s.tools}
      action={s.action}
      large
      src={[step >= 2 && "DX, Sep 2025"]}
    />
  );
}

/* ---------- S38 · Your learning system (current engineers) ---------- */
export function S38({ step }: ScreenProps) {
  const s = st.engineerLearning;
  return (
    <StopPlan
      step={step}
      eyebrow={s.eyebrow}
      headline={s.headline}
      columns={s.columns}
      evidence={s.evidence}
      tools={s.tools}
      toolsLabel={s.toolsLabel}
      note={s.note}
      action={s.action}
      src={[step >= 2 && "Microsoft Work Trend Index, May 2026"]}
    />
  );
}

/* ---------- S40 · AI adoption is no longer optional ---------- */
export function S40({ step }: ScreenProps) {
  const s = st.noLongerOptional;
  return (
    <div className="relative flex h-full w-full flex-col p-[96px]">
      <SrcTag items={["Tobi Lütke on X, Apr 2025", "Business Insider, Jun 2025", step >= 3 && "DORA, Sep 2025", step >= 3 && "BCG, Jun 2026"]} />
      <StopEyebrow>{s.eyebrow}</StopEyebrow>
      <p className={`${H} mt-[14px] text-[72px] leading-[1.05]`}>{s.headline}</p>
      <div className="flex flex-1 flex-col justify-center py-[24px]">
      <div className="grid grid-cols-2 gap-[28px]">
        {s.quotes.map((q, i) => (
          <Reveal key={q.speaker} on={step >= i + 1} className="h-full">
            <QuoteCol q={q} size={38} />
          </Reveal>
        ))}
      </div>
      <div className="mt-[28px] grid grid-cols-2 gap-[28px]">
        {s.stats.map(([v, l, src], i) => (
          <Reveal key={src} on={step >= 3} delay={i * 0.06}>
            <div className="flex h-full items-center gap-[28px] rounded-[18px] border border-line bg-surface px-[32px] py-[22px]">
              <p className="act-ink font-display text-[64px] leading-[1] font-bold tabular-nums">{v}</p>
              <div>
                <p className="text-[22px] leading-[1.3] text-text">{l}</p>
                <p className="mt-[6px] font-mono text-[15px] text-muted">{src}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
      </div>
      <Reveal on={step >= 4}>
        <p className={`${H} keyline text-[52px]`}>{s.bridge}</p>
      </Reveal>
    </div>
  );
}

/* ---------- S45 · Your 90-day roadmap (companies) ---------- */
export function S45({ step }: ScreenProps) {
  const s = st.roadmap;
  return (
    <StopPlan
      step={step}
      eyebrow={s.eyebrow}
      headline={s.headline}
      columns={s.columns}
      evidence={s.evidence}
      action={s.action}
      src={[step >= 2 && "DORA AI Capabilities Model, Sep 2025", step >= 2 && "BCG, Jun 2025"]}
    />
  );
}

/* ---------- S47 · Stop 07 · Customers & clients: faster — not free, and not instant ---------- */
const CLIENT_ICONS: Record<string, LucideIcon> = { wrench: Wrench, zap: Zap, shield: ShieldCheck };
export function S47({ step }: ScreenProps) {
  const s = st.clients;
  return (
    <div className="relative flex h-full w-full flex-col p-[96px]">
      <StopEyebrow>{s.eyebrow}</StopEyebrow>
      <p className={`${H} mt-[14px] text-[88px] leading-[1.02]`}>{s.headline}</p>
      <div className="flex flex-1 flex-col justify-center py-[36px]">
        <div className="grid grid-cols-3 gap-[28px]">
          {s.messages.map((m, i) => {
            const Icon = CLIENT_ICONS[m.icon] ?? Wrench;
            return (
              <Reveal key={m.title} on={step >= 1} delay={i * 0.06} className="h-full">
                <div className="h-full rounded-[18px] border border-t-[6px] border-line bg-surface p-[36px]" style={{ borderTopColor: "var(--act)" }}>
                  <span
                    className="flex h-[64px] w-[64px] items-center justify-center rounded-[16px]"
                    style={{ background: "color-mix(in oklab, var(--act) 12%, var(--surface))" }}
                    aria-hidden
                  >
                    <Icon size={34} strokeWidth={1.9} className="act-ink" />
                  </span>
                  <p className="mt-[26px] font-display text-[38px] leading-[1.12] font-bold text-text">{m.title}</p>
                  <p className="mt-[16px] text-[27px] leading-[1.35] text-muted">{m.body}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
      <ActionBand on={step >= 2}>{s.action}</ActionBand>
    </div>
  );
}
