import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Eraser,
  Flashlight,
  Highlighter,
  LayoutGrid,
  Loader2,
  Maximize,
  MonitorPlay,
  RotateCcw,
  Square,
  SkipBack,
  Smartphone,
  X,
} from "lucide-react";
import { ACTS, EVENT, SPEAKER, type Act } from "@/config";
import { screens, slideLabel } from "@/content/screens";
import { sourcesFor } from "@/content/sources";
import separators from "@/content/separators.json";
import { pointer, usePointer } from "@/deck/pointer";
import { useDeck } from "@/deck/store";
import { ACT_COLORS, ACT_COLORS_ON_NAVY, actInfo, isPaper, stopLabel } from "@/deck/theme";
import { toggleFullscreen } from "@/deck/useFullscreen";
import opening from "@/content/opening.json";
import monogram from "@/assets/hs-monogram.png.asset.json";
import { DOWNLOAD_EVENT } from "@/deck/useKeyboard";
import { useDownloadPdf } from "@/components/kit";
import { MiniStage } from "./Stage";
import { ScreenRenderer } from "./ScreenRenderer";

const TALK_TITLE = opening.s0.title;
const actsInDeck = ACTS.filter((a) => screens.some((s) => s.act === a));
/** "Stop 02 · The shift" for numbered acts; other sections keep their own name. */
const actLabel = (act: Act) => {
  const info = actInfo(act);
  return info ? `${stopLabel(info.stop)} · ${info.name}` : act;
};
const sepQuestion = (n: number) => separators[String(n) as keyof typeof separators]?.question;

/** Progress bar segmented by act, each segment filled in its act colour. */
export function ProgressBar({ height = 3 }: { height?: number }) {
  const { index, screen } = useDeck();
  const track = isPaper(screen.id) ? "rgba(20, 22, 28, 0.08)" : "rgba(244, 242, 236, 0.1)";
  return (
    <div className="pointer-events-none absolute right-0 bottom-0 left-0 z-30 flex gap-[3px]" style={{ height }} aria-hidden>
      {actsInDeck.map((act) => {
        const members = screens.map((s, i) => ({ s, i })).filter(({ s }) => s.act === act);
        const done = members.filter(({ i }) => i <= index).length;
        return (
          <div key={act} className="h-full transition-colors duration-300" style={{ flex: members.length, background: track }}>
            <div
              className="h-full transition-[width] duration-500"
              style={{ width: `${(done / members.length) * 100}%`, background: ACT_COLORS[act] ?? "var(--own-fill)" }}
            />
          </div>
        );
      })}
    </div>
  );
}

export function ActLabel() {
  const { screen } = useDeck();
  // Paper slides carry their own act marker in the slide frame.
  if (isPaper(screen.id)) return null;
  return (
    <p className="act-label pointer-events-none absolute bottom-[12px] left-[16px] z-30 font-mono text-[11px] tracking-[0.14em] text-muted uppercase">
      {actLabel(screen.act)}
    </p>
  );
}

function useIdle(ms = 2000) {
  const [active, setActive] = useState(false);
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const wake = () => {
      setActive(true);
      clearTimeout(t);
      t = setTimeout(() => setActive(false), ms);
    };
    window.addEventListener("mousemove", wake);
    window.addEventListener("touchstart", wake);
    return () => {
      clearTimeout(t);
      window.removeEventListener("mousemove", wake);
      window.removeEventListener("touchstart", wake);
    };
  }, [ms]);
  return active;
}

function Btn({
  label,
  onClick,
  children,
  className = "",
  active,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
  /** Toggle buttons: pressed state is shown with a filled pill. */
  active?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={active}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`flex h-[36px] min-w-[36px] items-center justify-center rounded-full px-2 text-text transition-colors ${
        active
          ? "bg-[color-mix(in_oklab,var(--text)_18%,transparent)]"
          : "hover:bg-[color-mix(in_oklab,var(--text)_10%,transparent)]"
      } ${className}`}
    >
      {children}
    </button>
  );
}

