import { motion, useReducedMotion } from "framer-motion";
import { usePrintMode } from "@/deck/print-mode";
import { ArcMotif, EASE, Eyebrow, QRTile, Terminal, type TermStatus } from "@/components/kit";
import type { ScreenProps } from "@/components/deck/ScreenRenderer";
import { BRAINSMINGLE_URL, EVENT, LINKEDIN_URL } from "@/config";
import c from "@/content/opening.json";
import { LiveVote } from "./live-vote";
import qrLinkedin from "@/assets/qr-linkedin-hanysaad.svg.asset.json";
import qrBrains from "@/assets/qr-brainsmingle-hanysaad.svg.asset.json";
import { BrandBar, Chip, Pill, Reveal, SpeakerBlock, Tag, useTicker } from "./shared";
import { Terminal as TerminalIcon } from "lucide-react";
import agenda from "@/content/agenda.json";
import separators from "@/content/separators.json";
import { stopColors } from "@/deck/theme";
import { useServerNow } from "@/deck/gate";
import { ICONS } from "./stops";

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
  const now = useServerNow();
  if (print) return <p className="font-mono text-[26px] text-muted">Mon 12 Oct 2026 · 8:00PM Cairo time</p>;
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

/** Title with the signature gradient on its first word ("AI-Era"). */
function SignatureTitle({ text }: { text: string }) {
  const [first, ...rest] = text.split(" ");
  return (
    <>
      <span className="text-gradient-signature">{first}</span> {rest.join(" ")}
    </>
  );
}

/* ---------- S0 · Lobby ---------- */
/** The six parts of the talk (stops 02–07), numbered 1–6 for the lobby. */
const JOURNEY = c.s0.journey.map((promise, i) => ({
  n: String(i + 1).padStart(2, "0"),
  name: separators[String(i + 1) as keyof typeof separators].title,
  Icon: ICONS[agenda.stops[i + 1]?.icon ?? ""] ?? TerminalIcon,
  promise,
  ...stopColors(i + 2),
}));

