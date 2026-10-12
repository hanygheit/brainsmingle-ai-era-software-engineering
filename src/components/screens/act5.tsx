import { AnimatePresence, motion } from "framer-motion";
import { usePrintMode } from "@/deck/print-mode";
import { useEffect, useState } from "react";
import { DownloadPdfButton, EASE, Eyebrow, QRTile } from "@/components/kit";
import type { ScreenProps } from "@/components/deck/ScreenRenderer";
import { BRAINSMINGLE_URL, FEEDBACK_URL, LINKEDIN_URL, PRESENTATION_URL } from "@/config";
import { stopColors } from "@/deck/theme";
import tl from "@/content/talentLevers.json";
import sc from "@/content/scorecard.json";
import dd from "@/content/ddvo.json";
import rv from "@/content/review.json";
import { usePollState } from "@/lib/poll";
import { VoteBars } from "./live-vote";
import qrLinkedin from "@/assets/qr-linkedin-hanysaad.svg.asset.json";
import qrBrains from "@/assets/qr-brainsmingle-hanysaad.svg.asset.json";
import qrPres from "@/assets/qr-presentation-ai-era-software-engineering.svg.asset.json";
import { ColdOpen } from "./opening";
import { Chip, Reveal, SpeakerBlock, SrcTag, Tag } from "./shared";

const H = "font-display font-bold tracking-[-0.03em] text-text";
const COL: Record<string, string> = {
  direct: "var(--direct)",
  delegate: "var(--delegate)",
  validate: "var(--validate)",
  own: "var(--own)",
};

function useKey(keys: string[], fn: (k: string) => void) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (keys.includes(e.key)) {
        e.preventDefault();
        fn(e.key);
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  });
}

