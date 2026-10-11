import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { POLL_IDS, TARGET_TOTAL_SEC, type PollId } from "@/config";
import { closeTotalSec, QA_INDEX, screens, slideLabel, talkTotalSec, TOTAL_SCREENS } from "@/content/screens";
import { sourcesFor } from "@/content/sources";
import { useDeck } from "@/deck/store";
import { addManual, clearManual, POLL_CONTENT, POLL_SCREEN, usePollCounts } from "@/lib/poll";
import { resetPoll } from "@/lib/presenter.functions";
import { pdfInfo, uploadPdf } from "@/lib/export-pdf.functions";
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

/** Talk timer (slides 1..Q&A), separate close timer (after Q&A), per-screen timer. Starts when you leave the lobby. */
function useTimers(index: number) {
  const [running, setRunning] = useState(false);
  const [total, setTotal] = useState(0);
  const [close, setClose] = useState(0);
  const [onScreen, setOnScreen] = useState(0);
  const prevIndex = useRef(index);
  const idx = useRef(index);
  idx.current = index;
  useEffect(() => {
    if (prevIndex.current !== index) {
      if (prevIndex.current === 0 && index > 0) setRunning(true);
      prevIndex.current = index;
      setOnScreen(0);
    }
  }, [index]);
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      const i = idx.current;
      if (i >= 1 && i <= QA_INDEX) setTotal((t) => t + 1);
      if (i > QA_INDEX) setClose((t) => t + 1);
      if (i >= 1) setOnScreen((t) => t + 1);
    }, 1000);
    return () => clearInterval(id);
  }, [running]);
  return {
    running,
    total,
    close,
    onScreen,
    toggle: () => setRunning((r) => !r),
    reset: () => {
      setRunning(false);
      setTotal(0);
      setClose(0);
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
  const holds = deck.index === QA_INDEX;
  const rawRemaining = deck.screen.durationSec - t.onScreen;
  const remaining = holds ? Math.max(0, rawRemaining) : rawRemaining;
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
          <div className="overflow-hidden rounded-lg border border-line">
            <MiniStage width={640}>
              <ScreenRenderer screen={deck.screen} choice={deck.choice} />
            </MiniStage>
          </div>
        ) : null}
        <div className="min-h-0 flex-1 overflow-y-auto rounded-lg border border-line p-4 text-[22px] leading-[1.5] whitespace-pre-wrap">
          {deck.screen.id === POLL_SCREEN["s7-interview"] ? <p className="mb-3 font-mono text-[18px] text-validate">Press 1/2/3 to reveal answers</p> : null}
          <Notes text={deck.screen.notes} />
        </div>
      </div>

      <div className="flex min-h-0 flex-col gap-4 overflow-y-auto">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-line p-3">
            <p className="font-mono text-[11px] text-muted">SCREEN</p>
            <p className="font-display text-[40px] font-bold tabular-nums" style={{ color: holds ? "var(--text)" : paceColor(remaining) }}>
              {untimed ? "—" : fmt(remaining)}
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
            <p className="font-mono text-[11px] text-muted">Slides 1–{QA_INDEX} plan: {fmt(talkTotalSec())}</p>
          </div>
          <div className="col-span-2 rounded-lg border border-line p-3">
            <p className="font-mono text-[11px] text-muted">CLOSE / {fmt(closeTotalSec())} (slides {QA_INDEX + 1}–{TOTAL_SCREENS - 1})</p>
            <p className="font-display text-[28px] font-bold tabular-nums" style={{ color: t.close > closeTotalSec() ? "var(--fail)" : "var(--text)" }}>
              {fmt(t.close)}
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
          {POLL_IDS.map((p) => (
            <PollConsole key={p} poll={p} />
          ))}
        </div>

        <PdfUpload />

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

function PdfUpload() {
  const info = useServerFn(pdfInfo);
  const upload = useServerFn(uploadPdf);
  const [state, setState] = useState<{ stored: boolean; uploadedAt?: string | null; pages?: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const refresh = () => void info().then(setState).catch(() => setState(null));
  useEffect(refresh, []); // eslint-disable-line react-hooks/exhaustive-deps
  const onFile = async (file: File) => {
    let pin = readPin();
    if (!pin) {
      pin = window.prompt("Presenter PIN") ?? "";
      if (!pin) return;
    }
    setBusy(true);
    try {
      const buf = new Uint8Array(await file.arrayBuffer());
      let bin = "";
      for (let i = 0; i < buf.length; i += 0x8000) bin += String.fromCharCode(...buf.subarray(i, i + 0x8000));
      const r = await upload({ data: { pin, base64: btoa(bin) } });
      if (!r.ok) {
        toast.error(r.error);
        return;
      }
      savePin(pin);
      toast.success(`PDF uploaded · ${r.pages} pages`);
      refresh();
    } catch {
      toast.error("Upload failed. Try again.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="rounded-lg border border-line p-3">
      <div className="flex items-center justify-between">
        <p className="font-mono text-[12px] tracking-[0.12em] text-muted uppercase">PDF</p>
        <button
          onClick={() => input.current?.click()}
          disabled={busy}
          className="rounded border border-line px-2 py-1 font-mono text-[12px] text-text hover:border-[var(--accent)]"
        >
          {busy ? "Uploading…" : "Upload PDF"}
        </button>
        <input
          ref={input}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            e.target.value = "";
            if (f) void onFile(f);
          }}
        />
      </div>
      <p className="mt-1 text-[13px] text-muted">
        {state?.stored
          ? `Uploaded ${state.uploadedAt ? new Date(state.uploadedAt).toLocaleString() : ""} · ${state.pages ?? "?"} pages`
          : "No PDF stored yet"}
      </p>
    </div>
  );
}
