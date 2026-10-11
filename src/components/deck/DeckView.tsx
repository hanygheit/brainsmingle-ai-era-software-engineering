import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { DeckProvider, useDeck } from "@/deck/store";
import { useKeyboard } from "@/deck/useKeyboard";
import { ACT_COLORS, isPaper } from "@/deck/theme";
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

function DeckInner() {
  const deck = useDeck();
  const reduce = useReducedMotion();
  useKeyboard();
  const paper = isPaper(deck.screen.id);
  const actColor = ACT_COLORS[deck.screen.act];

  return (
    <main
      className="relative h-dvh w-screen overflow-hidden"
      style={{ ["--letterbox" as string]: paper ? "#F7F6F2" : "var(--stage-bg)", background: "var(--letterbox)" }}
    >
      <Stage
        onClickHalf={(dir) => (dir === 1 ? deck.next() : deck.prev())}
        onSwipe={(dir) => (dir === 1 ? deck.next() : deck.prev())}
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
              play={deck.enter === 1}
              choice={deck.choice}
              replay={deck.replay}
            />
          </motion.div>
        </AnimatePresence>
      </Stage>

      <div
        className={paper ? "theme-chrome-paper contents" : "contents"}
        style={paper && actColor ? { ["--act" as string]: actColor } : undefined}
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
