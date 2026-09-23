import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { slides } from "@/content/slides";
import { SECTIONS } from "@/content/types";
import { useDeck } from "@/deck/store";
import { Icon } from "./primitives";
import { MiniStage } from "./Stage";
import { SlideRenderer } from "./SlideRenderer";

/* ------------------------------------------------------------ auto-hide */

export function useAutoHide(delay = 2500) {
  const [visible, setVisible] = useState(true);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    const show = () => {
      setVisible(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setVisible(false), delay);
    };
    show();
    window.addEventListener("mousemove", show);
    return () => {
      window.removeEventListener("mousemove", show);
      if (timer.current) clearTimeout(timer.current);
    };
  }, [delay]);
  return visible;
}

/* --------------------------------------------------------- progress rail */

export function ProgressRail() {
  const { index, goto } = useDeck();
  const current = slides[index]?.section;
  return (
    <div className="absolute right-0 bottom-0 left-0 z-30 flex h-[4px]">
      {slides.map((s, i) => (
        <button
          key={s.id}
          type="button"
          title={`${SECTIONS.find((x) => x.id === s.section)?.label ?? ""} — slide ${s.id}`}
          aria-label={`Go to slide ${s.id}`}
          onClick={() => goto(i)}
          className={`h-full flex-1 transition-colors ${
            s.section === current ? "bg-gold" : "bg-navy-line hover:bg-taupe"
          } ${i === index ? "bg-white" : ""}`}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------ section indicator */

export function SectionIndicator() {
  const { slide } = useDeck();
  const [show, setShow] = useState(false);
  useEffect(() => {
    setShow(true);
    const id = setTimeout(() => setShow(false), 1800);
    return () => clearTimeout(id);
  }, [slide.id]);
  const label = SECTIONS.find((s) => s.id === slide.section)?.short ?? "";
  return (
    <motion.div
      className="pointer-events-none absolute top-[22px] right-[26px] z-30 font-mono text-[14px] tracking-[0.2em] text-taupe"
      animate={{ opacity: show ? 1 : 0 }}
      transition={{ duration: 0.4 }}
    >
      {label}
    </motion.div>
  );
}

/* ------------------------------------------------------------ control bar */

export function ControlBar({ onDownload }: { onDownload?: () => void }) {
  const deck = useDeck();
  const visible = useAutoHide();
  const [jump, setJump] = useState("");
  const [copied, setCopied] = useState(false);

  const btn =
    "flex h-[38px] min-w-[38px] items-center justify-center px-2 text-term-text hover:text-gold";

  return (
    <motion.div
      className="fixed bottom-[22px] left-1/2 z-40 -translate-x-1/2"
      animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 12 }}
      transition={{ duration: 0.25 }}
    >
      <div className="flex items-center gap-1 border border-navy-line bg-navy-card/95 px-3 py-[6px] shadow-lg backdrop-blur">
        <button className={btn} onClick={deck.prev} aria-label="Previous">
          <Icon name="chevron-left" size={22} />
        </button>
        <button className={btn} onClick={deck.next} aria-label="Next">
          <Icon name="chevron-right" size={22} />
        </button>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const n = Number(jump);
            if (n >= 1 && n <= deck.total) deck.goto(n - 1);
            setJump("");
          }}
        >
          <input
            value={jump}
            onChange={(e) => setJump(e.target.value.replace(/\D/g, ""))}
            placeholder={`${deck.index + 1} / ${deck.total}`}
            aria-label="Jump to slide"
            className="w-[86px] bg-transparent text-center font-mono text-[15px] text-term-text placeholder:text-term-comment focus:outline-none"
          />
        </form>
        <span className="mx-1 h-[22px] w-px bg-navy-line" />
        <button
          className={btn}
          onClick={() => deck.setOverlay(deck.overlay === "thumbs" ? null : "thumbs")}
          aria-label="Thumbnails"
        >
          <Icon name="gallery-horizontal-end" size={20} />
        </button>
        <button
          className={btn}
          onClick={() => deck.setOverlay(deck.overlay === "overview" ? null : "overview")}
          aria-label="Overview grid"
        >
          <Icon name="layout-grid" size={20} />
        </button>
        <button
          className={btn}
          onClick={() => {
            if (document.fullscreenElement) void document.exitFullscreen();
            else void document.documentElement.requestFullscreen();
          }}
          aria-label="Fullscreen"
        >
          <Icon name="maximize" size={20} />
        </button>
        <button
          className={`${btn} ${deck.laser ? "text-gold" : ""}`}
          onClick={() => deck.toggle("laser")}
          aria-label="Laser pointer"
        >
          <Icon name="mouse-pointer-2" size={20} />
        </button>
        <button
          className={btn}
          onClick={() => window.open("/presenter", "presenter", "width=1400,height=900")}
          aria-label="Presenter view"
        >
          <Icon name="presentation" size={20} />
        </button>
        <button
          className={btn}
          onClick={() => {
            void navigator.clipboard?.writeText(
              `${window.location.origin}/#/${deck.index + 1}`,
            );
            setCopied(true);
            setTimeout(() => setCopied(false), 1200);
          }}
          aria-label="Copy link to this slide"
        >
          <Icon name={copied ? "check" : "link"} size={20} />
        </button>
        {onDownload ? (
          <button className={btn} onClick={onDownload} aria-label="Download PDF">
            <Icon name="download" size={20} />
          </button>
        ) : null}
        <button className={btn} onClick={() => deck.setOverlay("help")} aria-label="Help">
          <Icon name="circle-help" size={20} />
        </button>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------- thumbnail drawer */

export function ThumbDrawer() {
  const deck = useDeck();
  if (deck.overlay !== "thumbs") return null;
  return (
    <div className="fixed right-0 bottom-[78px] left-0 z-40 flex gap-3 overflow-x-auto bg-navy/95 px-6 py-4">
      {slides.map((s, i) => (
        <button
          key={s.id}
          type="button"
          onClick={() => deck.goto(i)}
          className={`shrink-0 border-2 ${i === deck.index ? "border-gold" : "border-transparent"}`}
          aria-label={`Slide ${s.id}`}
        >
          <MiniStage width={220}>
            <SlideRenderer slide={s} step={s.steps} calm />
          </MiniStage>
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------- overlays */

const SHORTCUTS: [string, string][] = [
  ["→ / Space / PageDown / Enter", "Next step or slide"],
  ["← / Backspace / PageUp", "Previous"],
  ["Shift + →", "Skip remaining builds"],
  ["Home / End", "First / last slide"],
  ["number then Enter", "Jump to slide"],
  ["G or O", "Overview grid"],
  ["F", "Fullscreen"],
  ["P", "Presenter window"],
  ["B or .", "Black screen"],
  ["W", "White screen"],
  ["L", "Laser pointer"],
  ["S", "Spotlight"],
  ["Z", "Zoom 2×"],
  ["T", "Timer"],
  ["N", "Notes drawer"],
  ["?", "This help"],
  ["Esc", "Close overlay"],
];

export function HelpOverlay() {
  const deck = useDeck();
  if (deck.overlay !== "help") return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-terminal/95 p-10"
      role="dialog"
      aria-label="Keyboard shortcuts"
    >
      <div className="max-h-full w-full max-w-[900px] overflow-auto">
        <div className="flex items-center justify-between">
          <h2 className="font-sans text-[34px] font-bold text-white">Keyboard shortcuts</h2>
          <button
            onClick={() => deck.setOverlay(null)}
            className="text-term-text hover:text-gold"
            aria-label="Close help"
          >
            <Icon name="x" size={28} />
          </button>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-x-10 gap-y-2">
          {SHORTCUTS.map(([keys, desc]) => (
            <div key={keys} className="flex justify-between gap-6 border-b border-navy-line py-2">
              <span className="font-mono text-[15px] text-gold">{keys}</span>
              <span className="text-right font-sans text-[16px] text-term-text">{desc}</span>
            </div>
          ))}
        </div>
        <label className="mt-8 flex items-center gap-3 font-sans text-[18px] text-term-text">
          <input
            type="checkbox"
            checked={deck.calm}
            onChange={() => deck.toggle("calm")}
            className="h-5 w-5 accent-[#E39A16]"
          />
          Calm mode — turn off all non-essential motion
        </label>
        <p className="mt-6 font-mono text-[13px] tracking-[0.18em] text-term-comment">
          MADE FOR DEVOPSDAYS CAIRO 2026
        </p>
      </div>
    </div>
  );
}

export function BlankOverlay() {
  const { overlay, setOverlay } = useDeck();
  if (overlay !== "black" && overlay !== "white") return null;
  return (
    <div
      onClick={() => setOverlay(null)}
      className={`fixed inset-0 z-50 ${overlay === "black" ? "bg-black" : "bg-white"}`}
    />
  );
}

/* ------------------------------------------------------- laser / spotlight */

export function Pointer() {
  const { laser, spotlight } = useDeck();
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [trail, setTrail] = useState<{ x: number; y: number; id: number }[]>([]);

  useEffect(() => {
    if (!laser && !spotlight) return;
    let id = 0;
    const onMove = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
      if (laser) {
        id += 1;
        const point = { x: e.clientX, y: e.clientY, id };
        setTrail((t) => [...t.slice(-9), point]);
      }
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [laser, spotlight]);

  if (!laser && !spotlight) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-45">
      {spotlight ? (
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle 190px at ${pos.x}px ${pos.y}px, transparent 0%, transparent 60%, rgba(15,28,43,0.88) 100%)`,
          }}
        />
      ) : null}
      {laser ? (
        <>
          {trail.map((t, i) => (
            <span
              key={t.id}
              className="absolute rounded-full bg-gold"
              style={{
                left: t.x - 4,
                top: t.y - 4,
                width: 8,
                height: 8,
                opacity: (i + 1) / (trail.length * 2.2),
              }}
            />
          ))}
          <span
            className="absolute rounded-full bg-gold shadow-[0_0_24px_10px_rgba(227,154,22,0.55)]"
            style={{ left: pos.x - 7, top: pos.y - 7, width: 14, height: 14 }}
          />
        </>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------ notes drawer */

export function NotesDrawer() {
  const { notesOpen, slide } = useDeck();
  return (
    <AnimatePresence>
      {notesOpen ? (
        <motion.aside
          initial={{ y: 200, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 200, opacity: 0 }}
          className="fixed right-0 bottom-0 left-0 z-40 max-h-[38vh] overflow-auto border-t border-navy-line bg-navy px-8 py-5"
        >
          <p className="font-mono text-[13px] tracking-[0.2em] text-gold">
            CUE · {slide.notes.cue}
          </p>
          <p className="mt-3 font-sans text-[20px] leading-[1.45] text-term-text">
            {slide.notes.say}
          </p>
          {slide.notes.fact ? (
            <p className="mt-3 font-serif text-[17px] italic text-term-comment">
              {slide.notes.fact}
            </p>
          ) : null}
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
}

/* ---------------------------------------------------------------- a11y */

export function LiveRegion() {
  const { index, total } = useDeck();
  return (
    <div className="sr-only" aria-live="polite">
      Slide {index + 1} of {total}
    </div>
  );
}
