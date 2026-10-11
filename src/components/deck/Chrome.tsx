import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  LayoutGrid,
  Loader2,
  Maximize,
  MonitorPlay,
  RotateCcw,
  Square,
  SkipBack,
  X,
} from "lucide-react";
import { ACTS } from "@/config";
import { screens, slideLabel } from "@/content/screens";
import { sourcesFor } from "@/content/sources";
import separators from "@/content/separators.json";
import { useDeck } from "@/deck/store";
import { isPaper } from "@/deck/theme";
import { DOWNLOAD_EVENT } from "@/deck/useKeyboard";
import { useDownloadPdf } from "@/components/kit";
import { MiniStage } from "./Stage";
import { ScreenRenderer } from "./ScreenRenderer";

const actsInDeck = ACTS.filter((a) => screens.some((s) => s.act === a));
const sepQuestion = (n: number) => separators[String(n) as keyof typeof separators]?.question;

/** 3 px progress bar segmented by act. */
export function ProgressBar() {
  const { index } = useDeck();
  return (
    <div className="pointer-events-none absolute right-0 bottom-0 left-0 z-30 flex h-[3px] gap-[3px]" aria-hidden>
      {actsInDeck.map((act) => {
        const members = screens.map((s, i) => ({ s, i })).filter(({ s }) => s.act === act);
        const done = members.filter(({ i }) => i <= index).length;
        return (
          <div key={act} className="h-full bg-line" style={{ flex: members.length }}>
            <div
              className="h-full bg-[var(--accent)] transition-[width] duration-300"
              style={{ width: `${(done / members.length) * 100}%` }}
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
      {screen.act}
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

function Btn({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="flex h-[36px] min-w-[36px] items-center justify-center rounded-full px-2 text-text hover:bg-line"
    >
      {children}
    </button>
  );
}

export function ControlBar() {
  const deck = useDeck();
  const visible = useIdle(2000);
  const { download, busy } = useDownloadPdf();

  useEffect(() => {
    const onDl = () => void download();
    window.addEventListener(DOWNLOAD_EVENT, onDl);
    return () => window.removeEventListener(DOWNLOAD_EVENT, onDl);
  }, [download]);

  return (
    <div
      className={`absolute bottom-[18px] left-1/2 z-40 flex -translate-x-1/2 items-center gap-1 rounded-full border border-line bg-surface/95 px-2 py-1 transition-opacity duration-300 ${
        visible ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
      onClick={(e) => e.stopPropagation()}
    >
      <Btn label="Previous" onClick={deck.prev}>
        <ChevronLeft className="h-4 w-4" />
      </Btn>
      <span className="max-w-[420px] min-w-[88px] truncate px-1 text-center font-mono text-[13px] text-muted tabular-nums">
        {slideLabel(deck.index)}
      </span>
      <Btn label="Next" onClick={deck.next}>
        <ChevronRight className="h-4 w-4" />
      </Btn>
      <span className="mx-1 h-5 w-px bg-line" />
      <Btn label="Overview (O)" onClick={() => deck.setOverlay(deck.overlay === "overview" ? null : "overview")}>
        <LayoutGrid className="h-4 w-4" />
      </Btn>
      <Btn label="Presenter (N)" onClick={() => window.open("/presenter", "ai-era-presenter", "width=1440,height=900")}>
        <MonitorPlay className="h-4 w-4" />
      </Btn>
      <Btn label="Replay screen (R)" onClick={deck.resetScreen}>
        <RotateCcw className="h-4 w-4" />
      </Btn>
      <Btn label="Blackout (B)" onClick={() => deck.setOverlay(deck.overlay === "black" ? null : "black")}>
        <Square className="h-4 w-4" />
      </Btn>
      <Btn
        label="Fullscreen (F)"
        onClick={() =>
          document.fullscreenElement
            ? void document.exitFullscreen()
            : void document.documentElement.requestFullscreen?.()
        }
      >
        <Maximize className="h-4 w-4" />
      </Btn>
      <Btn label="Restart deck" onClick={() => deck.goto(0)}>
        <SkipBack className="h-4 w-4" />
      </Btn>
      <Btn label="Download PDF (D)" onClick={() => void download()}>
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
      </Btn>
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
    <div className="absolute inset-0 z-50 overflow-y-auto bg-bg p-8" onClick={(e) => e.stopPropagation()}>
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
                <span className="font-display text-[18px] font-bold text-text">{act}</span>
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
                    className={`overflow-hidden rounded-md border text-left ${i === deck.index ? "border-[var(--accent)]" : "border-line"}`}
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
