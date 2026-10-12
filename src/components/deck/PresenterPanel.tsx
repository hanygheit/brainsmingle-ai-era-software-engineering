import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { PDF_PAGE_COUNT, POLL_IDS, QA_SEC, TARGET_TOTAL_SEC, type PollId } from "@/config";
import { CLOSE_INDEX, closeTotalSec, QA_INDEX, screens, slideLabel, talkTotalSec, TOTAL_SCREENS } from "@/content/screens";
import { sourcesFor } from "@/content/sources";
import { useDeck } from "@/deck/store";
import { addManual, clearManual, POLL_CONTENT, usePollCounts, usePollState } from "@/lib/poll";
import { setPollOpen } from "@/lib/poll-state.functions";
import { resetPoll } from "@/lib/presenter.functions";
import { readPin, savePin } from "@/lib/presenter-pin";
import { MiniStage } from "./Stage";
import { ScreenRenderer } from "./ScreenRenderer";

export function fmt(sec: number) {
  const sign = sec < 0 ? "−" : "";
  const a = Math.abs(Math.trunc(sec));
  return `${sign}${String(Math.floor(a / 60)).padStart(2, "0")}:${String(a % 60).padStart(2, "0")}`;
}

/** Countdown colour: neutral → amber at 0 → red at +30 s. */
export function paceColor(remaining: number) {
  if (remaining <= -30) return "var(--fail)";
  if (remaining <= 0) return "var(--validate)";
  return "var(--text)";
}

/**
 * Talk timer (slides 1..CLOSE_INDEX − 1), close timer (the closing slides), per-screen timer, and the
 * Q&A timer: once the final slide's own time is up, its seconds count as Q&A instead of close.
 * Starts when you leave the lobby.
 */
function useTimers(index: number) {
  const [running, setRunning] = useState(false);
  const [total, setTotal] = useState(0);
  const [close, setClose] = useState(0);
  const [qa, setQa] = useState(0);
  const [onScreen, setOnScreen] = useState(0);
  const prevIndex = useRef(index);
  const idx = useRef(index);
  const onScreenRef = useRef(0);
  idx.current = index;
  useEffect(() => {
    if (prevIndex.current !== index) {
      if (prevIndex.current === 0 && index > 0) setRunning(true);
      prevIndex.current = index;
      onScreenRef.current = 0;
      setOnScreen(0);
    }
  }, [index]);
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      const i = idx.current;
      if (i < 1) return;
      const inQa = i === QA_INDEX && onScreenRef.current >= screens[i]!.durationSec;
      if (i < CLOSE_INDEX) setTotal((t) => t + 1);
      else if (inQa) setQa((t) => t + 1);
      else setClose((t) => t + 1);
      onScreenRef.current += 1;
      setOnScreen(onScreenRef.current);
    }, 1000);
    return () => clearInterval(id);
  }, [running]);
  return {
    running,
    total,
    close,
    qa,
    onScreen,
    toggle: () => setRunning((r) => !r),
    reset: () => {
      setRunning(false);
      setTotal(0);
      setClose(0);
      setQa(0);
      onScreenRef.current = 0;
      setOnScreen(0);
    },
  };
}

/** Notes with **bold** key lines rendered larger. */
function Notes({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
        part.startsWith("**") ? (
          <strong key={i} className="font-display text-[28px] font-bold text-text">
            {part.slice(2, -2)}
          </strong>
        ) : (
          <span key={i} className="text-muted">{part}</span>
        ),
      )}
    </>
  );
}

/** Presenter PIN from this session, or asked once (saved after the server accepts it). */
function askPin() {
  const pin = readPin() ?? window.prompt("Presenter PIN") ?? "";
  return pin || null;
}

function PollConsoles() {
  const { state, setState } = usePollState(5000);
  const toggle = useServerFn(setPollOpen);
  const onToggle = async (poll: PollId, open: boolean) => {
    const pin = askPin();
    if (!pin) return;
    const r = await toggle({ data: { pin, poll, open } });
    if (!r.ok) {
      toast.error(r.error);
      return;
    }
    savePin(pin);
    setState(r.state);
    toast.success(`${poll} ${open ? "open" : "closed"}`);
  };
  return (
    <>
      {POLL_IDS.map((p) => (
        <PollConsole key={p} poll={p} open={state ? state[p].open : null} onToggle={(o) => void onToggle(p, o)} />
      ))}
    </>
  );
}

