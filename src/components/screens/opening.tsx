import { motion, useReducedMotion } from "framer-motion";
import { usePrintMode } from "@/deck/print-mode";
import { useEffect, useState } from "react";
import { ArcMotif, AudienceCards, EASE, Eyebrow, QRTile, Terminal, type TermStatus } from "@/components/kit";
import type { ScreenProps } from "@/components/deck/ScreenRenderer";
import { BRAINSMINGLE_URL, EVENT, LINKEDIN_URL, voteUrl } from "@/config";
import c from "@/content/opening.json";
import { usePollCounts } from "@/lib/poll";
import qrLinkedin from "@/assets/qr-linkedin-hanysaad.svg.asset.json";
import qrBrains from "@/assets/qr-brainsmingle-hanysaad.svg.asset.json";
import { Chip, Reveal, SpeakerBlock, Tag, useTicker } from "./shared";

function BreathingArcs({ radius = 520, opacity = 0.6 }: { radius?: number; opacity?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className="pointer-events-none absolute inset-0 flex items-center justify-center"
      style={{ opacity }}
      animate={reduce ? { scale: 1 } : { scale: [1, 1.04, 1] }}
      transition={reduce ? { duration: 0 } : { duration: 8, repeat: Infinity, ease: "easeInOut" }}
    >
      <ArcMotif count={6} radius={radius} />
    </motion.div>
  );
}

function Countdown() {
  const print = usePrintMode();
  const target = new Date(EVENT.start).getTime();
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  if (print) return <p className="font-mono text-[26px] text-muted">Mon 12 Oct 2026 · 20:00 Cairo</p>;
  if (now === null) return <p className="h-[30px]" />;
  const left = Math.max(0, Math.floor((target - now) / 1000));
  if (left === 0) return <p className="font-mono text-[26px] text-own">{c.s0.startingNow}</p>;
  const d = Math.floor(left / 86400);
  const h = Math.floor((left % 86400) / 3600);
  const m = Math.floor((left % 3600) / 60);
  const s = left % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    <p className="font-mono text-[26px] text-muted tabular-nums">
      {c.s0.startsIn} {d > 0 ? `${d}d ` : ""}
      {pad(h)}:{pad(m)}:{pad(s)}
    </p>
  );
}

/* ---------- S0 · Lobby ---------- */
export function S0(_: ScreenProps) {
  return (
    <div className="relative h-full w-full overflow-hidden">
      <BreathingArcs />
      <div className="absolute top-[96px] right-[96px] left-[96px]">
        <Eyebrow>{c.s0.eyebrow}</Eyebrow>
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <h1 className="font-display text-[88px] leading-[1] font-bold tracking-[-0.035em] text-text">{c.s0.title}</h1>
        <p className="mt-[24px] text-[34px] text-muted">{c.s0.subtitle}</p>
        <div className="mt-[40px]">
          <Countdown />
        </div>
      </div>
      <div className="absolute bottom-[96px] left-[96px]">
        <SpeakerBlock />
      </div>
      <div className="absolute right-[96px] bottom-[96px] flex gap-[40px]">
        <QRTile url={LINKEDIN_URL} label={c.s0.linkedin} image={qrLinkedin.url} size={260} />
        <QRTile url={BRAINSMINGLE_URL} label={c.s0.brainsmingle} image={qrBrains.url} size={260} />
      </div>
    </div>
  );
}

