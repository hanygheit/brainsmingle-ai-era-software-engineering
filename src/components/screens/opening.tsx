import { motion, useReducedMotion } from "framer-motion";
import type { CSSProperties } from "react";
import { usePrintMode } from "@/deck/print-mode";
import { ArcMotif, EASE, Eyebrow, QRTile, Terminal, type TermStatus } from "@/components/kit";
import type { ScreenProps } from "@/components/deck/ScreenRenderer";
import { BRAINSMINGLE_URL, EVENT, LINKEDIN_URL } from "@/config";
import c from "@/content/opening.json";
import { LiveVote } from "./live-vote";
import qrLinkedin from "@/assets/qr-linkedin-hanysaad.svg.asset.json";
import qrBrains from "@/assets/qr-brainsmingle-hanysaad.svg.asset.json";
import { BrandBar, Chip, Pill, Reveal, SpeakerBlock, Tag, useTicker } from "./shared";
import { Check, FileCode2, FileText, FlaskConical, Terminal as TerminalIcon } from "lucide-react";
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
/** The seven stops of the talk, numbered 01–07 as on the agenda. */
const JOURNEY = c.s0.journey.map((promise, i) => ({
  n: String(i + 1).padStart(2, "0"),
  name: separators[String(i + 1) as keyof typeof separators].title,
  Icon: ICONS[agenda.stops[i]?.icon ?? ""] ?? TerminalIcon,
  promise,
  ...stopColors(i + 1),
}));