function PollConsole({ poll, open, onToggle }: { poll: PollId; open: boolean | null; onToggle: (open: boolean) => void }) {
  const { counts, manual, online } = usePollCounts(poll);
  const reset = useServerFn(resetPoll);
  const doReset = async () => {
    if (!window.confirm(`Delete every vote in ${poll}?`)) return;
    const pin = askPin();
    if (!pin) return;
    const r = await reset({ data: { pin, poll } });
    if (!r.ok) {
      toast.error(r.error);
      return;
    }
    savePin(pin);
    clearManual(poll);
    toast.success(`${poll} reset`);
  };
  return (
    <div className="rounded-xl border border-line bg-surface/70 p-3">
      <div className="flex items-center justify-between">
        <p className="font-mono text-[12px] tracking-[0.12em] text-muted uppercase">{poll}</p>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px]" style={{ color: online ? "var(--own)" : "var(--validate)" }}>
            {online ? "LIVE" : "OFFLINE"}
          </span>
          <button
            onClick={() => open !== null && onToggle(!open)}
            disabled={open === null}
            aria-label={open ? `Close voting for ${poll}` : `Open voting for ${poll}`}
            className="rounded-full border px-2 py-[1px] font-mono text-[11px] transition-colors disabled:opacity-50"
            style={{ borderColor: open ? "var(--own)" : "var(--validate)", color: open ? "var(--own)" : "var(--validate)" }}
            title={open ? "Voting is open — click to close" : "Voting is closed — click to open"}
          >
            {open === null ? "…" : open ? "OPEN · close" : "CLOSED · open"}
          </button>
        </div>
      </div>
      <p className="mt-1 truncate text-[13px] text-muted">{POLL_CONTENT[poll].question}</p>
      <div className="mt-2 flex gap-2">
        {POLL_CONTENT[poll].options.map((_, i) => i + 1).map((n) => (
          <button
            key={n}
            onClick={() => addManual(poll, n)}
            className="flex-1 rounded-lg border border-line bg-surface/70 transition-colors py-1 font-mono text-[14px] text-text hover:border-[var(--accent)]"
            title={`Add one manual vote to option ${n}`}
          >
            {n} · <span className="tabular-nums">{counts[n - 1]}</span>
            {manual[n - 1] ? <span className="text-muted"> (+{manual[n - 1]})</span> : null}
          </button>
        ))}
        <button onClick={() => void doReset()} aria-label={`Reset votes for ${poll}`} title={`Delete every vote in ${poll} (PIN)`} className="rounded-lg border border-line bg-surface/70 transition-colors hover:border-[var(--accent)] px-2 font-mono text-[12px] text-muted hover:text-[var(--fail)]">
          RESET
        </button>
      </div>
    </div>
  );
}

