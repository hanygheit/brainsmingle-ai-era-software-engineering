import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { AudienceCards, DownloadPdfButton, EASE, Eyebrow, QRTile } from "@/components/kit";
import type { ScreenProps } from "@/components/deck/ScreenRenderer";
import { BRAINSMINGLE_URL, LINKEDIN_URL, PRESENTATION_URL } from "@/config";
import tl from "@/content/talentLevers.json";
import sc from "@/content/scorecard.json";
import dd from "@/content/ddvo.json";
import rv from "@/content/review.json";
import op from "@/content/opening.json";
import { usePollCounts } from "@/lib/poll";
import qrLinkedin from "@/assets/qr-linkedin-hanysaad.svg.asset.json";
import qrBrains from "@/assets/qr-brainsmingle-hanysaad.svg.asset.json";
import qrPres from "@/assets/qr-presentation-ai-era-software-engineering.svg.asset.json";
import { S1 } from "./opening";
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

/* ---------- S18 ---------- */
export function S18({ step }: ScreenProps) {
  const [flip, setFlip] = useState(false);
  const [zoom, setZoom] = useState<boolean | null>(null);
  useEffect(() => {
    setFlip(false);
    setZoom(null);
  }, [step]);
  useKey(["ArrowDown", "ArrowUp", "z", "Z"], (k) => {
    if (k === "ArrowDown") setFlip(true);
    else if (k === "ArrowUp") setFlip(false);
    else setZoom((z) => !(z ?? step >= 5));
  });
  const current = Math.min(step, 4); // levers revealed
  const zoomed = zoom ?? step === 5;
  const after = tl.zoomAfter;
  const mark = (w: string, col: string) => <span style={{ color: col }} className="font-semibold">{w}</span>;
  const [p1, rest1] = after.split("explain");
  const [p2, rest2] = (rest1 ?? "").split("test");
  const [p3, rest3] = (rest2 ?? "").split("flags");
  return (
    <div className="relative flex h-full w-full flex-col p-[96px]">
      <SrcTag items={[step >= 6 && "DX", step >= 6 && "Anthropic, Dec 2025", step >= 6 && "Kent Beck"]} />
      <p className={`${H} text-[60px]`}>{tl.headline}</p>
      {step === 0 ? (
        <div className="mt-[48px] grid grid-cols-2 gap-[48px]">
          {[tl.toolFirst, tl.capFirst].map((c, i) => (
            <div key={c.label} className="rounded-[20px] border bg-surface p-[40px]" style={{ borderColor: i ? "var(--own)" : "var(--line)" }}>
              <Eyebrow color={i ? "var(--own)" : "var(--muted)"}>{c.label}</Eyebrow>
              <ul className="mt-[20px] space-y-[14px] text-[30px]" style={{ color: i ? "var(--text)" : "var(--muted)" }}>
                {c.items.map((it) => <li key={it}>{it}</li>)}
              </ul>
            </div>
          ))}
        </div>
      ) : zoomed ? (
        <div className="mt-[40px] grid grid-cols-2 gap-[40px]">
          <div className="col-span-2"><Eyebrow>{tl.zoomLabel}</Eyebrow></div>
          <div className="rounded-[20px] border border-line bg-surface p-[36px]">
            <p className="t-tag text-muted">BEFORE</p>
            <p className="mt-[12px] text-[30px] leading-[1.4] text-muted">{tl.zoomBefore}</p>
          </div>
          <div className="rounded-[20px] border border-own bg-surface p-[36px]">
            <p className="t-tag text-own">AFTER</p>
            <p className="mt-[12px] text-[30px] leading-[1.4] text-text">
              {p1}{mark("explain", "var(--direct)")}{p2}{mark("test", "var(--validate)")}{p3}{mark("flags", "var(--own)")}{rest3}
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-[40px] flex flex-col gap-[14px]">
          <div className="grid grid-cols-[260px_1fr_1fr] gap-[24px] px-[24px] t-tag text-muted"><span /><span>BEFORE</span><span>AFTER</span></div>
          {tl.levers.map(([name, before, aft], i) => {
            const on = i < current;
            const isCur = i === current - 1;
            const showAfter = !isCur || flip || step > 4;
            return (
              <Reveal key={name} on={on} y={10}>
                <div className="grid grid-cols-[260px_1fr_1fr] items-start gap-[24px] rounded-[14px] border border-line bg-surface px-[24px] py-[18px]">
                  <span className="font-display text-[28px] font-bold text-text">{name}</span>
                  <span className="text-[24px] text-muted">{before}</span>
                  <motion.span className="text-[24px] text-text" initial={false} animate={{ opacity: showAfter ? 1 : 0, x: showAfter ? 0 : 20 }} transition={{ duration: 0.4, ease: EASE }}>{aft}</motion.span>
                </div>
              </Reveal>
            );
          })}
        </div>
      )}
      <Reveal on={step >= 6} className="mt-auto flex flex-wrap gap-[14px]">
        {tl.chips.map((c) => <Chip key={c}>{c}</Chip>)}
      </Reveal>
    </div>
  );
}

