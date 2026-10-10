import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { DeckProvider, useDeck } from "@/deck/store";
import { useKeyboard } from "@/deck/useKeyboard";
import { ActLabel, Blackout, ControlBar, OverviewGrid, ProgressBar, SourceDrawer } from "./Chrome";
import { PresenterPanel } from "./PresenterPanel";
import { ScreenRenderer } from "./ScreenRenderer";
import { Stage } from "./Stage";

export function Deck({ index = 0, step = 0 }: { index?: number; step?: number }) {
  return (
    <DeckProvider initial={{ index, step }} syncUrl>
      <DeckInner />
    </DeckProvider>
  );
}

function DeckInner() {
  const deck = useDeck();
  const reduce = useReducedMotion();
  useKeyboard();

  return (
    <main className="relative h-dvh w-screen overflow-hidden bg-black">
      <Stage
        onClickHalf={(dir) => (dir === 1 ? deck.next() : deck.prev())}
        onSwipe={(dir) => (dir === 1 ? deck.next() : deck.prev())}
      >
        <div className="vignette pointer-events-none absolute inset-0 z-0" aria-hidden />
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={`${deck.screen.id}-${deck.replay}`}
            className="absolute inset-0 z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0.15 : 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <ScreenRenderer screen={deck.screen} step={deck.step} choice={deck.choice} replay={deck.replay} />
          </motion.div>
        </AnimatePresence>
      </Stage>

      <ProgressBar />
      <ActLabel />
      <ControlBar />
      <OverviewGrid />
      <SourceDrawer />
      {deck.overlay === "presenter" ? (
        <div className="absolute inset-0 z-50 overflow-hidden bg-bg/95 p-6" onClick={(e) => e.stopPropagation()}>
          <PresenterPanel compact={typeof window !== "undefined" && window.innerWidth < 1100} />
        </div>
      ) : null}
      <Blackout />
      <p className="sr-only" aria-live="polite">
        {deck.screen.id}, step {deck.step} of {deck.screen.steps}
      </p>
    </main>
  );
}