export function PresenterPanel({ compact = false }: { compact?: boolean }) {
  const deck = useDeck();
  const t = useTimers(deck.index);
  const nextScreen = screens[deck.index + 1];
  // The final slide holds for Q&A: its countdown stops at 0 (no red), then the Q&A countdown runs.
  const holds = deck.index === QA_INDEX;
  const rawRemaining = deck.screen.durationSec - t.onScreen;
  const remaining = holds ? Math.max(0, rawRemaining) : rawRemaining;
  const qaShown = t.qa > 0 || (holds && rawRemaining <= 0);
  const qaLeft = Math.max(0, QA_SEC - t.qa);
  const untimed = deck.index === 0;
  const srcs = sourcesFor(deck.screen.id);

  return (
    <div className={`grid h-full gap-4 text-text ${compact ? "grid-cols-1" : "grid-cols-[1.4fr_1fr]"}`}>
      <div className="flex min-h-0 flex-col gap-4">
        <div className="flex items-center gap-3">
          <p className="font-mono text-[13px] tracking-[0.12em] text-muted uppercase">{deck.screen.act}</p>
          <p className="ml-auto font-mono text-[14px] tabular-nums">
            {slideLabel(deck.index)}
          </p>
        </div>
        {!compact ? (
          <div className="overflow-hidden rounded-xl border border-line bg-surface/70">
            <MiniStage width={640}>
              <ScreenRenderer screen={deck.screen} choice={deck.choice} />
            </MiniStage>
          </div>
        ) : null}
        <div className="min-h-0 flex-1 overflow-y-auto rounded-xl border border-line bg-surface/70 p-4 text-[22px] leading-[1.5] whitespace-pre-wrap">
          <Notes text={deck.screen.notes} />
        </div>
      </div>

      <div className="flex min-h-0 flex-col gap-4 overflow-y-auto">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-line bg-surface/70 p-3">
            <p className="font-mono text-[11px] text-muted">SCREEN</p>
            <p className="font-display text-[40px] font-bold tabular-nums" style={{ color: holds ? "var(--text)" : paceColor(remaining) }}>
              {untimed ? "—" : fmt(remaining)}
            </p>
          </div>
          <div className="rounded-xl border border-line bg-surface/70 p-3">
            <p className="font-mono text-[11px] text-muted">TOTAL / {fmt(TARGET_TOTAL_SEC)}</p>
            <p
              className="font-display text-[40px] font-bold tabular-nums"
              style={{ color: t.total > TARGET_TOTAL_SEC ? "var(--fail)" : "var(--text)" }}
            >
              {fmt(t.total)}
            </p>
            <p className="font-mono text-[11px] text-muted">Slides 1–{CLOSE_INDEX - 1} plan: {fmt(talkTotalSec())}</p>
          </div>
          <div className={`rounded-xl border border-line bg-surface/70 p-3 ${qaShown ? "" : "col-span-2"}`}>
            <p className="font-mono text-[11px] text-muted">CLOSE / {fmt(closeTotalSec())} (slides {CLOSE_INDEX}–{TOTAL_SCREENS - 1})</p>
            <p className="font-display text-[28px] font-bold tabular-nums" style={{ color: t.close > closeTotalSec() ? "var(--fail)" : "var(--text)" }}>
              {fmt(t.close)}
            </p>
          </div>
          {qaShown ? (
            <div className="rounded-xl border border-[var(--own)] bg-surface/70 p-3">
              <p className="font-mono text-[11px] text-muted">Q&amp;A {fmt(QA_SEC)}</p>
              <p className="font-display text-[28px] font-bold tabular-nums" style={{ color: qaLeft === 0 ? "var(--validate)" : "var(--text)" }}>
                {fmt(qaLeft)}
              </p>
            </div>
          ) : null}
        </div>
        <div className="flex gap-2">
          <button onClick={t.toggle} className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-line bg-surface/70 transition-colors hover:border-[var(--accent)] py-2 font-mono text-[13px]">
            {t.running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {t.running ? "PAUSE" : "START"}
          </button>
          <button onClick={t.reset} className="flex items-center gap-2 rounded-lg border border-line bg-surface/70 transition-colors hover:border-[var(--accent)] px-3 font-mono text-[13px]">
            <RotateCcw className="h-4 w-4" /> RESET
          </button>
          <button onClick={deck.prev} aria-label="Previous" className="rounded-lg border border-line bg-surface/70 transition-colors hover:border-[var(--accent)] px-3">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button onClick={deck.next} aria-label="Next" className="rounded-lg border border-line bg-surface/70 transition-colors hover:border-[var(--accent)] px-3">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div>
          <p className="mb-2 font-mono text-[11px] text-muted">NEXT</p>
          {nextScreen ? (
            <div className="overflow-hidden rounded-xl border border-line bg-surface/70">
              <MiniStage width={compact ? 300 : 420}>
                <ScreenRenderer screen={nextScreen} choice={null} />
              </MiniStage>
              <p className="px-2 py-1 font-mono text-[12px] text-muted">
                {deck.index + 1} · {nextScreen.title}
              </p>
            </div>
          ) : (
            <p className="text-[14px] text-muted">End of deck</p>
          )}
        </div>

        <div className="space-y-2">
          <p className="font-mono text-[11px] text-muted">POLLS</p>
          <PollConsoles />
        </div>

        <PdfStatus />

        <div>
          <p className="mb-1 font-mono text-[11px] text-muted">SOURCES</p>
          {srcs.length ? (
            <ul className="space-y-1 text-[13px]">
              {srcs.map((s) => (
                <li key={s.id}>
                  {s.title} <span className="text-muted">· {s.organisation}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[13px] text-muted">None for this screen.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function PdfStatus() {
  return (
    <div className="rounded-xl border border-line bg-surface/70 p-3">
      <p className="font-mono text-[12px] tracking-[0.12em] text-muted uppercase">PDF</p>
      <p className="mt-1 text-[13px] text-muted">Included in this release · {PDF_PAGE_COUNT} pages</p>
    </div>
  );
}
