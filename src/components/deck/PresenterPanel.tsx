import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { POLL_IDS, TARGET_TOTAL_SEC, type PollId } from "@/config";
import { screens } from "@/content/screens";
import { sourcesFor } from "@/content/sources";
import { useDeck } from "@/deck/store";
import { addManual, clearManual, POLL_CONTENT, usePollCounts } from "@/lib/poll";
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

function useTimers(index: number) {
  const [running, setRunning] = useState(false);
  const [total, setTotal] = useState(0);
  const [onScreen, setOnScreen] = useState(0);
  const prevIndex = useRef(index);
  useEffect(() => {
    if (prevIndex.current !== index) {
      prevIndex.current = index;
      setOnScreen(0);
    }
  }, [index]);
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setTotal((t) => t + 1);
      setOnScreen((t) => t + 1);
    }, 1000);
    return () => clearInterval(id);
  }, [running]);
  return {
    running,
    total,
    onScreen,
    toggle: () => setRunning((r) => !r),
    reset: () => {
      setRunning(false);
      setTotal(0);
      setOnScreen(0);
    },
  };
}

function PollConsole({ poll }: { poll: PollId }) {
  const { counts, manual, online } = usePollCounts(poll);
  const reset = useServerFn(resetPoll);
  const doReset = async () => {
    let pin = readPin();
    if (!pin) {
      pin = window.prompt("Presenter PIN") ?? "";
      if (!pin) return;
    }
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
    <div className="rounded-lg border border-line p-3">
      <div className="flex items-center justify-between">
        <p className="font-mono text-[12px] tracking-[0.12em] text-muted uppercase">{poll}</p>
        <span className="font-mono text-[11px]" style={{ color: online ? "var(--own)" : "var(--validate)" }}>
          {online ? "LIVE" : "OFFLINE"}
        </span>
      </div>
      <p className="mt-1 truncate text-[13px] text-muted">{POLL_CONTENT[poll].question}</p>
      <div className="mt-2 flex gap-2">
        {[1, 2, 3].map((n) => (
          <button
            key={n}
            onClick={() => addManual(poll, n)}
            className="flex-1 rounded border border-line py-1 font-mono text-[14px] text-text hover:border-[var(--accent)]"
            title={`Add one manual vote to option ${n}`}
          >
            {n} · <span className="tabular-nums">{counts[n - 1]}</span>
            {manual[n - 1] ? <span className="text-muted"> (+{manual[n - 1]})</span> : null}
          </button>
        ))}
        <button onClick={() => void doReset()} className="rounded border border-line px-2 font-mono text-[12px] text-muted hover:text-[var(--fail)]">
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
  const remaining = deck.screen.durationSec - t.onScreen;
  const srcs = sourcesFor(deck.screen.id);

  return (
    <div className={`grid h-full gap-4 text-text ${compact ? "grid-cols-1" : "grid-cols-[1.4fr_1fr]"}`}>
      <div className="flex min-h-0 flex-col gap-4">
        <div className="flex items-center gap-3">
          <p className="font-mono text-[13px] tracking-[0.12em] text-muted uppercase">{deck.screen.act}</p>
          <p className="ml-auto font-mono text-[14px] tabular-nums">
            {deck.screen.id} · step {deck.step}/{deck.screen.steps}
          </p>
        </div>
        {!compact ? (
          <div className="overflow-hidden rounded-lg border border-line">
            <MiniStage width={640}>
              <ScreenRenderer screen={deck.screen} step={deck.step} choice={deck.choice} />
            </MiniStage>
          </div>
        ) : null}
        <div className="min-h-0 flex-1 overflow-y-auto rounded-lg border border-line p-4 text-[22px] leading-[1.5] whitespace-pre-wrap">
          {deck.screen.notes}
        </div>
      </div>

      <div className="flex min-h-0 flex-col gap-4 overflow-y-auto">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-line p-3">
            <p className="font-mono text-[11px] text-muted">SCREEN</p>
            <p className="font-display text-[40px] font-bold tabular-nums" style={{ color: paceColor(remaining) }}>
              {fmt(remaining)}
            </p>
          </div>
          <div className="rounded-lg border border-line p-3">
            <p className="font-mono text-[11px] text-muted">TOTAL / {fmt(TARGET_TOTAL_SEC)}</p>
            <p
              className="font-display text-[40px] font-bold tabular-nums"
              style={{ color: t.total > TARGET_TOTAL_SEC ? "var(--fail)" : "var(--text)" }}
            >
              {fmt(t.total)}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={t.toggle} className="flex flex-1 items-center justify-center gap-2 rounded border border-line py-2 font-mono text-[13px]">
            {t.running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {t.running ? "PAUSE" : "START"}
          </button>
          <button onClick={t.reset} className="flex items-center gap-2 rounded border border-line px-3 font-mono text-[13px]">
            <RotateCcw className="h-4 w-4" /> RESET
          </button>
          <button onClick={deck.prev} aria-label="Previous" className="rounded border border-line px-3">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button onClick={deck.next} aria-label="Next" className="rounded border border-line px-3">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div>
          <p className="mb-2 font-mono text-[11px] text-muted">NEXT</p>
          {nextScreen ? (
            <div className="overflow-hidden rounded-lg border border-line">
              <MiniStage width={compact ? 300 : 420}>
                <ScreenRenderer screen={nextScreen} step={0} choice={null} />
              </MiniStage>
              <p className="px-2 py-1 font-mono text-[12px] text-muted">
                {nextScreen.id} · {nextScreen.act}
              </p>
            </div>
          ) : (
            <p className="text-[14px] text-muted">End of deck</p>
          )}
        </div>

        <div className="space-y-2">
          <p className="font-mono text-[11px] text-muted">POLLS</p>
          {POLL_IDS.map((p) => (
            <PollConsole key={p} poll={p} />
          ))}
        </div>

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