/* ---------- S19 ---------- */
export function S19({ step }: ScreenProps) {
  const layers = [...sc.layers].reverse();
  return (
    <div className="relative flex h-full w-full gap-[64px] p-[96px]">
      <SrcTag items={[step >= 1 && "Faros AI, Apr 2026", step >= 1 && "DORA"]} />
      <div className="flex w-[1000px] flex-col justify-center gap-[12px]">
        {layers.map(([name, desc, label], ri) => {
          const i = layers.length - 1 - ri; // bottom-up index
          const out = label === "OUTCOMES";
          const act = label === "ACTIVITY";
          return (
            <Reveal key={name} on delay={i * 0.25} y={-16}>
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
          <p className={`${H} text-[48px] leading-[1.1]`}>{sc.last}</p>
          <p className="mt-[20px] text-[26px] text-muted">{sc.small}</p>
        </Reveal>
      </div>
    </div>
  );
}

/* ---------- S20 ---------- */
export function S20({ step, choice }: ScreenProps) {
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
            <Reveal on={step >= 1} className="mt-[16px] border-t border-line pt-[16px]">
              <AnimatePresence mode="wait">
                <motion.p key={idx} className="text-[26px] leading-[1.3] text-text" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                  {row[i]}
                </motion.p>
              </AnimatePresence>
            </Reveal>
            {k === "OWN" ? (
              <div className="mt-[24px] self-start rotate-[-4deg] rounded-full border-[3px] border-own px-[20px] py-[10px] font-mono text-[18px] font-bold tracking-[0.12em] text-own">{dd.seal}</div>
            ) : null}
          </div>
        ))}
      </div>
      <Reveal on={step >= 2} className="mt-auto">
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

/* ---------- S21 ---------- */
function FrameworkWords() {
  return (
    <div className="flex gap-[28px] font-display text-[28px] font-bold">
      {dd.columns.map(([k, col]) => <span key={k} style={{ color: COL[col!] }}>{k}</span>)}
    </div>
  );
}
export function S21(_: ScreenProps) {
  const { counts, total } = usePollCounts("s2-challenge", { live: false });
  const lead = total ? counts.indexOf(Math.max(...counts)) + 1 : null;
  return (
    <div className="relative h-full w-full overflow-hidden p-[96px]">
      <p className={`${H} max-w-[1400px] text-[64px]`}>{rv.s21.headline}</p>
      <div className="absolute inset-x-0 top-0" style={{ transform: "translateY(-120px)" }}>
        <AudienceCards labels={op.s2.cards} tally={counts} active={lead} />
      </div>
      <div className="absolute right-[96px] bottom-[60px] left-[96px] flex items-end justify-between">
        <FrameworkWords />
        <div className="flex gap-[28px]">
          <QRTile url={LINKEDIN_URL} label={rv.s21.qr[0]} image={qrLinkedin.url} size={200} />
          <QRTile url={BRAINSMINGLE_URL} label={rv.s21.qr[1]} image={qrBrains.url} size={200} />
          <QRTile url={PRESENTATION_URL} label={rv.s21.qr[2]} image={qrPres.url} size={200} />
        </div>
      </div>
    </div>
  );
}

/* ---------- S22 ---------- */
export function S22({ step, screen, choice }: ScreenProps) {
  const s = rv.s22;
  if (step === 0) {
    return (
      <div className="relative h-full w-full">
        <S1 screen={screen} step={3} choice={choice} />
        <div className="absolute bottom-[56px] left-[780px] font-mono text-[16px] tracking-[0.2em] text-delegate">↑ {s.tag}</div>
      </div>
    );
  }
  return (
    <div className="relative flex h-full w-full flex-col p-[96px]">
      {step === 1 ? (
        <>
          <div className="grid grid-cols-2 gap-[56px]">
            <div className="flex flex-col gap-[14px]">
              {op.s1.chips.map((c) => (
                <div key={c} className="flex items-center justify-between rounded-[14px] border border-line bg-surface px-[24px] py-[18px]">
                  <span className="text-[26px] text-muted">✓ {c}</span>
                  <span className="font-mono text-[16px] tracking-[0.15em] text-delegate">{s.tag}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-[14px]">
              {s.evidence.map(([t, col], i) => (
                <Reveal key={t} on delay={i * 0.15}>
                  <div className="rounded-[14px] border-l-[6px] bg-surface px-[24px] py-[18px] text-[26px] text-text" style={{ borderColor: COL[col!] }}>{t}</div>
                </Reveal>
              ))}
            </div>
          </div>
          <Reveal on delay={0.9} className="mt-auto">
            <p className={`${H} text-[64px]`}>{s.line}</p>
          </Reveal>
        </>
      ) : (
        <>
          <p className={`${H} text-[56px]`}>{s.prompt}</p>
          <AudienceCards labels={s.actions} />
        </>
      )}
    </div>
  );
}

/* ---------- S23 ---------- */
export function S23(_: ScreenProps) {
  const s = rv.s23;
  return (
    <div className="relative h-full w-full overflow-hidden">
      <div className="absolute top-[96px] left-[96px] max-w-[1700px]">
        <Reveal on><p className={`${H} text-[60px] leading-[1.15]`}>{s.l1}</p></Reveal>
        <Reveal on delay={0.4}>
          <p className={`${H} text-[60px] leading-[1.15]`}>{s.l2a}<span className="text-own">{s.l2b}</span>{s.l2c}</p>
        </Reveal>
      </div>
      <Reveal on delay={0.9} className="absolute top-[330px] right-[96px] left-[96px]">
        <Eyebrow>{s.eyebrow}</Eyebrow>
        <div className="mt-[16px] grid grid-cols-3 gap-[32px]">
          {s.cards.map(([who, what], i) => (
            <div key={who} className="rounded-[20px] border border-line bg-surface p-[28px]">
              <p className="font-display text-[40px] font-bold text-muted">{i + 1}</p>
              <p className="text-[22px] text-muted">{who}</p>
              <p className="mt-[6px] text-[30px] italic text-text">{what}</p>
            </div>
          ))}
        </div>
      </Reveal>
      <Reveal on delay={1.3} className="absolute top-[600px] right-[96px] left-[96px]">
        <div className="flex justify-between border-y border-line py-[16px] text-[22px]">
          {s.band.map(([k, w, col]) => (
            <span key={k}><span className="font-display font-bold" style={{ color: COL[col!] }}>{k}</span> <span className="text-muted">{w}</span></span>
          ))}
        </div>
      </Reveal>
      <Reveal on delay={1.6} className="absolute bottom-[96px] left-[96px]">
        <SpeakerBlock compact />
        <DownloadPdfButton className="mt-[24px] rounded-full border-2 border-own px-[28px] py-[12px] text-[22px] text-own" />
      </Reveal>
      <Reveal on delay={1.8} className="absolute right-[96px] bottom-[60px] flex gap-[40px]">
        <QRTile url={LINKEDIN_URL} label={s.qr[0]} image={qrLinkedin.url} size={260} />
        <QRTile url={BRAINSMINGLE_URL} label={s.qr[1]} image={qrBrains.url} size={260} />
        <QRTile url={PRESENTATION_URL} label={s.qr[2]} image={qrPres.url} size={260} />
      </Reveal>
    </div>
  );
}