/* ---------- S1 · The code is ready ---------- */
export function S1({ step }: ScreenProps) {
  const reduce = useReducedMotion();
  const lines = c.s1.terminal as { text: string; status?: TermStatus }[];
  const visible = useTicker(lines.length, 350, step === 1, step >= 2);
  const dim = step >= 3;
  return (
    <div className="relative h-full w-full overflow-hidden">
      <motion.div
        className="absolute inset-0 flex gap-[64px] p-[96px]"
        initial={false}
        animate={{ opacity: dim ? 0.25 : 1 }}
        transition={{ duration: reduce ? 0.15 : 0.8, ease: EASE }}
      >
        {/* App preview */}
        <div className="flex w-[620px] shrink-0 flex-col overflow-hidden rounded-[20px] border border-line bg-surface">
          <div className="flex items-center gap-[10px] border-b border-line px-[24px] py-[14px]">
            <span className="h-[12px] w-[12px] rounded-full bg-line" />
            <span className="h-[12px] w-[12px] rounded-full bg-line" />
            <span className="h-[12px] w-[12px] rounded-full bg-line" />
            <span className="ml-[12px] font-mono text-[18px] text-muted">{c.s1.app.name}</span>
          </div>
          <div className="flex flex-1 flex-col justify-center px-[72px]">
            <p className="font-display text-[48px] font-bold text-text">{c.s1.app.heading}</p>
            {[c.s1.app.email, c.s1.app.password].map((f) => (
              <div key={f} className="mt-[32px]">
                <p className="text-[20px] text-muted">{f}</p>
                <div className="mt-[10px] h-[64px] rounded-[12px] border border-line" />
              </div>
            ))}
            <div className="mt-[40px] flex h-[68px] items-center justify-center rounded-[12px] bg-direct-fill font-semibold text-[24px] text-background">
              {c.s1.app.button}
            </div>
            <p className="mt-[28px] text-center text-[18px] text-muted">{c.s1.app.footer}</p>
          </div>
        </div>
        {/* Task + terminal */}
        <div className="flex min-w-0 flex-1 flex-col gap-[28px]">
          <div className="rounded-[20px] border border-line bg-surface p-[36px]">
            <Eyebrow>{c.s1.panelEyebrow}</Eyebrow>
            <p className="mt-[16px] font-display text-[40px] leading-[1.15] font-bold text-text">{c.s1.task}</p>
          </div>
          <div className={step >= 1 ? "opacity-100" : "opacity-0"} style={{ transform: "scale(0.94)", transformOrigin: "top left" }}>
            <Terminal lines={lines} visible={visible} title="agent" />
          </div>
          <div className="mt-auto flex flex-wrap gap-[16px]">
            {c.s1.chips.map((chip, i) => (
              <Reveal key={chip} on={step >= 2} delay={i * 0.15} y={8}>
                <Chip color="var(--own)">✓ {chip}</Chip>
              </Reveal>
            ))}
          </div>
        </div>
      </motion.div>
      <div className="absolute top-[40px] right-[96px]">
        <Tag>{c.s1.tag}</Tag>
      </div>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
        <Reveal on={dim}>
          <p className="font-display text-[96px] leading-[1] font-bold tracking-[-0.035em] text-text">{c.s1.line1}</p>
        </Reveal>
        <Reveal on={dim} delay={1.2}>
          <p className="mt-[32px] font-display text-[96px] leading-[1] font-bold tracking-[-0.035em] text-own">{c.s1.line2}</p>
        </Reveal>
      </div>
    </div>
  );
}

/* ---------- S2 · Ready for what? ---------- */
export function S2({ step, choice }: ScreenProps) {
  const { counts } = usePollCounts("s2-challenge");
  const print = usePrintMode();
  const url = voteUrl("s2-challenge");
  return (
    <div className="relative h-full w-full overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-[-260px] flex justify-center opacity-70">
        <ArcMotif count={6} radius={460} />
      </div>
      <div className="absolute inset-x-0 top-[96px] flex flex-col items-center text-center">
        <h1 className="font-display text-[88px] leading-[1] font-bold tracking-[-0.035em] text-text">{c.s2.title}</h1>
        <p className="mt-[20px] text-[34px] text-muted">{c.s2.subtitle}</p>
      </div>
      <Reveal on={step >= 1} className="absolute top-[290px] right-[96px] left-[96px]">
        <Eyebrow>{c.s2.question}</Eyebrow>
        <p className="mt-[8px] font-display text-[34px] font-bold whitespace-nowrap text-text">
          {c.s2.prompt} <span className="ml-[16px] font-mono text-[18px] font-normal text-muted">or scan to vote →</span>
        </p>
      </Reveal>
      <Reveal on={step >= 1} className="absolute inset-0" y={24}>
        <div className="absolute inset-0" style={{ transform: "translateY(-250px)" }}>
          <AudienceCards labels={c.s2.cards} tally={print ? undefined : counts} active={choice} />
        </div>
      </Reveal>
      <Reveal on={step >= 3} className="absolute inset-x-0 top-[696px] text-center">
        <p className="font-mono text-[28px] text-own">{c.s2.journey}</p>
      </Reveal>
      <Reveal on={step >= 2} className="absolute bottom-[80px] left-[96px]">
        <SpeakerBlock compact />
      </Reveal>
      <Reveal on={step >= 2} className="absolute right-[96px] bottom-[60px] flex items-end gap-[24px]">
        <QRTile url={url} label="Vote 1 · 2 · 3" size={200} />
        <QRTile url={LINKEDIN_URL} label={c.s0.linkedin} image={qrLinkedin.url} size={180} />
        <QRTile url={BRAINSMINGLE_URL} label={c.s0.brainsmingle} image={qrBrains.url} size={180} />
      </Reveal>
    </div>
  );
}