function Journey() {
  return (
    <section aria-label={c.s0.cover}>
      <p className="text-center font-mono text-[18px] tracking-[0.18em] text-muted uppercase">{c.s0.cover}</p>
      <div className="relative mt-[28px]">
        {/* the connecting line, centre of the first node to centre of the last */}
        <div
          className="absolute top-[37px] right-[calc(100%/14)] left-[calc(100%/14)] h-[2px] rounded-full opacity-70"
          style={{ background: `linear-gradient(90deg, ${JOURNEY.map((j) => j.ink).join(", ")})` }}
          aria-hidden
        />
        <ol className="relative grid grid-cols-7">
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
const S1_LINES = c.s1.terminal as { text: string; status?: TermStatus }[];
/** Terminal line count at which each card event lands (a line every 120 ms from step 1). */
const S1_AT = { files: 4, checks: [6, 8, 9, 10], stamp: S1_LINES.length };
/** The six commit dots light at these line counts: four on main, two on a branch that joins back. */
const COMMITS = [
  { x: 12, y: 24, at: 2 },
  { x: 150, y: 24, at: 4 },
  { x: 250, y: 8, at: 6 },
  { x: 370, y: 8, at: 8 },
  { x: 470, y: 24, at: 10 },
  { x: 608, y: 24, at: 11 },
];
const NAVY = "#0F1B33";

function fileIcon(path: string) {
  if (path.startsWith("tests/")) return FlaskConical;
  return path.endsWith(".md") ? FileText : FileCode2;
}

function ProgressRing({ p }: { p: number }) {
  const reduce = useReducedMotion();
  const r = 42;
  const C = 2 * Math.PI * r;
  return (
    <span className="relative block h-[100px] w-[100px] shrink-0">
      <svg width={100} height={100} viewBox="0 0 100 100" className="absolute inset-0" aria-hidden>
        <circle cx={50} cy={50} r={r} fill="none" stroke="var(--line)" strokeWidth={8} />
        <motion.circle
          cx={50}
          cy={50}
          r={r}
          fill="none"
          stroke="var(--own-fill)"
          strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray={C}
          transform="rotate(-90 50 50)"
          initial={false}
          animate={{ strokeDashoffset: C * (1 - p), opacity: p > 0 ? 1 : 0 }}
          transition={{ duration: reduce ? 0 : 0.12, ease: "linear" }}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center font-mono text-[22px] font-semibold text-text tabular-nums">{Math.round(p * 100)}%</span>
    </span>
  );
}

function CommitGraph({ visible }: { visible: number }) {
  const lit = (at: number) => visible >= at;
  const green = "var(--own-fill)";
  return (
    <svg width={620} height={32} viewBox="0 0 620 32" aria-hidden>
      <path d="M12 24 H608" stroke="var(--line)" strokeWidth={3} fill="none" />
      <path d="M150 24 C190 24 200 8 250 8 H370 C420 8 430 24 470 24" stroke={lit(10) ? green : "var(--line)"} strokeWidth={3} fill="none" className="transition-colors duration-200" />
      <path
        d="M12 24 H608"
        stroke={green}
        strokeWidth={3}
        fill="none"
        pathLength={1}
        strokeDasharray="1 1"
        strokeDashoffset={1 - Math.min(1, Math.max(0, (visible - 2) / 9))}
        className="transition-[stroke-dashoffset] duration-150 ease-linear"
      />
      {COMMITS.map(({ x, y, at }) => (
        <circle key={x} cx={x} cy={y} r={7} fill={lit(at) ? green : "#FFFFFF"} stroke={lit(at) ? green : "var(--line)"} strokeWidth={3} className="transition-colors duration-200" />
      ))}
    </svg>
  );
}

/** One checklist circle: empty until done, then a green tick. */
function Tick({ done }: { done: boolean }) {
  return (
    <span
      className="flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-200"
      style={{ borderColor: done ? "var(--own-fill)" : "var(--line)", background: done ? "var(--own-fill)" : "transparent" }}
    >
      <Check size={22} strokeWidth={3} color={NAVY} className="transition-opacity duration-200" style={{ opacity: done ? 1 : 0 }} aria-hidden />
    </span>
  );
}

/**
 * The "?" that never turns green on slide 1. It sits above the dim scrim (z-30) so it stays
 * lit for a beat after the room goes dark, then fades as "Are we?" takes over the question.
 */
function ExplainBadge({ dim, explained }: { dim: boolean; explained: boolean }) {
  const reduce = useReducedMotion();
  const print = usePrintMode();
  const pulse = !reduce && !print && !explained;
  return (
    <motion.span
      className="relative z-[30] block shrink-0"
      initial={false}
      animate={{ opacity: dim ? 0.25 : 1 }}
      transition={{ duration: reduce ? 0.15 : 0.3, ease: EASE, delay: dim && !reduce ? 0.5 : 0 }}
    >
      <motion.span
        className="flex h-[40px] w-[40px] items-center justify-center rounded-full font-display text-[26px] leading-none font-bold transition-colors duration-300"
        style={{ background: explained ? "var(--own-fill)" : "var(--validate-fill)", color: NAVY }}
        animate={
          pulse
            ? { scale: [1, 1.12, 1], boxShadow: ["0 0 0 0px rgba(242, 179, 61, 0.55)", "0 0 0 10px rgba(242, 179, 61, 0)", "0 0 0 0px rgba(242, 179, 61, 0)"] }
            : { scale: 1, boxShadow: "0 0 0 0px rgba(242, 179, 61, 0)" }
        }
        transition={pulse ? { duration: 1.2, repeat: Infinity, ease: "easeInOut" } : { duration: 0.3 }}
      >
        {explained ? <Check size={24} strokeWidth={3} aria-hidden /> : "?"}
      </motion.span>
    </motion.span>
  );
}

/** "A project being born": file tree, progress ring, commit graph and checks, in sync with the terminal. */
function ProjectCard({ visible, files, dim, explained, soft }: { visible: number; files: number; dim: boolean; explained: boolean; soft: CSSProperties }) {
  const reduce = useReducedMotion();
  const k = c.s1.card;
  const stamped = visible >= S1_AT.stamp;
  return (
    <div className="theme-paper relative flex w-[700px] shrink-0 flex-col rounded-[20px] bg-surface px-[40px] py-[36px]" style={{ boxShadow: "0 28px 60px -30px rgba(4, 9, 22, 0.8)" }}>
      <div className="flex items-center gap-[24px]" style={soft}>
        <ProgressRing p={visible / S1_LINES.length} />
        <div className="min-w-0">
          <p className="font-display text-[30px] leading-[1.15] font-bold tracking-[-0.01em] text-text">{k.title}</p>
          <p className="mt-[6px] text-[20px] text-muted transition-opacity duration-200" style={{ opacity: stamped ? 1 : 0 }}>
            {k.built}
          </p>
        </div>
      </div>
      <div className="mt-[22px]" style={soft}>
        <CommitGraph visible={visible} />
      </div>
      <div className="mt-[22px] border-t border-line pt-[20px]" style={soft}>
        <p className="font-mono text-[18px] tracking-[0.14em] text-muted uppercase">{k.files}</p>
        <ul className="mt-[10px] h-[204px]">
          {k.tree.map((path, i) => {
            const Icon = fileIcon(path);
            const cut = path.lastIndexOf("/") + 1;
            return (
              <motion.li
                key={path}
                className="flex h-[34px] items-center gap-[12px] font-mono text-[18px]"
                initial={false}
                animate={{ opacity: files > i ? 1 : 0, x: files > i || reduce ? 0 : -8 }}
                transition={{ duration: reduce ? 0.15 : 0.2, ease: EASE }}
              >
                <Icon size={20} strokeWidth={1.75} color="var(--direct)" aria-hidden />
                <span>
                  <span className="text-muted">{path.slice(0, cut)}</span>
                  <span className="text-text">{path.slice(cut)}</span>
                </span>
              </motion.li>
            );
          })}
        </ul>
      </div>
      <div className="mt-auto border-t border-line pt-[20px]">
        <p className="font-mono text-[18px] tracking-[0.14em] text-muted uppercase" style={soft}>{k.checks}</p>
        <ul className="mt-[8px]" style={soft}>
          {k.list.map((label, i) => {
            const done = visible >= S1_AT.checks[i]!;
            return (
              <li key={label} className="flex h-[50px] items-center gap-[16px]">
                <Tick done={done} />
                <span className="text-[24px] transition-colors duration-200" style={{ color: done ? "var(--text)" : "var(--muted)" }}>
                  {label}
                </span>
              </li>
            );
          })}
        </ul>
        <div
          className="mt-[12px] flex items-center gap-[16px] rounded-[14px] border-2 border-dashed px-[14px] py-[12px] transition-colors duration-300"
          style={{
            borderColor: explained ? "var(--own-fill)" : "var(--validate-fill)",
            background: `color-mix(in oklab, ${explained ? "var(--own-fill)" : "var(--validate-fill)"} 10%, #FFFFFF)`,
          }}
        >
          <ExplainBadge dim={dim} explained={explained} />
          <span className="text-[24px] font-semibold text-text" style={soft}>{k.explain}</span>
        </div>
      </div>
      {/* The rubber stamp lands when the agent reports "ready for review". */}
      <div className="pointer-events-none absolute inset-x-0 top-[262px] flex justify-center" style={soft}>
        <motion.p
          className="rounded-[14px] border-[5px] px-[30px] py-[8px] font-display text-[54px] leading-[1.1] font-bold tracking-[0.01em] whitespace-nowrap"
          style={{
            color: "var(--own)",
            borderColor: "var(--own)",
            background: "rgba(255, 255, 255, 0.88)",
            boxShadow: "0 12px 26px -10px rgba(11, 122, 85, 0.4)",
            rotate: -6,
          }}
          initial={false}
          animate={stamped ? { opacity: 1, scale: 1 } : { opacity: 0, scale: reduce ? 1 : 1.4 }}
          transition={{ duration: reduce ? 0.15 : 0.18, ease: "easeOut" }}
          aria-hidden={!stamped}
        >
          {k.stamp}
        </motion.p>
      </div>
      {/* Paper stays bright under the room dim; this brings it down to the navy panels' level. */}
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-[20px]"
        style={{ background: NAVY }}
        initial={false}
        animate={{ opacity: dim ? 0.55 : 0 }}
        transition={{ duration: reduce ? 0.15 : 0.3, ease: EASE }}
        aria-hidden
      />
    </div>
  );
}

/**
 * The cold open. `explained` is the callback on slide 50: the same card, complete,
 * with "Can the author explain it?" finally turning green.
 */
export function ColdOpen({ step, explained = false }: { step: number; explained?: boolean }) {
  const reduce = useReducedMotion();
  const visible = useTicker(S1_LINES.length, 120, step === 1, step >= 2);
  const files = useTicker(c.s1.card.tree.length, 80, step === 1 && visible >= S1_AT.files, step >= 2);
  const dim = step >= 3;
  // Blur everything but the "?" badge. Screen-only: rasterised blur bloats the PDF; dim + spotlight carry the print state.
  const print = usePrintMode();
  const soft: CSSProperties = { filter: dim && !print ? "blur(3px)" : "blur(0px)", transition: `filter ${reduce ? 0.15 : 0.3}s` };
  return (
    <div className="relative h-full w-full overflow-hidden">
      <div className="absolute inset-0 flex gap-[56px] p-[96px]">
        <ProjectCard visible={visible} files={files} dim={dim} explained={explained} soft={soft} />
        {/* Task + terminal */}
        <div className="flex min-w-0 flex-1 flex-col gap-[28px]" style={soft}>
          <div className="rounded-[20px] border border-line bg-surface p-[36px]">
            <p className="font-mono text-[18px] tracking-[0.14em] text-muted uppercase">{c.s1.panelEyebrow}</p>
            <p className="mt-[16px] font-display text-[40px] leading-[1.15] font-bold text-text">{c.s1.task}</p>
          </div>
          <div className={step >= 1 ? "opacity-100" : "opacity-0"} style={{ transform: "scale(0.88)", transformOrigin: "top left", marginBottom: -72 /* give back the 12% the scale removes */ }}>
            <Terminal lines={S1_LINES} visible={visible} title="agent" />
          </div>
          <div className="mt-auto flex flex-wrap gap-[16px]">
            {c.s1.chips.map((chip, i) => (
              <Reveal key={chip} on={step >= 2} delay={i * 0.06} y={8}>
                <Chip color="var(--own)">✓ {chip}</Chip>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
      {/* Dim to 25% with a scrim, so the "?" (z-30) can stay lit above it for a beat. (backdrop-filter would mirror edges inside the scaled stage) */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-[10]"
        style={{ background: "rgba(15, 27, 51, 0.75)" }}
        initial={false}
        animate={{ opacity: dim ? 1 : 0 }}
        transition={{ duration: reduce ? 0.15 : 0.3, ease: EASE }}
        aria-hidden
      />
      {/* Spotlight scrim behind the punchline */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-[11]"
        style={{ background: "radial-gradient(ellipse 50% 42% at 50% 50%, rgba(15, 27, 51, 0.94) 0%, rgba(15, 27, 51, 0.7) 50%, rgba(15, 27, 51, 0) 85%)" }}
        initial={false}
        animate={{ opacity: dim ? 1 : 0 }}
        transition={{ duration: reduce ? 0.15 : 0.4, ease: EASE }}
        aria-hidden
      />
      <div className="absolute top-[40px] right-[96px] z-[20]">
        <Tag>{c.s1.tag}</Tag>
      </div>
      <div className="pointer-events-none absolute inset-0 z-[40] flex flex-col items-center justify-center text-center">
        <Reveal on={dim} delay={0.3}>
          <p className="font-display text-[112px] leading-[1] font-bold tracking-[-0.04em] text-text">{c.s1.line1}</p>
        </Reveal>
        <Reveal on={dim} delay={0.5}>
          <p className="mt-[28px] pb-[0.08em] font-display text-[112px] leading-[1] font-bold tracking-[-0.04em]">
            <span className="text-gradient-signature">{c.s1.line2}</span>
          </p>
        </Reveal>
      </div>
    </div>
  );
}

export function S1({ step }: ScreenProps) {
  return <ColdOpen step={step} />;
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
          <LiveVote poll="s2-challenge" fullLink />
        </div>
      </Reveal>
      <Reveal on={step >= 2} className="absolute right-[96px] bottom-[80px]">
        <p className="font-mono text-[20px] text-muted">{c.s2.prompt}</p>
      </Reveal>
    </div>
  );
}
