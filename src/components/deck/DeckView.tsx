import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { DeckProvider, useDeck } from "@/deck/store";
import { useKeyboard } from "@/deck/useKeyboard";
import { ACT_CARD_MS, ACT_COLORS, ACT_STARTS, isPaper } from "@/deck/theme";
import { ArcMotif } from "@/components/kit";
import { ActLabel, Blackout, ControlBar, OverviewGrid, ProgressBar, SourceDrawer } from "./Chrome";
import { PresenterPanel } from "./PresenterPanel";
import { ScreenRenderer } from "./ScreenRenderer";
import { Stage } from "./Stage";

export function Deck({ index = 0 }: { index?: number }) {
  return (
    <DeckProvider initial={{ index }} syncUrl>
      <DeckInner />
    </DeckProvider>
  );
}

/** Shows the dark act card for ACT_CARD_MS when stepping forward (one slide) into an act's first slide. */
function useActCard(index: number, screenId: string, enter: 1 | -1) {
  const prev = useRef<number | null>(null);
  const [card, setCard] = useState<number | null>(null);
  useEffect(() => {
    const p = prev.current;
    prev.current = index;
    if (p === null || enter !== 1 || index !== p + 1 || !ACT_STARTS[screenId]) return setCard(null);
    setCard(index);
    const t = setTimeout(() => setCard(null), ACT_CARD_MS);
    return () => clearTimeout(t);
  }, [index, screenId, enter]);
  const showing = card === index;
  return { showing, skip: () => setCard(null) };
}

function DeckInner() {
  const deck = useDeck();
  const reduce = useReducedMotion();
  useKeyboard();
  const { showing, skip } = useActCard(deck.index, deck.screen.id, deck.enter);
  const paper = isPaper(deck.screen.id);
  const actColor = ACT_COLORS[deck.screen.act];

  // → / Space / PageDown during the act card skip the card, not the slide.
  useEffect(() => {
    if (!showing) return;
    const onKey = (e: KeyboardEvent) => {
      if (["ArrowRight", "PageDown", " "].includes(e.key) && !e.shiftKey) {
        e.preventDefault();
        e.stopImmediatePropagation();
        skip();
      }
    };
    window.addEventListener("keydown", onKey, { capture: true });
    return () => window.removeEventListener("keydown", onKey, { capture: true });
  }, [showing, skip]);

  const actNo = ACT_STARTS[deck.screen.id];
  const actTitle = deck.screen.act.split(" · ")[1] ?? deck.screen.act;

  return (
    <main
      className="relative h-dvh w-screen overflow-hidden"
      style={{ ["--letterbox" as string]: paper && !showing ? "#F7F6F2" : "var(--stage-bg)", background: "var(--letterbox)" }}
    >
      <Stage
        onClickHalf={(dir) => (showing && dir === 1 ? skip() : dir === 1 ? deck.next() : deck.prev())}
        onSwipe={(dir) => (showing && dir === 1 ? skip() : dir === 1 ? deck.next() : deck.prev())}
      >
        {paper ? null : <div className="vignette pointer-events-none absolute inset-0 z-0" aria-hidden />}
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={`${deck.screen.id}-${deck.replay}`}
            className="absolute inset-0 z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0.15 : 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <ScreenRenderer
              screen={deck.screen}
              play={deck.enter === 1 && !showing}
              choice={deck.choice}
              replay={deck.replay}
            />
          </motion.div>
        </AnimatePresence>
        <AnimatePresence>
          {showing && actNo ? (
            <motion.div
              key={`card-${deck.screen.id}`}
              className="theme-stage absolute inset-0 z-20 flex flex-col justify-center bg-bg px-[160px]"
              style={{ boxShadow: "none" }}
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduce ? 0.15 : 0.45, ease: [0.22, 1, 0.36, 1] }}
              aria-hidden
            >
              <div className="pointer-events-none absolute top-1/2 right-[-200px] -translate-y-1/2 opacity-60">
                <ArcMotif radius={460} />
              </div>
              <p className="t-tag text-muted">ACT {actNo}</p>
              <h2 className="mt-[24px] font-display text-[72px] leading-[1.05] font-bold tracking-[-0.03em] text-text">
                {actTitle}
              </h2>
              <div className="mt-[40px] h-[3px] w-[240px]" style={{ background: actColor }} />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </Stage>

      <div
        className={paper && !showing ? "theme-chrome-paper contents" : "contents"}
        style={paper && !showing && actColor ? { ["--act" as string]: actColor } : undefined}
      >
        <ProgressBar />
        <ActLabel />
        <ControlBar />
      </div>
      <OverviewGrid />
      <SourceDrawer />
      {deck.overlay === "presenter" ? (
        <div className="absolute inset-0 z-50 overflow-hidden bg-bg/95 p-6" onClick={(e) => e.stopPropagation()}>
          <PresenterPanel compact={typeof window !== "undefined" && window.innerWidth < 1100} />
        </div>
      ) : null}
      <Blackout />
      <p className="sr-only" aria-live="polite">
        Slide {deck.index} of {deck.total}: {deck.screen.title}
      </p>
    </main>
  );
}
