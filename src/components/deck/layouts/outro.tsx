import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import githubRepoQr from "@/assets/github-repo-qr.png.asset.json";
import { SPEAKER } from "@/content/types";
import { BigNumeral, Chip, IconDisc, Monogram, Reveal } from "../primitives";
import { SlideFrame, type LayoutProps } from "./frame";

const GITHUB_REPO_URL = "https://github.com/hanygheit/ai-agent-on-call";

/* ---------------------------------------------------------- 18 · timeline */

export function TimelineSlide({ slide, step, calm }: LayoutProps) {
  const d = slide.data as {
    badge: string;
    nodes: { time: string; icon: string; title: string; body: string; rules: string; dark?: boolean }[];
    band: string[];
  };
  const [clock, setClock] = useState(0);

  useEffect(() => {
    if (step < 1 || calm) {
      setClock(step >= 1 ? d.nodes.length : 0);
      return;
    }
    setClock(0);
    let n = 0;
    const id = setInterval(() => {
      n += 1;
      setClock(n);
      if (n >= d.nodes.length) clearInterval(id);
    }, 800);
    return () => clearInterval(id);
  }, [step, calm, d.nodes.length]);

  const currentTime = d.nodes[Math.max(0, Math.min(d.nodes.length - 1, clock - 1))]?.time ?? "03:07:00";

  return (
    <SlideFrame slide={slide} calm={calm} titleSize={56}>
      <div className="flex h-full flex-col gap-[26px]">
        <div className="absolute -top-[86px] right-0 flex items-center gap-4">
          <span className="font-mono text-[28px] tracking-[0.12em] text-gold">{currentTime}</span>
          <Chip tone="sand">{d.badge}</Chip>
        </div>

        <div className="relative min-h-0 flex-1">
          <div className="absolute top-[38px] right-[40px] left-[40px] h-[3px] bg-gold" />
          <div className="relative grid h-full grid-cols-5 gap-[20px]">
            {d.nodes.map((n, i) => (
              <motion.div
                key={n.time}
                className="flex h-full flex-col items-center"
                initial={calm ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: clock > i ? 1 : 0.25, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <IconDisc name={n.icon} size={76} tone={n.dark ? "navy" : "gold"} />
                <span className="mt-[14px] font-mono text-[20px] tracking-[0.1em] text-gray-ink">
                  {n.time}
                </span>
                <div
                  className={`mt-[16px] flex w-full flex-1 flex-col p-[22px] ${
                    n.dark ? "bg-navy text-white" : "deck-card"
                  }`}
                >
                  <span
                    className={`font-sans text-[25px] font-bold ${n.dark ? "text-white" : "text-ink"}`}
                  >
                    {n.title}
                  </span>
                  <span
                    className={`mt-[10px] flex-1 font-sans text-[20px] leading-[1.3] ${
                      n.dark ? "text-gray-light" : "text-gray-ink"
                    }`}
                  >
                    {n.body}
                  </span>
                  <span className="mt-[12px] font-mono text-[15px] tracking-[0.16em] text-gold">
                    {n.rules}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <Reveal show={step >= 2} className="flex shrink-0 items-center gap-[36px] bg-sand px-[30px] py-[20px]">
          {d.band.map((b, i) => (
            <span
              key={b}
              className={`font-sans text-[26px] ${i === 1 ? "font-bold text-gold" : "text-ink"}`}
            >
              {b}
            </span>
          ))}
        </Reveal>
      </div>
    </SlideFrame>
  );
}

/* ----------------------------------------------------------- 19 · gearbox */

export function GearboxSlide({ slide, step, calm }: LayoutProps) {
  const d = slide.data as {
    quote: string;
    quoteLabel: string;
    gears: { icon: string; name: string; body: string; unlock: string }[];
    label: string;
    line: string;
  };
  const [gear, setGear] = useState(2);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (["1", "2", "3", "4"].includes(e.key)) setGear(Number(e.key));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <SlideFrame slide={slide} calm={calm} titleSize={56}>
      <div className="flex h-full flex-col gap-[22px]">
        <p className="font-serif text-[27px] italic text-gray-ink">
          “{d.quote}”
          <span className="ml-4 font-mono text-[14px] tracking-[0.16em] not-italic text-taupe">
            {d.quoteLabel}
          </span>
        </p>

        {/* gear shifter */}
        <div className="flex shrink-0 items-center gap-4 bg-sand px-[24px] py-[16px]">
          <span className="font-mono text-[15px] tracking-[0.18em] text-teal">GEAR</span>
          <div className="relative flex flex-1 items-center">
            <div className="absolute right-0 left-0 h-[6px] bg-taupe-light" />
            {[1, 2, 3, 4].map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGear(g)}
                aria-label={`Select gear ${g}`}
                className="relative z-10 flex-1"
              >
                <motion.span
                  className={`mx-auto flex h-[40px] w-[40px] items-center justify-center rounded-full font-mono text-[19px] ${
                    gear === g ? "bg-gold text-navy" : "bg-white text-gray-ink"
                  }`}
                  animate={gear === g && !calm ? { scale: [1, 0.86, 1] } : { scale: 1 }}
                  transition={{ duration: 0.22 }}
                >
                  {g}
                </motion.span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-4 gap-[20px]">
          {d.gears.map((g, i) => {
            const on = gear === i + 1;
            return (
              <motion.div
                key={g.name}
                className={`flex h-full flex-col p-[24px] ${on ? "bg-navy" : "deck-card"}`}
                animate={{ y: on ? -8 : 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 18 }}
              >
                <IconDisc name={g.icon} size={62} tone={on ? "gold" : "gold"} />
                <p
                  className={`mt-[18px] font-sans text-[28px] font-bold ${on ? "text-white" : "text-ink"}`}
                >
                  GEAR {i + 1} · {g.name}
                </p>
                <p
                  className={`mt-[10px] flex-1 font-sans text-[21px] leading-[1.3] ${on ? "text-gray-light" : "text-gray-ink"}`}
                >
                  {g.body}
                </p>
                <p className="mt-[12px] font-mono text-[15px] leading-[1.3] tracking-[0.1em] text-gold">
                  {g.unlock}
                </p>
              </motion.div>
            );
          })}
        </div>

        <div className="shrink-0">
          <p className="font-mono text-[14px] tracking-[0.18em] text-taupe">{d.label}</p>
          <p className="mt-[8px] font-serif text-[22px] italic text-gray-ink">{d.line}</p>
        </div>
      </div>
    </SlideFrame>
  );
}

/* ------------------------------------------------------ 20 · offer letter */

export function OfferLetterSlide({ slide, step, calm }: LayoutProps) {
  const d = slide.data as {
    quote: string;
    quoteLabel: string;
    hook: string;
    line: string;
    sub: string;
    letterHeading: string;
    letterRole: string;
    rows: { label: string; value: string; tone?: string; strong?: boolean }[];
    signature: string;
    closing: string;
  };
  const [copied, setCopied] = useState(false);

  const yaml = () =>
    ["agent_policy:", ...d.rows.map((r) => `  ${r.label.toLowerCase()}: "${r.value}"`)].join("\n");

  return (
    <SlideFrame slide={slide} calm={calm} titleSize={54}>
      <div className="grid h-full grid-cols-[1fr_1.15fr] gap-[50px]">
        <div className="flex flex-col justify-center">
          <span className="font-serif text-[110px] leading-[0.6] text-gold">“</span>
          <p className="mt-[10px] font-serif text-[34px] leading-[1.3] italic text-ink">
            {d.quote}
          </p>
          <p className="mt-[16px] font-mono text-[15px] tracking-[0.16em] text-taupe">
            {d.quoteLabel}
          </p>
          <p className="mt-[34px] font-sans text-[32px] font-bold text-gold">{d.hook}</p>
          <p className="mt-[16px] font-sans text-[28px] leading-[1.3] font-bold text-ink">
            {d.line}
          </p>
          <p className="mt-[14px] font-sans text-[21px] text-gray-ink">{d.sub}</p>
          <button
            type="button"
            onClick={() => {
              void navigator.clipboard?.writeText(yaml());
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}
            className="mt-[26px] w-fit border border-line bg-white px-5 py-[9px] font-mono text-[16px] tracking-[0.14em] text-ink uppercase hover:bg-sand"
          >
            {copied ? "Copied agent-policy.yaml" : "Copy as agent-policy.yaml"}
          </button>
        </div>

        <div className="relative flex min-h-0 flex-col border-t-[5px] border-t-gold bg-white p-[34px] shadow-[var(--shadow-card)]">
          <div className="absolute top-[22px] right-[26px]">
            <Monogram size={44} />
          </div>
          <p className="font-mono text-[18px] tracking-[0.24em] text-teal">{d.letterHeading}</p>
          <p className="mt-[6px] font-serif text-[24px] italic text-gray-ink">{d.letterRole}</p>
          <div className="mt-[20px] flex min-h-0 flex-1 flex-col justify-between">
            {d.rows.map((r, i) => (
              <motion.div
                key={r.label}
                className="flex items-baseline gap-[18px] border-b border-line py-[9px]"
                initial={calm ? false : { opacity: 0, x: 14 }}
                animate={{ opacity: step >= 1 ? 1 : 0, x: 0 }}
                transition={{ delay: step >= 1 && !calm ? i * 0.09 : 0, duration: 0.25 }}
              >
                <span className="w-[210px] shrink-0 font-mono text-[15px] tracking-[0.16em] text-taupe">
                  {r.label}
                </span>
                <span
                  className={`font-sans text-[22px] ${
                    r.tone === "deny"
                      ? "font-bold text-deny"
                      : r.strong
                        ? "font-bold text-ink"
                        : "text-ink"
                  }`}
                >
                  {r.value}
                </span>
              </motion.div>
            ))}
          </div>

          <div className="mt-[20px] flex items-end justify-between">
            <div>
              <svg width="230" height="60" viewBox="0 0 230 60" aria-hidden="true">
                <motion.path
                  d="M8 44 C 40 6, 58 58, 84 28 S 128 4, 146 40 S 186 20, 222 26"
                  fill="none"
                  stroke="#132038"
                  strokeWidth="3"
                  strokeLinecap="round"
                  initial={calm ? false : { pathLength: 0 }}
                  animate={{ pathLength: step >= 2 ? 1 : 0 }}
                  transition={{ duration: 1.1, ease: "easeInOut" }}
                />
                <line x1="0" y1="54" x2="230" y2="54" stroke="#E6E0D5" strokeWidth="2" />
              </svg>
              <p className="mt-[6px] font-mono text-[15px] tracking-[0.16em] text-taupe">
                {d.signature}
              </p>
            </div>
            <motion.span
              className="rotate-[-8deg] border-[3px] border-gold px-5 py-[8px] font-mono text-[18px] tracking-[0.18em] text-gold"
              initial={calm ? false : { scale: 2, opacity: 0 }}
              animate={step >= 2 ? { scale: 1, opacity: 1 } : { scale: 2, opacity: 0 }}
              transition={{ delay: step >= 2 && !calm ? 1.1 : 0, type: "spring", stiffness: 300, damping: 14 }}
            >
              APPROVED BY A HUMAN
            </motion.span>
          </div>
          <p className="mt-[14px] font-serif text-[20px] italic text-gray-ink">{d.closing}</p>
        </div>
      </div>
    </SlideFrame>
  );
}

/* -------------------------------------------------------------- 21 · close */

export function CloseSlide({ slide, step, calm }: LayoutProps) {
  const d = slide.data as {
    lead: string;
    takeaways: { n: string; title: string; body: string }[];
    final: string;
    thanks: string;
  };
  const words = slide.title.split(" ");

  return (
    <div className="relative h-full w-full bg-gold-bg">
      <div className="relative z-10 flex h-full flex-col px-[84px] pt-[70px] pb-[150px]">
        <div className="flex items-center gap-5">
          <span className="block h-[3px] w-[38px] bg-ink" />
          <span className="font-mono text-[20px] tracking-[0.3em] text-ink uppercase">
            {slide.kicker}
          </span>
        </div>

        <div className="mt-[30px] grid min-h-0 flex-1 grid-cols-[430px_1fr] gap-[54px]">
          <div className="relative flex items-center justify-center">
            <svg viewBox="0 0 400 400" className="absolute h-[380px] w-[380px]">
              <circle cx="200" cy="200" r="186" fill="none" stroke="#8A5E06" strokeWidth="4" />
            </svg>
            <BigNumeral size={280} className="text-gold-deep">
              9
            </BigNumeral>
          </div>

          <div className="flex min-h-0 flex-col justify-center">
            <p className="font-sans text-[28px] text-ink">{d.lead}</p>
            <h1 className="mt-[14px] font-serif text-[56px] leading-[1.15] font-bold italic text-ink">
              {words.map((w, i) => (
                <motion.span
                  key={`${w}-${i}`}
                  className="mr-[14px] inline-block"
                  initial={calm ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: step >= 1 ? 1 : 0, y: step >= 1 ? 0 : 12 }}
                  transition={{ delay: step >= 1 && !calm ? i * 0.07 : 0, duration: 0.25 }}
                >
                  {w}
                </motion.span>
              ))}
            </h1>

            <div className="mt-[34px] grid grid-cols-3 gap-[22px]">
              {d.takeaways.map((t, i) => (
                <Reveal key={t.n} show={step >= 2} delay={i * 0.12}>
                  <div className="border-t-[3px] border-t-gold-deep pt-[14px]">
                    <span className="font-serif text-[46px] leading-none font-bold text-gold-deep">
                      {t.n}
                    </span>
                    <p className="mt-[10px] font-sans text-[24px] leading-[1.25] font-bold text-ink">
                      {t.title}
                    </p>
                    <p className="mt-[8px] font-sans text-[19px] leading-[1.3] text-gold-deep">
                      {t.body}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal show={step >= 3} className="mt-[34px]">
              <p className="font-sans text-[34px] font-bold text-ink">{d.final}</p>
              <p className="mt-[8px] font-serif text-[26px] italic text-gold-deep">{d.thanks}</p>
            </Reveal>
          </div>
        </div>
      </div>

      <Reveal
        show={step >= 3}
        className="absolute right-0 bottom-0 left-0 flex items-center gap-6 bg-navy px-[84px] py-[18px]"
      >
        <Monogram size={46} />
        <span className="flex-1">
          <span className="block font-sans text-[22px] font-bold text-white">{SPEAKER.name}</span>
          <span className="block font-sans text-[17px] text-gray-light">{SPEAKER.role}</span>
        </span>
        <div className="flex items-end gap-6">
          <div className="flex items-center gap-5">
            <div className="flex flex-col items-end gap-[4px] text-right">
              <span className="font-mono text-[14px] tracking-[0.14em] text-gold uppercase">
                THE STARTER REPO · SLIDES + HOOKS + TESTS
              </span>
              <a
                href={GITHUB_REPO_URL}
                target="_blank"
                rel="noopener"
                className="font-mono text-[18px] font-bold text-white"
              >
                github.com/hanygheit/ai-agent-on-call
              </a>
              <span className="font-sans text-[15px] text-gray-light">Scan, fork it, run it →</span>
            </div>
            <a
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noopener"
              aria-label="Open the GitHub repo hanygheit/ai-agent-on-call"
              className="shrink-0 rounded-[4px] bg-white p-2"
            >
              <img
                src={githubRepoQr.url}
                alt="QR code to the GitHub repo hanygheit/ai-agent-on-call"
                className="h-[86px] w-[86px] object-contain"
              />
            </a>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
