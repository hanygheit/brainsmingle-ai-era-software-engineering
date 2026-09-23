import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { SPEAKER } from "@/content/types";
import {
  BigNumeral,
  Chip,
  Icon,
  IconDisc,
  LinkedInQR,
  Monogram,
  Reveal,
  Title,
} from "../primitives";
import { useTypedLines } from "../Typewriter";
import { SlideFrame, type LayoutProps } from "./frame";

/* ------------------------------------------------------------ 1 · title */

export function TitleSlide({ slide, step, calm }: LayoutProps) {
  const lines = slide.title.split("\n");
  const tagline = String(slide.data?.tagline ?? "");
  const typed = useTypedLines([tagline], !calm, 18);
  return (
    <SlideFrame slide={slide} calm={calm}>
      <div className="flex h-full flex-col justify-center">
        <h1 className="font-sans text-[104px] leading-[1.05] font-bold tracking-[-0.03em] text-white">
          {lines.map((l, i) => (
            <motion.span
              key={l}
              className="block"
              initial={calm ? false : { opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.15 + i * 0.12, ease: "easeOut" }}
            >
              {l}
            </motion.span>
          ))}
        </h1>
        <p className="mt-[34px] font-sans text-[38px] text-gray-light">{slide.subtitle}</p>
        <p className="mt-[26px] font-mono text-[22px] tracking-[0.12em] text-gold">
          {calm ? tagline : typed.done > 0 ? tagline : typed.partial}
        </p>

        <Reveal show={step >= 0} className="mt-[70px] flex items-center gap-5">
          <span className="flex h-[64px] w-[64px] items-center justify-center rounded-full border border-gold/60">
            <Monogram size={40} />
          </span>
          <span>
            <span className="block font-sans text-[26px] font-bold text-white">{SPEAKER.name}</span>
            <span className="block font-sans text-[20px] text-gray-light">{SPEAKER.role}</span>
          </span>
        </Reveal>
      </div>
      <div className="absolute right-0 bottom-[6px]">
        <LinkedInQR size={140} />
      </div>
    </SlideFrame>
  );
}

/* --------------------------------------------------- 2 · cold open (big) */