function Journey() {
  return (
    <section aria-label={c.s0.cover}>
      <p className="text-center font-mono text-[18px] tracking-[0.18em] text-muted uppercase">{c.s0.cover}</p>
      <div className="relative mt-[28px]">
        {/* the connecting line, centre of the first node to centre of the last */}
        <div
          className="absolute top-[37px] right-[calc(100%/12)] left-[calc(100%/12)] h-[2px] rounded-full opacity-70"
          style={{ background: `linear-gradient(90deg, ${JOURNEY.map((j) => j.ink).join(", ")})` }}
          aria-hidden
        />
        <ol className="relative grid grid-cols-6">
          {JOURNEY.map(({ n, name, Icon, promise, fill, ink }) => (
            <li key={n} className="flex flex-col items-center px-[14px] text-center">
              {/* SVG ring: big CSS circles print with a flattened bottom in Chromium's PDF output */}
              <span className="relative block h-[76px] w-[76px]">
                <svg width={76} height={76} viewBox="0 0 76 76" className="absolute inset-0" aria-hidden>
                  <circle cx={38} cy={38} r={36} style={{ fill: `color-mix(in oklab, ${fill} 20%, #0F1B33)` }} stroke={ink} strokeWidth={2} />
                </svg>
                <Icon size={32} strokeWidth={1.75} color={ink} className="absolute top-[22px] left-[22px]" aria-hidden />
              </span>
              <p className="mt-[16px] font-mono text-[17px] tracking-[0.12em]" style={{ color: ink }}>
                {n}
              </p>
              <p className="mt-[4px] font-display text-[26px] leading-[1.15] font-bold tracking-[-0.01em] text-text [text-wrap:balance]">{name}</p>
              <p className="mt-[8px] text-[21px] leading-[1.3] text-muted [text-wrap:balance]">{promise}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function S0(_: ScreenProps) {
  return (
    <div className="relative h-full w-full overflow-hidden">
      <BreathingArcs opacity={0.4} />
      <div className="absolute top-[64px] right-[96px] left-[96px] flex justify-center">
        <Pill>{c.s0.eyebrow}</Pill>
      </div>
      <div className="absolute inset-x-0 top-[152px] flex flex-col items-center text-center">
        <h1 className="font-display text-[100px] leading-[1] font-bold tracking-[-0.04em] text-text"><SignatureTitle text={c.s0.title} /></h1>
        <p className="mt-[20px] text-[36px] text-muted">{c.s0.subtitle}</p>
        <div className="mt-[28px]">
          <BrandBar width={260} />
        </div>
        <div className="mt-[22px]">
          <Countdown />
        </div>
      </div>
      <div className="absolute top-[470px] right-[96px] left-[96px]">
        <Journey />
      </div>
      <div className="absolute bottom-[72px] left-[96px]">
        <SpeakerBlock />
      </div>
      <div className="absolute right-[96px] bottom-[60px] flex gap-[32px]">
        <QRTile url={LINKEDIN_URL} label={c.s0.linkedin} image={qrLinkedin.url} size={180} />
        <QRTile url={BRAINSMINGLE_URL} label={c.s0.brainsmingle} image={qrBrains.url} size={180} />
      </div>
    </div>
  );
}

/* ---------- S1 · The code is ready ---------- */
export function S1({ step }: ScreenProps) {
  const reduce = useReducedMotion();
  const lines = c.s1.terminal as { text: string; status?: TermStatus }[];
  const visible = useTicker(lines.length, 120, step === 1, step >= 2);
  const dim = step >= 3;
  // Blur is screen-only: rasterised blur bloats the PDF; dim + spotlight carry the print state.
  const print = usePrintMode();
  return (
    <div className="relative h-full w-full overflow-hidden">
      <motion.div
        className="absolute inset-0 flex gap-[64px] p-[96px]"
        initial={false}
        animate={{ opacity: dim ? 0.3 : 1, filter: dim && !reduce && !print ? "blur(3px)" : "blur(0px)" }}
        transition={{ duration: reduce ? 0.15 : 0.3, ease: EASE }}
      >
        {/* App preview */}
        <div className="flex w-[620px] shrink-0 flex-col overflow-hidden rounded-[20px] border border-line bg-surface">
          <div className="flex items-center gap-[10px] border-b border-line px-[24px] py-[14px]">
            <span className="win-dot" />
            <span className="win-dot" />
            <span className="win-dot" />
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
              <Reveal key={chip} on={step >= 2} delay={i * 0.06} y={8}>
                <Chip color="var(--own)">✓ {chip}</Chip>
              </Reveal>
            ))}
          </div>
        </div>
      </motion.div>
      {/* Spotlight scrim behind the punchline */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse 50% 42% at 50% 50%, rgba(15, 27, 51, 0.94) 0%, rgba(15, 27, 51, 0.7) 50%, rgba(15, 27, 51, 0) 85%)" }}
        initial={false}
        animate={{ opacity: dim ? 1 : 0 }}
        transition={{ duration: reduce ? 0.15 : 0.4, ease: EASE }}
        aria-hidden
      />
      <div className="absolute top-[40px] right-[96px]">
        <Tag>{c.s1.tag}</Tag>
      </div>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
        <Reveal on={dim}>
          <p className="font-display text-[112px] leading-[1] font-bold tracking-[-0.04em] text-text">{c.s1.line1}</p>
        </Reveal>
        <Reveal on={dim} delay={0.3}>
          <p className="mt-[28px] pb-[0.08em] font-display text-[112px] leading-[1] font-bold tracking-[-0.04em]"><span className="text-gradient-signature">{c.s1.line2}</span></p>
        </Reveal>
      </div>
    </div>
  );
}

/* ---------- S2 · Ready for what? ---------- */
export function S2({ step }: ScreenProps) {
  return (
    <div className="relative h-full w-full overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-[-260px] flex justify-center opacity-70">
        <ArcMotif count={6} radius={460} />
      </div>
      <div className="absolute inset-x-0 top-[80px] flex flex-col items-center text-center">
        <h1 className="font-display text-[88px] leading-[1] font-bold tracking-[-0.035em] text-text"><SignatureTitle text={c.s2.title} /></h1>
        <p className="mt-[20px] text-[34px] text-muted">{c.s2.subtitle}</p>
      </div>
      <Reveal on={step >= 1} className="absolute top-[300px] right-[96px] left-[96px]">
        <Eyebrow>{c.s2.question}</Eyebrow>
        <p className="mt-[8px] font-display text-[60px] leading-[1.05] font-bold tracking-[-0.03em] text-text">{c.poll.question}</p>
        <div className="mt-[44px]">
          <LiveVote poll="s2-challenge" />
        </div>
      </Reveal>
      <Reveal on={step >= 2} className="absolute bottom-[64px] left-[96px]">
        <SpeakerBlock compact />
      </Reveal>
      <Reveal on={step >= 2} className="absolute right-[96px] bottom-[80px]">
        <p className="font-mono text-[20px] text-muted">{c.s2.prompt}</p>
      </Reveal>
    </div>
  );
}