/* ---------- S41–S43 · An AI subscription is not a development strategy (tool vs capability / levers / evidence) ---------- */
export function S41({ step }: ScreenProps) {
  return (
    <div className="relative flex h-full w-full flex-col p-[96px]">
      <p className={`${H} text-[72px]`}>{tl.headline}</p>
      <div className="flex flex-1 items-center pb-[40px]">
        <div className="grid w-full grid-cols-2 gap-[40px]">
          {[tl.toolFirst, tl.capFirst].map((c, i) => (
          <Reveal key={c.label} on={step >= i + 1}>
            <div className="relative h-full overflow-hidden rounded-[20px] border bg-surface p-[48px]" style={{ borderColor: i ? "var(--own)" : "var(--line)" }}>
              <div className="absolute inset-x-0 top-0 h-[6px]" style={{ background: i ? "var(--own-fill)" : "var(--line)" }} />
              <p className="border-b border-line pb-[24px] font-display text-[48px] font-bold" style={{ color: i ? "var(--own)" : "var(--muted)" }}>{c.label}</p>
              <ul className="mt-[28px] space-y-[18px] text-[34px] leading-[1.3]" style={{ color: i ? "var(--text)" : "var(--muted)" }}>
                {c.items.map((it) => (
                  <li key={it} className="flex items-baseline gap-[20px]">
                    <span className="w-[28px] shrink-0 font-mono text-[28px] font-semibold" style={{ color: i ? "var(--own)" : "var(--muted)" }} aria-hidden>{i ? "✓" : "–"}</span>
                    {it}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}
export function S42({ step }: ScreenProps) {
  const print = usePrintMode();
  const [zoom, setZoom] = useState(false);
  useKey(["z", "Z"], () => setZoom((z) => !z));
  const after = tl.zoomAfter;
  const mark = (w: string, col: string) => <span style={{ color: col }} className="font-semibold">{w}</span>;
  const [p1, rest1] = after.split("explain");
  const [p2, rest2] = (rest1 ?? "").split("test");
  const [p3, rest3] = (rest2 ?? "").split("flags");
  return (
    <div className="relative flex h-full w-full flex-col p-[96px]">
      <p className={`${H} text-[56px]`}>{tl.headline}</p>
      {zoom || print ? (
        <div className={print ? "mt-[24px] grid grid-cols-2 gap-[20px]" : "mt-[40px] grid grid-cols-2 gap-[32px]"}>
          <div className="col-span-2"><Eyebrow>{tl.zoomLabel}</Eyebrow></div>
          <div className={`rounded-[20px] border border-line bg-surface ${print ? "p-[20px]" : "p-[36px]"}`}>
            <p className="t-tag text-muted">BEFORE</p>
            <p className={`mt-[8px] leading-[1.35] text-muted ${print ? "text-[22px]" : "text-[30px]"}`}>{tl.zoomBefore}</p>
          </div>
          <div className={`rounded-[20px] border border-own bg-surface ${print ? "p-[20px]" : "p-[36px]"}`}>
            <p className="t-tag text-own">AFTER</p>
            <p className={`mt-[8px] leading-[1.35] text-text ${print ? "text-[22px]" : "text-[30px]"}`}>
              {p1}{mark("explain", "var(--direct)")}{p2}{mark("test", "var(--validate)")}{p3}{mark("flags", "var(--own)")}{rest3}
            </p>
          </div>
        </div>
      ) : null}
      {!zoom || print ? (
        <div className={`${print ? "mt-[20px] gap-[8px]" : "mt-[40px] gap-[14px]"} flex flex-col`}>
          <div className="grid grid-cols-[280px_1fr_1.6fr] gap-[28px] px-[28px] t-tag text-muted"><span /><span>BEFORE</span><span>AFTER</span></div>
          {tl.levers.map(([name, before, aft], i) => (
            <Reveal key={name} on={step >= i + 1} y={10}>
              <div className={`grid grid-cols-[280px_1fr_1.6fr] items-start gap-[28px] rounded-[14px] border border-line bg-surface px-[28px] ${print ? "py-[12px]" : "py-[22px]"}`}>
                <span className="font-display text-[30px] font-bold text-text">{name}</span>
                <span className="text-[24px] text-muted">{before}</span>
                <Reveal on={step >= i + 1} delay={0.06} y={0}>
                  <span className="text-[24px] text-text">{aft}</span>
                </Reveal>
              </div>
            </Reveal>
          ))}
        </div>
      ) : null}
    </div>
  );
}
export function S43({ step }: ScreenProps) {
  return (
    <div className="relative flex h-full w-full flex-col p-[96px]">
      <SrcTag items={["DX", "Anthropic, Dec 2025", "Kent Beck"]} />
      <p className={`${H} text-[72px]`}>{tl.headline}</p>
      <div className="flex flex-1 flex-col justify-center gap-[28px]">
        {tl.chips.map((t, i) => (
          <Reveal key={t} on={step >= 1} delay={i * 0.06}>
            <div className="relative flex items-center gap-[32px] overflow-hidden rounded-[20px] border border-line bg-surface py-[32px] pr-[40px] pl-[48px]">
              <span className="absolute inset-y-0 left-0 w-[6px] bg-[var(--act)]" aria-hidden />
              <span className="act-ink font-mono text-[22px] font-semibold tabular-nums" aria-hidden>{String(i + 1).padStart(2, "0")}</span>
              <p className="font-mono text-[32px] leading-[1.35] text-text">{t}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

/* ---------- S44 ---------- */
export function S44({ step }: ScreenProps) {
  const layers = [...sc.layers].reverse();
  return (
    <div className="relative flex h-full w-full gap-[64px] p-[96px]">
      <SrcTag items={[step >= 1 && "Faros AI, Sep 2026", step >= 1 && "DORA, Mar 2026", step >= 1 && "McKinsey, Aug 2026"]} />
      <div className="flex w-[1000px] flex-col justify-center gap-[12px]">
        {layers.map(([name, desc, label], ri) => {
          const i = layers.length - 1 - ri; // bottom-up index
          const out = label === "OUTCOMES";
          const act = label === "ACTIVITY";
          return (
            <Reveal key={name} on delay={i * 0.06} y={-16}>
              <div className="flex items-center gap-[28px] rounded-[14px] border bg-surface px-[28px] py-[22px]" style={{ borderColor: out ? "var(--own)" : "var(--line)", opacity: act ? 0.6 : 1 }}>
                <span className="w-[260px] font-display text-[32px] font-bold" style={{ color: out ? "var(--own)" : act ? "var(--muted)" : "var(--text)" }}>{name}</span>
                <span className="flex-1 text-[22px] text-muted">{desc}</span>
                {label ? <span className="font-mono text-[18px]" style={{ color: out ? "var(--own)" : "var(--muted)" }}>{label}</span> : null}
              </div>
            </Reveal>
          );
        })}
      </div>
      <div className="flex flex-1 flex-col justify-center gap-[24px]">
        <Reveal on={step >= 1} className="flex flex-col gap-[12px]">
          {sc.tags.map((t) => <Chip key={t} color="var(--validate)">{t}</Chip>)}
        </Reveal>
        <Reveal on={step >= 2}>
          <p className={`${H} keyline text-[48px] leading-[1.1]`}>{sc.last}</p>
          <p className="mt-[20px] text-[26px] text-muted">{sc.small}</p>
        </Reveal>
      </div>
    </div>
  );
}

/* ---------- S46 ---------- */
export function S46({ step, choice }: ScreenProps) {
  const idx = choice && choice >= 1 && choice <= 6 ? choice - 1 : 2;
  const row = dd.rows[idx]!;
  return (
    <div className="relative flex h-full w-full flex-col p-[96px]">
      <div className="flex items-center gap-[12px]">
        {dd.stages.map((s, i) => (
          <span key={s} className="rounded-full border px-[18px] py-[8px] text-[20px]" style={{ borderColor: i === idx ? "var(--own)" : "var(--line)", color: i === idx ? "var(--text)" : "var(--muted)" }}>
            <span className="font-mono text-muted">{i + 1}</span> {s}
          </span>
        ))}
        <span className="ml-auto"><Tag>{dd.tag}</Tag></span>
      </div>
      <div className="mt-[36px] grid grid-cols-4 gap-[24px]">
        {dd.columns.map(([k, col, q], i) => (
          <div key={k} className="relative flex flex-col rounded-[20px] border-t-[8px] bg-surface p-[32px]" style={{ borderColor: COL[col!] }}>
            <p className="font-display text-[40px] font-bold" style={{ color: COL[col!] }}>{k}</p>
            <p className="mt-[12px] min-h-[110px] text-[22px] text-muted">{q}</p>
            <div className="mt-[16px] border-t border-line pt-[16px]">
              <AnimatePresence mode="wait">
                <motion.p key={idx} className="text-[26px] leading-[1.3] text-text" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                  {row[i]}
                </motion.p>
              </AnimatePresence>
            </div>
            {k === "OWN" ? (
              <div className="mt-[24px] self-start rotate-[-4deg] rounded-full border-[3px] border-own px-[20px] py-[10px] font-mono text-[18px] font-bold tracking-[0.12em] text-own">{dd.seal}</div>
            ) : null}
          </div>
        ))}
      </div>
      <Reveal on={step >= 1} className="mt-auto">
        <div className="grid grid-cols-4 gap-[24px]">
          {dd.levers.map(([k, w]) => (
            <div key={k} className="text-center"><p className="font-display text-[30px] font-bold text-own">{k}</p><p className="text-[20px] text-muted">{w}</p></div>
          ))}
        </div>
        <div className="mt-[20px] flex items-center justify-between rounded-full border border-line px-[40px] py-[16px] font-mono text-[24px] text-text">
          {dd.pipeline.map((p, i) => (
            <span key={p} className="flex items-center gap-[24px]">{p}{i < dd.pipeline.length - 1 ? <span className="text-muted">→</span> : null}</span>
          ))}
        </div>
      </Reveal>
    </div>
  );
}

/* ---------- S47 ---------- */
function FrameworkWords() {
  return (
    <div className="flex gap-[28px] font-display text-[28px] font-bold">
      {dd.columns.map(([k, col]) => <span key={k} style={{ color: COL[col!] }}>{k}</span>)}
    </div>
  );
}
export function S47(_: ScreenProps) {
  const { state } = usePollState(5000);
  const closed = state ? !state["s2-challenge"].open : false;
  return (
    <div className="relative h-full w-full overflow-hidden p-[96px]">
      <p className={`${H} max-w-[1400px] text-[64px] leading-[1.1]`}>{rv.s21.headline}</p>
      <div className="mt-[44px] flex items-start gap-[80px]">
        <div className="w-[1020px] shrink-0">
          <Eyebrow>{rv.s21.mix}</Eyebrow>
          <div className="mt-[18px]">
            <VoteBars poll="s2-challenge" compact closed={closed} />
          </div>
        </div>
        <p className="flex-1 pt-[56px] font-display text-[54px] leading-[1.12] font-bold tracking-[-0.03em] text-own">{rv.s21.line}</p>
      </div>
      <div className="absolute right-[96px] bottom-[60px] left-[96px] flex items-end justify-between">
        <FrameworkWords />
        <div className="flex gap-[44px]">
          <QRTile url={LINKEDIN_URL} label={rv.s21.qr[0]!} image={qrLinkedin.url} size={180} />
          <QRTile url={BRAINSMINGLE_URL} label={rv.s21.qr[1]!} image={qrBrains.url} size={180} />
          <QRTile url={PRESENTATION_URL} label={rv.s21.qr[2]!} image={qrPres.url} size={180} />
          <QRTile url={FEEDBACK_URL} label={rv.s21.qr[3]!} size={180} />
        </div>
      </div>
    </div>
  );
}

/* ---------- S48 · The code is ready. Are we? Yes — we can be. ---------- */
export function S48({ step }: ScreenProps) {
  const s = rv.s22;
  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden p-[96px]">
      <div className="flex items-center gap-[64px]">
        <div className="relative h-[349px] w-[620px] shrink-0 overflow-hidden rounded-[16px] border border-line">
          <div style={{ width: 1920, height: 1080, transform: `scale(${620 / 1920})`, transformOrigin: "top left" }}>
            <ColdOpen step={2} explained={step >= 1} />
          </div>
        </div>
        <div>
          <p className="font-display text-[56px] leading-[1.1] font-bold tracking-[-0.03em] text-muted">{s.q}</p>
          <Reveal on={step >= 1}>
            <p className="mt-[16px] pb-[0.08em] font-display text-[120px] leading-[1] font-bold tracking-[-0.045em]">
              <span className="text-gradient-signature">{s.a}</span>
            </p>
          </Reveal>
        </div>
      </div>
      <Reveal on={step >= 2} className="mt-[52px]">
        <Eyebrow>{s.rolesLabel}</Eyebrow>
        <div className="mt-[16px] grid grid-cols-3 gap-[20px]">
          {s.roles.map(([who, what, stop], i) => {
            const { ink } = stopColors(Number(stop));
            return (
              <Reveal key={String(who)} on={step >= 2} delay={i * 0.06} className="h-full">
                <div className="h-full rounded-[18px] border border-line bg-surface px-[26px] py-[22px]" style={{ borderTop: `4px solid ${ink}` }}>
                  <p className="font-mono text-[16px] font-semibold tracking-[0.16em] uppercase" style={{ color: ink }}>{who}</p>
                  <p className="mt-[10px] text-[26px] leading-[1.3] text-text">{what}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </Reveal>
      <Reveal on={step >= 3} className="mt-auto">
        <p className={`${H} keyline text-[48px]`}>{s.line}</p>
      </Reveal>
    </div>
  );
}

/* ---------- S49 ---------- */
export function S49(_: ScreenProps) {
  const s = rv.s23;
  return (
    <div className="relative h-full w-full overflow-hidden">
      <div className="absolute top-[96px] left-[96px] max-w-[1700px]">
        <Reveal on><p className={`${H} text-[60px] leading-[1.15]`}>{s.l1}</p></Reveal>
        <Reveal on delay={0.06}>
          <p className={`${H} text-[60px] leading-[1.15]`}>{s.l2a}<span className="text-gradient-signature">{s.l2b}</span>{s.l2c}</p>
        </Reveal>
      </div>
      <Reveal on delay={0.12} className="absolute top-[330px] right-[96px] left-[96px]">
        <Eyebrow>{s.eyebrow}</Eyebrow>
        <p className="mt-[20px] font-display text-[68px] leading-[1.1] font-bold tracking-[-0.035em] text-own">{s.prompt}</p>
      </Reveal>
      <Reveal on delay={0.18} className="absolute top-[622px] right-[96px] left-[96px]">
        <div className="flex justify-between border-y border-line py-[16px] text-[22px]">
          {s.band.map(([k, w, col]) => (
            <span key={k}><span className="font-display font-bold" style={{ color: COL[col!] }}>{k}</span> <span className="text-muted">{w}</span></span>
          ))}
        </div>
      </Reveal>
      <Reveal on delay={0.24} className="absolute bottom-[96px] left-[96px]">
        <SpeakerBlock compact />
        <DownloadPdfButton className="mt-[24px] rounded-full border-2 border-own px-[28px] py-[12px] text-[22px] text-own" />
      </Reveal>
      <Reveal on delay={0.3} className="absolute right-[96px] bottom-[60px] flex gap-[56px]">
        <QRTile url={LINKEDIN_URL} label={s.qr[0]!} image={qrLinkedin.url} size={220} />
        <QRTile url={BRAINSMINGLE_URL} label={s.qr[1]!} image={qrBrains.url} size={220} />
        <QRTile url={PRESENTATION_URL} label={s.qr[2]!} image={qrPres.url} size={220} />
        <QRTile url={FEEDBACK_URL} label={s.qr[3]!} size={220} />
      </Reveal>
    </div>
  );
}
