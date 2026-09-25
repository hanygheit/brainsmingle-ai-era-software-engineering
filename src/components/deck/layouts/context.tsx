import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { KIT_URL } from "@/content/types";
import { Chip, Icon, Reveal } from "../primitives";
import { useTypedLines } from "../Typewriter";
import { TerminalBody } from "./intro";
import { SlideFrame, type LayoutProps } from "./frame";

function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        void navigator.clipboard?.writeText(text);
        setDone(true);
        setTimeout(() => setDone(false), 1400);
      }}
      className="inline-flex items-center gap-2 border border-line bg-white px-4 py-[6px] font-mono text-[15px] tracking-[0.14em] text-ink uppercase hover:bg-sand"
    >
      <Icon name={done ? "check" : "copy"} size={16} />
      {done ? "Copied" : label}
    </button>
  );
}

/* ----------------------------------------------------- 10 · the repo tree */

export function RepoTreeSlide({ slide, step, calm }: LayoutProps) {
  const d = slide.data as {
    treeTitle: string;
    tree: { text: string; comment?: string; kind?: string; tag?: string }[];
    excerptTitle: string;
    excerpt: string;
    chips: { tag: string; label: string; body: string }[];
  };
  const [active, setActive] = useState<string | null>(null);

  const tagColor = (tag?: string) => {
    if (!tag || active !== tag) return "";
    if (tag === "shared") return "bg-gold/25";
    if (tag === "personal") return "bg-gray-light/20";
    return "bg-teal/25";
  };

  return (
    <SlideFrame slide={slide} calm={calm} titleSize={58}>
      <div className="flex h-full flex-col gap-[22px]">
        <div className="grid min-h-0 flex-1 grid-cols-[1.05fr_1fr] gap-[30px]">
          <TerminalBody title={d.treeTitle}>
            {d.tree.map((l, i) => (
              <motion.div
                key={l.text}
                className={`whitespace-pre ${tagColor(l.tag)}`}
                initial={calm ? false : { opacity: 0, x: -10 }}
                animate={{ opacity: step >= 1 ? 1 : 0, x: 0 }}
                transition={{ delay: step >= 1 && !calm ? i * 0.05 : 0, duration: 0.25 }}
              >
                <span className={l.kind === "root" ? "font-bold text-white" : "text-term-text"}>
                  {l.text}
                </span>
                {l.comment ? <span className="text-term-comment">  # {l.comment}</span> : null}
              </motion.div>
            ))}
          </TerminalBody>

          <Reveal show={step >= 2} className="flex min-h-0">
            <div className="deck-card flex min-h-0 w-full flex-col border-t-[4px] border-t-gold p-[26px]">
              <div className="flex items-center justify-between">
                <p className="font-mono text-[16px] tracking-[0.18em] text-teal">
                  {d.excerptTitle}
                </p>
                <CopyButton text={d.excerpt} />
              </div>
              <pre className="no-scrollbar mt-[18px] min-h-0 flex-1 overflow-auto font-mono text-[19px] leading-[1.55] whitespace-pre-wrap text-ink">
                {d.excerpt.split("\n").map((line) => (
                  <span
                    key={line}
                    className={`block ${line.startsWith("## Never") ? "font-bold text-deny" : line.startsWith("##") ? "font-bold text-ink" : ""}`}
                  >
                    {line}
                  </span>
                ))}
              </pre>
            </div>
          </Reveal>
        </div>

        <Reveal show={step >= 3} className="grid shrink-0 grid-cols-3 gap-[18px]">
          {d.chips.map((c) => (
            <button
              key={c.tag}
              type="button"
              onMouseEnter={() => setActive(c.tag)}
              onMouseLeave={() => setActive(null)}
              className="bg-sand p-[18px] text-left"
            >
              <span className="font-mono text-[15px] tracking-[0.2em] text-teal">{c.label}</span>
              <span className="mt-[6px] block font-sans text-[20px] text-ink">{c.body}</span>
            </button>
          ))}
        </Reveal>
      </div>
    </SlideFrame>
  );
}

/* ------------------------------------------------------- 11 · hook demo */

export function HookDemoSlide({ slide, step, calm }: LayoutProps) {
  const d = slide.data as {
    terminalTitle: string;
    lines: { t: string; k?: string; stamp?: string; step: number }[];
    caption: string;
    legend: { key: string; icon: string; tone: string; title: string; sub: string; body: string }[];
    audit: string[];
  };
  const [dialog, setDialog] = useState(false);

  useEffect(() => {
    if (step !== 2 || calm) return;
    setDialog(true);
    const id = setTimeout(() => setDialog(false), 1500);
    return () => clearTimeout(id);
  }, [step, calm]);

  const visible = d.lines.filter((l) => l.step <= step);
  const texts = visible.map((l) => l.t);
  const typed = useTypedLines(texts, !calm, 8);
  const shown = calm ? texts.length : Math.max(typed.done, texts.length - 3);

  const stampTone: Record<string, string> = {
    allowed: "text-term-ok",
    ask: "text-gold",
    deny: "text-term-error",
  };
  const stampText: Record<string, string> = {
    allowed: "✓ allowed",
    ask: "▲ ASK",
    deny: "✕ DENY",
  };
  const legendActive: Record<number, string> = { 1: "allow", 2: "ask", 3: "ask", 4: "deny", 5: "log" };

  const lineClass = (k?: string) => {
    switch (k) {
      case "prompt":
        return "text-white";
      case "amber":
        return "text-gold";
      case "bold":
        return "font-bold text-white";
      case "comment":
        return "text-term-comment";
      case "error":
        return "text-term-error";
      case "plain":
        return "text-term-string";
      default:
        return "text-term-text";
    }
  };

  return (
    <SlideFrame slide={slide} calm={calm} titleSize={58}>
      <div className="grid h-full grid-cols-[1.4fr_1fr] gap-[30px]">
        <div className="relative flex min-h-0 flex-col">
          <motion.div
            className="flex min-h-0 flex-1 flex-col"
            animate={step === 4 && !calm ? { boxShadow: ["0 0 0 0 #B5443A", "0 0 0 6px #B5443A", "0 0 0 0 #B5443A"] } : {}}
            transition={{ duration: 0.6 }}
          >
            <TerminalBody title={d.terminalTitle}>
              {visible.map((l, i) => (
                <div key={`${l.t}-${i}`} className={`whitespace-pre ${lineClass(l.k)}`}>
                  {i <= shown ? l.t : ""}
                  {l.stamp && i < shown + 1 ? (
                    <motion.span
                      className={`ml-4 font-bold ${stampTone[l.stamp]}`}
                      initial={calm ? false : { scale: 1.6, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 15 }}
                    >
                      {stampText[l.stamp]}
                    </motion.span>
                  ) : null}
                </div>
              ))}
              {step >= 5 ? (
                <motion.div
                  className="mt-[18px] border-t border-navy-line pt-[12px]"
                  initial={calm ? false : { y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                >
                  {d.audit.map((a) => (
                    <div key={a} className="truncate text-[16px] text-term-comment">
                      {a}
                    </div>
                  ))}
                </motion.div>
              ) : null}
            </TerminalBody>
          </motion.div>
          <p className="mt-[12px] font-mono text-[13px] tracking-[0.14em] text-taupe">
            {d.caption}
          </p>

          {dialog ? (
            <div className="absolute top-1/2 left-1/2 z-30 -translate-x-1/2 -translate-y-1/2 border border-gold bg-white p-[26px] shadow-[var(--shadow-card-hover)]">
              <p className="font-sans text-[24px] font-bold text-ink">Approve rollback?</p>
              <p className="mt-2 font-mono text-[16px] text-gray-ink">
                kubectl rollout undo deploy/checkout-api
              </p>
              <div className="mt-[16px] flex gap-3">
                <Chip tone="ok">Approve</Chip>
                <Chip tone="deny">Deny</Chip>
              </div>
            </div>
          ) : null}
        </div>

        <div className="grid min-h-0 grid-rows-4 gap-[16px]">
          {d.legend.map((l) => {
            const on = legendActive[step] === l.key;
            const tone: Record<string, string> = {
              ok: "border-l-ok",
              gold: "border-l-gold",
              deny: "border-l-deny",
              navy: "border-l-navy",
            };
            return (
              <motion.div
                key={l.key}
                className={`deck-card flex items-center gap-[20px] border-l-[6px] p-[20px] ${tone[l.tone]}`}
                animate={{ opacity: on || step === 0 ? 1 : 0.55, scale: on ? 1.015 : 1 }}
                transition={{ duration: 0.25 }}
              >
                <Icon
                  name={l.icon}
                  size={34}
                  className={
                    l.tone === "ok"
                      ? "text-ok"
                      : l.tone === "gold"
                        ? "text-gold"
                        : l.tone === "deny"
                          ? "text-deny"
                          : "text-navy"
                  }
                />
                <span className="flex-1">
                  <span className="block font-sans text-[26px] font-bold text-ink">
                    {l.title}
                    <span className="ml-3 font-sans text-[19px] font-normal text-gray-ink">
                      {l.sub}
                    </span>
                  </span>
                  <span className="block font-serif text-[19px] italic text-gray-ink">
                    {l.body}
                  </span>
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </SlideFrame>
  );
}

/* --------------------------------------------------------- 12 · two files */

function CodeBlock({
  code,
  highlight,
  lang,
}: {
  code: string;
  highlight: number[];
  lang: string;
}) {
  const lines = code.split("\n");
  const token = (line: string) => {
    if (lang === "bash" && line.trimStart().startsWith("#"))
      return <span className="text-term-comment">{line}</span>;
    return (
      <span>
        {line.split(/(".*?"|'.*?')/g).map((part, i) =>
          part.startsWith('"') || part.startsWith("'") ? (
            <span key={i} className="text-term-string">
              {part}
            </span>
          ) : (
            <span key={i} className="text-term-text">
              {part}
            </span>
          ),
        )}
      </span>
    );
  };
  const any = highlight.length > 0;
  return (
    <pre className="no-scrollbar min-h-0 flex-1 overflow-auto px-6 py-5 font-mono text-[16px] leading-[1.5]">
      {lines.map((l, i) => {
        const on = highlight.includes(i);
        return (
          <div
            key={i}
            className={`flex ${any && !on ? "opacity-35" : "opacity-100"} transition-opacity`}
          >
            <span className={`mr-4 w-[4px] shrink-0 ${on ? "bg-gold" : "bg-transparent"}`} />
            <span className="min-w-0 flex-1 pl-[4ch] -indent-[4ch] break-all whitespace-pre-wrap">
              {token(l)}
            </span>
          </div>
        );
      })}
    </pre>
  );
}

export function TwoCodeSlide({ slide, step, calm }: LayoutProps) {
  const d = slide.data as {
    left: { title: string; lang: string; code: string; highlight: Record<string, number[]> };
    right: { title: string; lang: string; code: string; highlight: Record<string, number[]> };
    captions: string[];
  };
  const hl = (panel: typeof d.left) => panel.highlight[String(step)] ?? [];

  return (
    <SlideFrame slide={slide} calm={calm} titleSize={56}>
      <div className="flex h-full flex-col gap-[20px]">
        <div className="grid min-h-0 flex-1 grid-cols-2 gap-[26px]">
          {[d.left, d.right].map((panel) => (
            <div key={panel.title} className="flex min-h-0 flex-col overflow-hidden bg-terminal">
              <div className="flex items-center justify-between bg-navy-card px-6 py-[12px]">
                <span className="font-mono text-[16px] text-term-comment">{panel.title}</span>
                <CopyButton text={panel.code} />
              </div>
              <CodeBlock code={panel.code} highlight={hl(panel)} lang={panel.lang} />
            </div>
          ))}
        </div>
        <div className="flex shrink-0 items-center justify-between">
          <p className="font-mono text-[15px] tracking-[0.14em] text-taupe">{d.captions[0]}</p>
          <a
            href={KIT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gold px-6 py-[10px] font-mono text-[16px] tracking-[0.16em] text-navy uppercase"
          >
            Get the kit
          </a>
        </div>
      </div>
    </SlideFrame>
  );
}

/* ------------------------------------------------------ 13 · six more hooks */

export function SixCardsSlide({ slide, step, calm }: LayoutProps) {
  const d = slide.data as {
    cards: {
      icon: string;
      file: string;
      event: string;
      body: string;
      rule: string;
      back: string;
    }[];
    quote: string;
    quoteAfter: string;
    caveat: string;
  };
  const [flipped, setFlipped] = useState<string | null>(null);

  return (
    <SlideFrame slide={slide} calm={calm} titleSize={54}>
      <div className="flex h-full flex-col gap-[22px]">
        <div className="grid min-h-0 flex-1 grid-cols-3 grid-rows-2 gap-[18px]">
          {d.cards.map((c, i) => (
            <motion.button
              key={c.file}
              type="button"
              onClick={() => setFlipped(flipped === c.file ? null : c.file)}
              className="deck-card relative flex h-full flex-col p-[22px] text-left"
              initial={calm ? false : { opacity: 0, y: 30, rotate: -3 }}
              animate={step >= 1 ? { opacity: 1, y: 0, rotate: 0 } : { opacity: 0, y: 30 }}
              transition={{ delay: step >= 1 && !calm ? i * 0.08 : 0, duration: 0.3 }}
            >
              {flipped === c.file ? (
                <pre className="no-scrollbar m-0 flex-1 overflow-auto bg-terminal p-[16px] font-mono text-[16px] leading-[1.5] whitespace-pre-wrap text-term-text">
                  {c.back}
                </pre>
              ) : (
                <>
                  <div className="flex items-center gap-[14px]">
                    <Icon name={c.icon} size={30} className="text-gold" />
                    <span className="font-mono text-[21px] font-bold text-ink">{c.file}</span>
                  </div>
                  <span className="mt-[12px] inline-block w-fit bg-sand px-3 py-[3px] font-mono text-[14px] tracking-[0.12em] text-teal">
                    {c.event}
                  </span>
                  <p className="mt-[14px] flex-1 font-sans text-[21px] leading-[1.3] text-ink">
                    {c.body}
                  </p>
                  <span className="font-mono text-[15px] tracking-[0.16em] text-taupe">
                    {c.rule}
                  </span>
                </>
              )}
            </motion.button>
          ))}
        </div>

        <Reveal show={step >= 2} className="shrink-0 bg-sand px-[28px] py-[20px]">
          <p className="font-serif text-[24px] italic text-ink">
            {d.quote} <span className="font-sans font-bold not-italic text-gold">{d.quoteAfter}</span>
          </p>
          <p className="mt-[8px] font-sans text-[20px] text-gray-ink">{d.caveat}</p>
        </Reveal>
      </div>
    </SlideFrame>
  );
}