/**
 * Deck controls. Floating (fullscreen): appears on mouse move, fades when idle.
 * Docked (windowed room footer): always visible; secondary buttons collapse on phones.
 */
export function ControlBar({ docked = false }: { docked?: boolean }) {
  const deck = useDeck();
  const idleVisible = useIdle(2000);
  const visible = docked || idleVisible;
  const { tool } = usePointer();
  const { download, busy } = useDownloadPdf();

  useEffect(() => {
    const onDl = () => void download();
    window.addEventListener(DOWNLOAD_EVENT, onDl);
    return () => window.removeEventListener(DOWNLOAD_EVENT, onDl);
  }, [download]);

  const secondary = docked ? "max-sm:hidden" : "";
  return (
    <div
      className={`glass z-40 flex items-center gap-1 rounded-full border border-line px-2 py-1 transition-opacity duration-300 ${
        docked ? "relative" : "absolute bottom-[18px] left-1/2 -translate-x-1/2"
      } ${visible ? "opacity-100" : "pointer-events-none opacity-0"}`}
      onClick={(e) => e.stopPropagation()}
    >
      <Btn label="Previous" onClick={deck.prev}>
        <ChevronLeft className="h-4 w-4" />
      </Btn>
      <span className={`max-w-[420px] min-w-[88px] truncate px-1 text-center font-mono text-[13px] text-muted tabular-nums max-sm:max-w-[150px] ${docked ? "max-2xl:max-w-[300px]" : ""}`}>
        {slideLabel(deck.index)}
      </span>
      <Btn label="Next" onClick={deck.next}>
        <ChevronRight className="h-4 w-4" />
      </Btn>
      <span className={`mx-1 h-5 w-px bg-line ${secondary}`} />
      <Btn label="Spotlight (L) · wheel or [ ] to resize" className={secondary} active={tool === "spotlight"} onClick={() => pointer.toggle("spotlight")}>
        <Flashlight className="h-4 w-4" />
      </Btn>
      <Btn label="Highlighter (H)" className={secondary} active={tool === "highlight"} onClick={() => pointer.toggle("highlight")}>
        <Highlighter className="h-4 w-4" style={tool === "highlight" ? { color: "#F2B33D" } : undefined} />
      </Btn>
      {tool === "highlight" ? (
        <Btn label="Clear highlights (C)" className={secondary} onClick={pointer.clearInk}>
          <Eraser className="h-4 w-4" />
        </Btn>
      ) : null}
      <span className={`mx-1 h-5 w-px bg-line ${secondary}`} />
      <Btn label="Overview (O)" className={secondary} onClick={() => deck.setOverlay(deck.overlay === "overview" ? null : "overview")}>
        <LayoutGrid className="h-4 w-4" />
      </Btn>
      <Btn label="Presenter (N)" className={secondary} onClick={() => window.open("/presenter", "ai-era-presenter", "width=1440,height=900")}>
        <MonitorPlay className="h-4 w-4" />
      </Btn>
      <Btn label="Replay screen (R)" className={secondary} onClick={deck.resetScreen}>
        <RotateCcw className="h-4 w-4" />
      </Btn>
      <Btn label="Blackout (B)" className={secondary} onClick={() => deck.setOverlay(deck.overlay === "black" ? null : "black")}>
        <Square className="h-4 w-4" />
      </Btn>
      <Btn label="Fullscreen (F)" onClick={toggleFullscreen}>
        <Maximize className="h-4 w-4" />
      </Btn>
      <Btn label="Restart deck" className={secondary} onClick={() => deck.goto(0)}>
        <SkipBack className="h-4 w-4" />
      </Btn>
      <Btn label="Download PDF (D)" className={secondary} onClick={() => void download()}>
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
      </Btn>
    </div>
  );
}

/* ---------- Windowed "stage room": header, footer, rotate hint ---------- */
const pad2 = (n: number) => String(n).padStart(2, "0");

