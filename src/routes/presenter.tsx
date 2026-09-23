import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { pollAdmin, verifyPin } from "@/lib/presenter.functions";
import { readPin, savePin, usePresenterPin } from "@/lib/presenter-pin";
import { POLL_SESSION, usePoll } from "@/lib/poll";
import { MiniStage } from "@/components/deck/Stage";
import { SlideRenderer } from "@/components/deck/SlideRenderer";
import { fmt, useStopwatch } from "@/components/deck/Timers";
import { Icon } from "@/components/deck/primitives";
import { slides } from "@/content/slides";
import { SECTIONS, TOTAL_SLOT_SEC } from "@/content/types";
import { DeckProvider, useDeck } from "@/deck/store";
import { useKeyboard } from "@/deck/useKeyboard";

export const Route = createFileRoute("/presenter")({
  head: () => ({
    meta: [
      { title: "Presenter view — Before You Put an AI Agent on Call" },
      {
        name: "description",
        content: "Speaker notes, pace bar and next-slide preview for the DevOpsDays Cairo 2026 talk.",
      },
      { property: "og:title", content: "Presenter view" },
      {
        property: "og:description",
        content: "Speaker notes and pacing for Before You Put an AI Agent on Call.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PresenterRoute,
});

function PresenterRoute() {
  const pin = usePresenterPin();
  const [checked, setChecked] = useState(false);
  const [needsPin, setNeedsPin] = useState(true);
  const [value, setValue] = useState("");
  const [err, setErr] = useState("");
  const check = useServerFn(verifyPin);

  useEffect(() => {
    void check({ data: { pin: pin ?? "" } }).then((r) => {
      setNeedsPin(r.configured && !r.ok);
      setChecked(true);
    });
  }, [pin, check]);

  if (!checked) return <main className="h-screen bg-terminal" />;
  if (needsPin) {
    return (
      <main className="flex h-screen items-center justify-center bg-terminal">
        <form
          className="w-[340px] border border-navy-line bg-navy-card p-6"
          onSubmit={async (e) => {
            e.preventDefault();
            const r = await check({ data: { pin: value } });
            if (r.ok) savePin(value);
            else setErr("Wrong PIN.");
          }}
        >
          <p className="font-mono text-[13px] tracking-[0.2em] text-gold">PRESENTER VIEW</p>
          <label htmlFor="pin" className="mt-3 block font-sans text-[18px] font-bold text-white">
            Enter presenter PIN
          </label>
          <input
            id="pin"
            type="password"
            inputMode="numeric"
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="mt-3 w-full border border-navy-line bg-terminal px-3 py-2 font-mono text-[18px] text-white"
          />
          {err ? <p className="mt-2 font-mono text-[13px] text-deny">{err}</p> : null}
          <button className="mt-4 w-full bg-gold py-2 font-mono text-[14px] font-bold text-navy">UNLOCK</button>
        </form>
      </main>
    );
  }
  return (
    <DeckProvider isPresenter>
      <PresenterView />
    </DeckProvider>
  );
}

function PollControls() {
  const { open, tally } = usePoll();
  const admin = useServerFn(pollAdmin);
  const total = Object.values(tally).reduce((a, q) => a + q.allow + q.depends + q.block, 0);
  const act = async (action: "reset" | "open" | "close") => {
    if (action === "reset" && !window.confirm("Delete all poll votes?")) return;
    const r = await admin({ data: { pin: readPin() ?? "", session: POLL_SESSION, action } });
    if (!r.ok) toast.error(r.error);
    else toast.success(action === "reset" ? "Poll reset" : `Poll ${action === "open" ? "opened" : "closed"}`);
  };
  return (
    <div className="flex items-center gap-2 border border-navy-line bg-navy-card px-3 py-2">
      <span className="font-mono text-[13px] tracking-[0.16em] text-term-comment">
        POLL · {total} VOTES
      </span>
      <button
        onClick={() => void act(open ? "close" : "open")}
        className={`ml-auto px-3 py-1 font-mono text-[13px] ${open ? "bg-ok text-white" : "border border-navy-line"}`}
      >
        {open ? "OPEN" : "CLOSED"}
      </button>
      <button onClick={() => void act("reset")} className="border border-navy-line px-3 py-1 font-mono text-[13px] hover:text-deny">
        RESET POLL
      </button>
    </div>
  );
}

function PresenterView() {
  const deck = useDeck();
  useKeyboard();
  const clock = useStopwatch();
  const [factOpen, setFactOpen] = useState(false);

  const cumulative = useMemo(() => {
    let acc = 0;
    return slides.map((s) => {
      acc += s.notes.targetSec;
      return acc;
    });
  }, []);

  const target = cumulative[deck.index] ?? TOTAL_SLOT_SEC;
  const drift = clock.elapsed - target;
  const paceColor = drift > 30 ? "bg-deny" : drift > 10 ? "bg-gold" : "bg-ok";
  const pct = Math.min(100, (clock.elapsed / TOTAL_SLOT_SEC) * 100);
  const next = slides[deck.index + 1];
  const section = SECTIONS.find((s) => s.id === deck.slide.section);

  return (
    <main className="grid h-screen w-screen grid-cols-[1.35fr_1fr] gap-6 overflow-hidden bg-terminal p-6 text-term-text">
      {/* left: current slide + pace */}
      <div className="flex min-h-0 flex-col gap-4">
        <div className="flex items-center justify-between">
          <p className="font-mono text-[14px] tracking-[0.2em] text-gold">
            {section?.label.toUpperCase()} · SLIDE {deck.index + 1} / {deck.total} · BUILD{" "}
            {deck.step} / {deck.slide.steps}
          </p>
          {deck.slide.notes.skipIfLate ? (
            <span className="bg-deny px-2 py-1 font-mono text-[12px] tracking-[0.16em] text-white">
              SKIP IF LATE
            </span>
          ) : null}
        </div>

        <div className="border border-navy-line">
          <MiniStage width={880}>
            <SlideRenderer slide={deck.slide} step={deck.step} calm />
          </MiniStage>
        </div>

        <div className="mt-auto">
          <div className="flex items-end justify-between">
            <span className="font-serif text-[52px] leading-none font-bold text-white tabular-nums">
              {fmt(clock.elapsed)}
            </span>
            <span className="font-mono text-[15px] text-term-comment">
              target {fmt(target)} · {drift >= 0 ? "+" : "−"}
              {fmt(Math.abs(drift))}
            </span>
            <div className="flex gap-2">
              <button
                onClick={clock.running ? clock.pause : clock.start}
                className="border border-navy-line px-3 py-1 font-mono text-[14px] hover:text-gold"
              >
                {clock.running ? "PAUSE" : "START"}
              </button>
              <button
                onClick={clock.reset}
                className="border border-navy-line px-3 py-1 font-mono text-[14px] hover:text-gold"
              >
                RESET
              </button>
            </div>
          </div>
          <div className="mt-2 h-[10px] w-full bg-navy-card">
            <div className={`h-full ${paceColor} transition-all`} style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>

      {/* right: notes + next */}
      <div className="flex min-h-0 flex-col gap-4 overflow-auto">
        <div className="border-l-[3px] border-gold pl-4">
          <p className="font-mono text-[13px] tracking-[0.2em] text-gold">
            CUE · {deck.slide.notes.cue}
          </p>
          <h2 className="mt-1 font-sans text-[22px] font-bold text-white">
            {deck.slide.title.replace("\n", " ")}
          </h2>
        </div>

        <p className="font-sans text-[24px] leading-[1.45] text-white">{deck.slide.notes.say}</p>

        {deck.slide.notes.fact ? (
          <div className="border border-navy-line bg-navy-card">
            <button
              className="flex w-full items-center justify-between px-4 py-2 font-mono text-[13px] tracking-[0.16em] text-term-comment"
              onClick={() => setFactOpen((v) => !v)}
            >
              FACT CHECK
              <Icon name={factOpen ? "chevron-up" : "chevron-down"} size={16} />
            </button>
            {factOpen ? (
              <p className="px-4 pb-3 font-serif text-[17px] italic text-term-text">
                {deck.slide.notes.fact}
              </p>
            ) : null}
          </div>
        ) : null}

        <PollControls />

        <div className="mt-auto">
          <p className="mb-2 font-mono text-[13px] tracking-[0.2em] text-term-comment">NEXT</p>
          {next ? (
            <div className="flex flex-col gap-2">
              <div className="w-fit border border-navy-line">
                <MiniStage width={280}>
                  <SlideRenderer slide={next} step={next.steps} calm />
                </MiniStage>
              </div>
              <p className="font-sans text-[16px] text-term-comment">{next.title.replace("\n", " ")}</p>
            </div>
          ) : (
            <p className="font-sans text-[17px] text-term-comment">End of deck.</p>
          )}
          <div className="mt-3 flex gap-2">
            <button
              onClick={deck.prev}
              className="border border-navy-line px-4 py-2 font-mono text-[14px] hover:text-gold"
            >
              ← BACK
            </button>
            <button
              onClick={deck.next}
              className="border border-navy-line px-4 py-2 font-mono text-[14px] hover:text-gold"
            >
              NEXT →
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