export function BigNumberSlide({ slide, step, calm }: LayoutProps) {
  const d = slide.data as {
    unit: string;
    body: string;
    emphasis: string;
    quote: string;
    quoteLabel: string;
  };
  const [runId, setRunId] = useState(0);
  const [count, setCount] = useState(calm ? 9 : 1);

  useEffect(() => {
    if (calm || step < 1) return;
    setCount(1);
    let n = 1;
    const id = setInterval(() => {
      n += 1;
      setCount(n);
      if (n >= 9) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, [runId, step, calm]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "r") setRunId((r) => r + 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <SlideFrame slide={slide} calm={calm}>
      <div className="grid h-full grid-cols-[560px_1fr] items-center gap-[70px]">
        <div className="relative flex items-center justify-center">
          <svg viewBox="0 0 400 400" className="absolute h-[440px] w-[440px] -rotate-90">
            <circle cx="200" cy="200" r="188" fill="none" stroke="#2C4560" strokeWidth="3" />
            <motion.circle
              cx="200"
              cy="200"
              r="188"
              fill="none"
              stroke="#E39A16"
              strokeWidth="3"
              strokeDasharray={2 * Math.PI * 188}
              initial={{ strokeDashoffset: 0 }}
              animate={{ strokeDashoffset: step >= 1 && !calm ? 2 * Math.PI * 188 : 0 }}
              transition={{ duration: 9, ease: "linear" }}
              key={runId}
            />
          </svg>
          <BigNumeral size={300}>{step >= 1 || calm ? (calm ? 9 : count) : 9}</BigNumeral>
        </div>

        <div className="pr-[40px]">
          <p className="font-serif text-[64px] leading-none font-bold text-white">{d.unit}</p>
          <Reveal show={step >= 2} className="mt-[34px]">
            <p className="font-sans text-[34px] leading-[1.35] text-gray-light">{d.body}</p>
            <p className="mt-[22px] font-serif text-[32px] italic text-gold">{d.emphasis}</p>
          </Reveal>
          <Reveal show={step >= 3} className="mt-[40px]">
            <div className="deck-card-dark border-l-[6px] border-l-gold p-[34px]">
              <p className="font-serif text-[30px] leading-[1.4] italic text-term-text">
                “{d.quote}”
              </p>
              <p className="mt-[20px] font-mono text-[15px] tracking-[0.18em] text-term-comment">
                {d.quoteLabel}
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </SlideFrame>
  );
}

/* ---------------------------------------------------------- 3 · the shift */

export function ShiftSlide({ slide, step, calm }: LayoutProps) {
  const d = slide.data as {
    verbs: { verb: string; tail: string; dark?: boolean }[];
    stats: { value: string; body: string; label: string }[];
  };
  return (
    <SlideFrame slide={slide} calm={calm} titleSize={60}>
      <div className="flex h-full flex-col gap-[42px]">
        <div className="flex items-stretch gap-[18px]">
          {d.verbs.map((v, i) => (
            <div key={v.verb} className="flex flex-1 items-center gap-[18px]">
              <motion.div
                className={`flex-1 border px-[26px] py-[22px] ${
                  v.dark ? "border-navy bg-navy text-white" : "border-line bg-white text-ink"
                }`}
                initial={calm ? false : { opacity: 0.25 }}
                animate={{ opacity: step >= 1 ? 1 : 0.35 }}
                transition={{ delay: step >= 1 ? i * 0.18 : 0, duration: 0.3 }}
              >
                <div className="font-sans text-[30px] font-bold tracking-[0.04em]">{v.verb}</div>
                <div
                  className={`font-serif text-[22px] italic ${v.dark ? "text-gold" : "text-gray-ink"}`}
                >
                  {v.tail}
                </div>
              </motion.div>
              {i < d.verbs.length - 1 ? (
                <Icon name="arrow-right" size={30} className="text-gold" />
              ) : null}
            </div>
          ))}
        </div>

        <div className="grid flex-1 grid-cols-4 gap-[22px]">
          {d.stats.map((s, i) => (
            <Reveal key={s.label} show={step >= 2} delay={i * 0.1}>
              <div className="deck-card flex h-full flex-col p-[28px]">
                <span className="font-serif text-[62px] leading-none font-bold text-gold">
                  {s.value}
                </span>
                <p className="mt-[16px] flex-1 font-sans text-[21px] leading-[1.35] text-ink">
                  {s.body}
                </p>
                <p className="mt-[16px] font-mono text-[13px] tracking-[0.14em] text-taupe">
                  {s.label}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </SlideFrame>
  );
}

/* ------------------------------------------------- 4 · real agent session */

export function TerminalListSlide({ slide, step, calm }: LayoutProps) {
  const d = slide.data as {
    terminalTitle: string;
    lines: { t: string; k?: string; note?: string }[];
    caption: string;
    listTitle: string;
    agents: string[];
    equation: string[];
    equationNote: string;
  };
  const texts = d.lines.map((l) => l.t);
  const typed = useTypedLines(texts, step >= 1 && !calm, 10);
  const visible = calm || step < 1 ? texts.length : typed.done;

  const lineClass = (k?: string) => {
    switch (k) {
      case "prompt":
        return "text-white";
      case "amber":
        return "text-gold";
      case "bold":
        return "font-bold text-white";
      case "plain":
        return "text-term-comment";
      default:
        return "text-term-text";
    }
  };

  return (
    <SlideFrame slide={slide} calm={calm} titleSize={58}>
      <div className="grid h-full grid-cols-[1.35fr_1fr] gap-[34px]">
        <div className="flex min-h-0 flex-col">
          <TerminalBody title={d.terminalTitle}>
            {d.lines.map((l, i) => {
              if (i > visible) return null;
              const text = i === visible ? typed.partial : l.t;
              return (
                <div key={i} className={`${lineClass(l.k)} whitespace-pre`}>
                  {text}
                  {l.note && i < visible ? (
                    <span className="ml-3 text-term-ok">✓ {l.note}</span>
                  ) : null}
                </div>
              );
            })}
          </TerminalBody>
          <p className="mt-[14px] font-mono text-[14px] tracking-[0.16em] text-taupe">
            {d.caption}
          </p>
        </div>

        <div className="flex min-h-0 flex-col gap-[24px]">
          <Reveal show={step >= 2}>
            <div className="deck-card p-[28px]">
              <p className="font-mono text-[16px] tracking-[0.18em] text-teal">{d.listTitle}</p>
              <ul className="mt-[18px] space-y-[10px]">
                {d.agents.map((a) => (
                  <li key={a} className="font-sans text-[23px] text-ink">
                    <span className="mr-3 text-gold">·</span>
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
          <Reveal show={step >= 3}>
            <div className="bg-sand p-[26px]">
              <p className="font-sans text-[26px] text-ink">
                <span className="font-mono text-[22px] font-bold">AN AGENT =</span>{" "}
                {d.equation.map((t, i) => (
                  <span key={t} className={i === d.equation.length - 1 ? "font-bold text-gold" : ""}>
                    {t}
                    {i < d.equation.length - 1 ? " + " : ""}
                  </span>
                ))}
              </p>
              <p className="mt-[14px] font-serif text-[21px] italic text-gray-ink">
                {d.equationNote}
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </SlideFrame>
  );
}

export function TerminalBody({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-terminal">
      <div className="flex items-center gap-3 bg-navy-card px-6 py-[13px]">
        <span className="h-[11px] w-[11px] rounded-full bg-term-error" />
        <span className="h-[11px] w-[11px] rounded-full bg-gold" />
        <span className="h-[11px] w-[11px] rounded-full bg-term-ok" />
        <span className="ml-4 font-mono text-[16px] text-term-comment">{title}</span>
      </div>
      <div className="no-scrollbar min-h-0 flex-1 overflow-auto px-7 py-6 font-mono text-[20px] leading-[1.6]">
        {children}
      </div>
    </div>
  );
}

/* ------------------------------------------------------- 5 · case files */

export function FourCardsSlide({ slide, step, calm }: LayoutProps) {
  const d = slide.data as {
    cards: { icon: string; date: string; tool: string; what: string; then: string }[];
    bottom: string;
  };
  return (
    <SlideFrame slide={slide} calm={calm}>
      <div className="flex h-full flex-col gap-[30px]">
        <div className="grid flex-1 grid-cols-4 gap-[22px]">
          {d.cards.map((c, i) => (
            <motion.div
              key={c.tool}
              className="deck-card-dark flex h-full flex-col p-[26px]"
              initial={calm ? false : { opacity: 0, y: -30, rotate: -2.5 }}
              animate={
                step >= i + 1
                  ? { opacity: 1, y: 0, rotate: 0 }
                  : { opacity: 0, y: -30, rotate: -2.5 }
              }
              transition={{ type: "spring", stiffness: 210, damping: 20 }}
            >
              <IconDisc name={c.icon} size={58} />
              <p className="mt-[20px] font-mono text-[15px] tracking-[0.16em] text-gold">
                {c.date} · {c.tool}
              </p>
              <p className="mt-[14px] flex-1 font-sans text-[24px] leading-[1.3] font-bold text-white">
                {c.what}
              </p>
              <p className="mt-[14px] font-serif text-[21px] italic text-gray-light">{c.then}</p>
            </motion.div>
          ))}
        </div>
        <Reveal show={step >= 5}>
          <p className="font-sans text-[30px] text-gray-light">
            Different tools. Same root cause:{" "}
            <span className="font-bold text-gold">
              the agent could do something nobody meant to allow.
            </span>
          </p>
        </Reveal>
      </div>
    </SlideFrame>
  );
}

/* ----------------------------------------------------- 6 · audience test */

export function PollSlide({ slide, step, calm }: LayoutProps) {
  const d = slide.data as {
    options: { icon: string; verdict: string; tone: string; action: string; hint: string }[];
    bottom: string;
  };
  return (
    <SlideFrame slide={slide} calm={calm}>
      <div className="flex h-full flex-col gap-[30px]">
        <div className="grid flex-1 grid-cols-4 gap-[22px]">
          {d.options.map((o, i) => (
            <Reveal key={o.action} show={step >= 1} delay={i * 0.08}>
              <div className="deck-card-dark flex h-full flex-col p-[26px]">
                <div className="flex items-start justify-between">
                  <IconDisc name={o.icon} size={62} tone="white" />
                  <motion.span
                    initial={false}
                    animate={
                      step >= i + 2 ? { scale: 1, opacity: 1 } : { scale: 1.5, opacity: 0 }
                    }
                    transition={{ type: "spring", stiffness: 420, damping: 14 }}
                  >
                    <Chip tone={o.tone as "ok" | "gold" | "deny"}>{o.verdict}</Chip>
                  </motion.span>
                </div>
                <p className="mt-[24px] font-sans text-[27px] leading-[1.25] font-bold text-white">
                  {o.action}
                </p>
                <p className="mt-[12px] flex-1 font-serif text-[21px] italic text-gray-light">
                  {o.hint}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal show={step >= 6}>
          <p className="font-sans text-[30px] text-gray-light">
            If you said “it depends” — good.{" "}
            <span className="font-bold text-gold">The next 20 rules define what it depends on.</span>
          </p>
        </Reveal>
      </div>
    </SlideFrame>
  );
}

/* ------------------------------------------------------ 7 · the five gates */

export function GatesSlide({ slide, step, calm, onGoto }: LayoutProps) {
  const d = slide.data as {
    gates: {
      numeral: string;
      icon: string;
      question: string;
      name: string;
      rules: string;
      slide: number;
    }[];
    line: string;
  };
  return (
    <SlideFrame slide={slide} calm={calm}>
      <div className="flex h-full flex-col gap-[34px]">
        <div className="grid flex-1 grid-cols-5 gap-[20px]">
          {d.gates.map((g, i) => (
            <motion.button
              key={g.numeral}
              type="button"
              onClick={() => onGoto?.(g.slide - 1)}
              className="deck-card flex h-full flex-col p-[26px] text-left transition-shadow hover:shadow-[var(--shadow-card-hover)]"
              initial={calm ? false : { opacity: 0, rotateY: -35 }}
              animate={{ opacity: step >= 1 ? 1 : 0, rotateY: step >= 1 ? 0 : -35 }}
              transition={{ delay: step >= 1 ? i * 0.12 : 0, duration: 0.4 }}
              aria-label={`Jump to ${g.name}`}
            >
              <div className="flex items-center justify-between">
                <IconDisc name={g.icon} size={62} />
                <span className="font-serif text-[46px] font-bold text-taupe-light">
                  {g.numeral}
                </span>
              </div>
              <p className="mt-[22px] flex-1 font-sans text-[25px] leading-[1.25] font-bold text-ink">
                {g.question}
              </p>
              <p className="font-serif text-[21px] italic text-teal">{g.name}</p>
              <p className="mt-[8px] font-mono text-[14px] tracking-[0.16em] text-taupe">
                {g.rules}
              </p>
            </motion.button>
          ))}
        </div>
        <p className="font-serif text-[26px] italic text-gray-ink">{d.line}</p>
      </div>
    </SlideFrame>
  );
}

export { Title };