export function RoomHeader() {
  const deck = useDeck();
  const info = actInfo(deck.screen.act);
  const dot = ACT_COLORS_ON_NAVY[deck.screen.act] ?? "var(--own)";
  return (
    <header
      className="room-header absolute inset-x-0 top-0 z-30 flex items-center justify-between gap-4 px-[var(--room-pad)]"
      style={{ height: "var(--room-top)" }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex min-w-0 items-center gap-3">
        <img src={monogram.url} alt="" className="h-[30px] w-[30px] shrink-0" />
        <div className="min-w-0 leading-tight">
          <p className="truncate font-display text-[15px] font-bold tracking-[-0.01em] text-text">{TALK_TITLE}</p>
          <p className="truncate font-mono text-[11px] tracking-[0.12em] text-muted uppercase max-sm:hidden">
            {EVENT.name} · {SPEAKER.name}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <span className="items-center gap-2 rounded-full border border-line px-3 py-1.5 font-mono text-[11px] tracking-[0.12em] text-muted uppercase max-md:hidden md:inline-flex">
          <span className="h-[7px] w-[7px] rounded-full transition-colors duration-500" style={{ background: dot }} />
          {info ? (
            <>
              <span style={{ color: dot }}>{stopLabel(info.stop)}</span>
              <span className="text-text">{info.name}</span>
            </>
          ) : (
            <span className="text-text">{deck.screen.act}</span>
          )}
        </span>
        <span className="font-mono text-[13px] text-muted tabular-nums">
          <span className="text-text">{pad2(deck.index)}</span> / {pad2(deck.total)}
        </span>
        <button
          type="button"
          onClick={toggleFullscreen}
          className="inline-flex items-center gap-2 rounded-full bg-text px-3.5 py-1.5 text-[13px] font-semibold text-[var(--stage-bg)] transition-transform hover:scale-[1.03]"
          title="Present fullscreen (F)"
        >
          <Maximize className="h-3.5 w-3.5" />
          <span className="max-sm:hidden">Present</span>
        </button>
      </div>
    </header>
  );
}

export function RoomFooter() {
  const { download, busy } = useDownloadPdf();
  return (
    <footer
      className="absolute inset-x-0 bottom-0 z-30 flex items-center justify-between gap-4 px-[var(--room-pad)]"
      style={{ height: "var(--room-bottom)" }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="min-w-0 flex-1 items-center gap-2 text-[12px] text-muted max-xl:hidden xl:flex">
        <div className="hidden items-center gap-2 min-[1600px]:flex">
        <span className="kbd">←</span>
        <span className="kbd">→</span>
        <span className="mr-2">slides</span>
        <span className="kbd">F</span>
        <span className="mr-2">fullscreen</span>
        <span className="kbd">L</span>
        <span className="mr-2">spotlight</span>
        <span className="kbd">H</span>
        <span className="mr-2">highlight</span>
        <span className="kbd">S</span>
        <span>sources</span>
        </div>
      </div>
      <div className="flex flex-1 justify-center xl:flex-none">
        <ControlBar docked />
      </div>
      <div className="flex-1 justify-end max-xl:hidden xl:flex">
        <button
          type="button"
          onClick={() => void download()}
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 font-mono text-[12px] tracking-[0.06em] text-text transition-colors hover:border-[var(--own)]"
        >
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
          Download PDF
        </button>
      </div>
    </footer>
  );
}

/** Portrait phones: a gentle nudge to rotate for a larger slide. */
export function RotateHint() {
  return (
    <div
      className="pointer-events-none absolute inset-x-0 z-20 hidden justify-center portrait:max-sm:flex"
      style={{ bottom: "calc(var(--room-bottom) + 20px)" }}
      aria-hidden
    >
      <span className="glass inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-[13px] text-muted">
        <Smartphone className="h-4 w-4 rotate-90" />
        Rotate your phone for a larger view
      </span>
    </div>
  );
}

export function Blackout() {
  const { overlay } = useDeck();
  if (overlay !== "black") return null;
  return <div className="absolute inset-0 z-50 bg-[var(--stage-bg)]" aria-label="Blackout" />;
}

export function SourceDrawer() {
  const deck = useDeck();
  if (deck.overlay !== "sources") return null;
  const list = sourcesFor(deck.screen.id);
  return (
    <aside
      className="absolute top-0 right-0 bottom-0 z-50 w-[min(520px,90vw)] overflow-y-auto border-l border-line bg-surface p-6"
      onClick={(e) => e.stopPropagation()}
      aria-label="Sources"
    >
      <div className="flex items-center justify-between">
        <p className="font-mono text-[12px] tracking-[0.14em] text-muted uppercase">Sources · {deck.screen.id}</p>
        <button aria-label="Close sources" onClick={() => deck.setOverlay(null)} className="text-muted hover:text-text">
          <X className="h-5 w-5" />
        </button>
      </div>
      {list.length === 0 ? (
        <p className="mt-6 text-[15px] text-muted">No sources on this screen.</p>
      ) : (
        <ul className="mt-6 space-y-5">
          {list.map((s) => (
            <li key={s.id} className="border-t border-line pt-4">
              <a href={s.url} target="_blank" rel="noopener noreferrer" className="font-display text-[18px] font-bold text-text hover:underline">
                {s.title}
              </a>
              <p className="mt-1 font-mono text-[12px] text-muted">
                {s.organisation} · {s.date}
              </p>
              {s.statistic || s.excerpt ? <p className="mt-2 text-[15px] text-text">{s.statistic ?? s.excerpt}</p> : null}
              <p className="mt-2 text-[13px] text-muted">Method: {s.method}</p>
              <p className="mt-1 text-[13px] text-muted">Caveat: {s.caveat}</p>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}

export function OverviewGrid() {
  const deck = useDeck();
  if (deck.overlay !== "overview") return null;
  return (
    <div className="absolute inset-0 z-50 overflow-y-auto bg-[#0b152b]/95 p-8 backdrop-blur-md" onClick={(e) => e.stopPropagation()}>
      <div className="mb-6 flex items-center justify-between">
        <p className="font-mono text-[12px] tracking-[0.14em] text-muted uppercase">Overview</p>
        <button aria-label="Close overview" onClick={() => deck.setOverlay(null)} className="text-muted hover:text-text">
          <X className="h-5 w-5" />
        </button>
      </div>
      {actsInDeck.map((act) => {
        // Act separator slides become the section header (click to jump to them).
        const sep = screens.findIndex((s) => s.act === act && s.separator);
        return (
          <section key={act} className="mb-8">
            {sep >= 0 ? (
              <button
                onClick={() => {
                  deck.goto(sep);
                  deck.setOverlay(null);
                }}
                className={`mb-3 flex items-baseline gap-3 border-b-2 pb-1 text-left ${sep === deck.index ? "border-[var(--accent)]" : "border-transparent"}`}
              >
                <span className="font-mono text-[12px] text-muted">{sep}</span>
                <span className="font-display text-[18px] font-bold text-text">{actLabel(act)}</span>
                <span className="text-[14px] text-muted">{sepQuestion(screens[sep]!.separator!)}</span>
              </button>
            ) : (
              <h3 className="mb-3 font-display text-[18px] font-bold text-text">{act}</h3>
            )}
            <div className="flex flex-wrap gap-4">
              {screens.map((s, i) =>
                s.act !== act || s.separator ? null : (
                  <button
                    key={s.id}
                    onClick={() => {
                      deck.goto(i);
                      deck.setOverlay(null);
                    }}
                    className={`overflow-hidden rounded-lg border bg-surface/60 text-left transition-[border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-[var(--accent)] ${i === deck.index ? "border-[var(--accent)]" : "border-line"}`}
                  >
                    <MiniStage width={240}>
                      <ScreenRenderer screen={s} choice={null} />
                    </MiniStage>
                    <p className="w-[240px] truncate px-2 py-1 font-mono text-[12px] text-muted">
                      {i} · {s.title}
                    </p>
                  </button>
                ),
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
