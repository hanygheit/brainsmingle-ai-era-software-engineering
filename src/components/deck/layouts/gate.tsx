import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Icon, IconDisc, Reveal } from "../primitives";
import { SlideFrame, type LayoutProps } from "./frame";

interface Rule {
  n: string;
  icon: string;
  title: string;
  tagline: string;
  monday: string;
}

interface GateData {
  question: string;
  rules: Rule[];
  glitch?: boolean;
  killSwitchOnRule?: string;
  scenario: {
    label: string;
    situation: string;
    right: string;
    wrong: string;
    lesson: string;
  };
}

export function GateSlide({ slide, step, calm }: LayoutProps) {
  const d = slide.data as GateData;
  const [open, setOpen] = useState<string | null>(null);
  const [killed, setKilled] = useState(false);
  const [quarantined, setQuarantined] = useState(false);

  useEffect(() => {
    if (!d.glitch || step < 6) return;
    const id = setTimeout(() => setQuarantined(true), 400);
    return () => clearTimeout(id);
  }, [d.glitch, step]);

  useEffect(() => {
    if (!killed) return;
    const id = setTimeout(() => setKilled(false), 1000);
    return () => clearTimeout(id);
  }, [killed]);

  return (
    <SlideFrame slide={slide} calm={calm} showHeader={false}>
      <div className="grid h-full grid-cols-[1fr_1.12fr] gap-[54px] pt-[8px]">
        {/* left column */}
        <div className="flex min-h-0 flex-col">
          <div className="flex items-center gap-5">
            <span className="block h-[3px] w-[38px] bg-gold" />
            <span className="font-mono text-[20px] tracking-[0.3em] text-teal uppercase">
              {slide.kicker}
            </span>
          </div>
          <h1 className="mt-[28px] font-sans text-[52px] leading-[1.1] font-bold text-ink">
            {slide.title}
          </h1>
          <p className="mt-[8px] font-serif text-[27px] italic text-gold">{d.question}</p>

          <div className="mt-[30px] bg-navy p-[32px]">
            <p className="font-mono text-[16px] tracking-[0.2em] text-gold">{d.scenario.label}</p>
            <p className="mt-[16px] font-sans text-[26px] leading-[1.3] font-bold text-white">
              {d.glitch ? (
                <span
                  className={
                    quarantined ? "" : step >= 6 && !calm ? "animate-pulse text-term-error" : ""
                  }
                >
                  {d.scenario.situation}
                  {quarantined ? (
                    <span className="ml-3 inline-block bg-deny px-3 py-[2px] font-mono text-[15px] tracking-[0.16em] text-white">
                      QUARANTINED
                    </span>
                  ) : null}
                </span>
              ) : (
                d.scenario.situation
              )}
            </p>

            <Reveal show={step >= 5} className="mt-[22px] flex gap-4">
              <span className="mt-[3px] flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-ok text-white">
                <Icon name="check" size={18} />
              </span>
              <span className="font-sans text-[22px] leading-[1.35] text-term-text">
                {d.scenario.right}
              </span>
            </Reveal>
            <Reveal show={step >= 6} className="mt-[16px] flex gap-4">
              <span className="mt-[3px] flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-deny text-white">
                <Icon name="x" size={18} />
              </span>
              <span className="font-sans text-[22px] leading-[1.35] text-term-text">
                {d.scenario.wrong}
              </span>
            </Reveal>
            <Reveal show={step >= 7} className="mt-[22px] border-t border-navy-line pt-[20px]">
              <p className="font-serif text-[21px] leading-[1.4] italic text-gold">
                {d.scenario.lesson}
              </p>
            </Reveal>
          </div>
        </div>

        {/* right column: rules */}
        <div className="flex min-h-0 flex-col justify-between gap-[18px]">
          {d.rules.map((r, i) => (
            <motion.div
              key={r.n}
              className="relative"
              initial={calm ? false : { opacity: 0, x: 40 }}
              animate={step >= i + 1 ? { opacity: 1, x: 0 } : { opacity: 0, x: 40 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              <button
                type="button"
                onClick={() => setOpen(open === r.n ? null : r.n)}
                className="deck-card flex w-full items-center gap-[24px] p-[24px] text-left transition-transform hover:-translate-y-[3px] hover:shadow-[var(--shadow-card-hover)]"
                aria-label={`Rule ${r.n}: ${r.title}`}
              >
                <IconDisc name={r.icon} size={68} />
                <span className="flex-1">
                  <span className="block font-sans text-[32px] leading-[1.15] font-bold text-ink">
                    {r.title}
                  </span>
                  <span className="mt-[6px] block font-sans text-[21px] text-gray-ink">
                    {r.tagline}
                  </span>
                </span>
                <span className="font-serif text-[58px] leading-none font-bold text-taupe-light">
                  {r.n}
                </span>
              </button>

              {d.killSwitchOnRule === r.n ? (
                <button
                  type="button"
                  onClick={() => setKilled(true)}
                  className="absolute right-[18px] -bottom-[10px] bg-deny px-4 py-[4px] font-mono text-[14px] tracking-[0.2em] text-white"
                >
                  STOP
                </button>
              ) : null}

              <AnimatePresence>
                {open === r.n ? (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="absolute top-full right-0 left-0 z-20 mt-[6px] border border-gold bg-white p-[20px] shadow-[var(--shadow-card-hover)]"
                  >
                    <p className="font-mono text-[15px] tracking-[0.2em] text-gold">
                      TRY THIS MONDAY
                    </p>
                    <p className="mt-[8px] font-sans text-[22px] text-ink">{r.monday}</p>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>

      {killed ? (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-navy/85">
          <span className="font-mono text-[54px] tracking-[0.2em] text-deny">
            KILL SWITCH ENGAGED
          </span>
        </div>
      ) : null}
    </SlideFrame>
  );
}
