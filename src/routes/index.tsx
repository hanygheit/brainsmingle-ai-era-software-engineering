import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  BlankOverlay,
  ControlBar,
  HelpOverlay,
  LiveRegion,
  NotesDrawer,
  Pointer,
  ProgressRail,
  SectionIndicator,
  ThumbDrawer,
} from "@/components/deck/Chrome";
import { OverviewGrid } from "@/components/deck/Overview";
import { SlideRenderer } from "@/components/deck/SlideRenderer";
import { Stage } from "@/components/deck/Stage";
import { slides } from "@/content/slides";
import { DeckProvider, useDeck } from "@/deck/store";
import { useKeyboard } from "@/deck/useKeyboard";

const OG_IMAGE = "https://ai-agent-on-call.lovable.app/og-image.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Before You Put an AI Agent on Call — DevOpsDays Cairo 2026" },
      {
        name: "description",
        content:
          "20 rules for safe production autonomy — an interactive Ignite talk by Hany Saad, DevOpsDays Cairo 2026.",
      },
      { property: "og:title", content: "Before You Put an AI Agent on Call" },
      {
        property: "og:description",
        content: "20 rules for safe production autonomy — DevOpsDays Cairo 2026 · Hany Saad",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Before You Put an AI Agent on Call" },
      {
        name: "twitter:description",
        content: "20 rules for safe production autonomy — DevOpsDays Cairo 2026 · Hany Saad",
      },
      { property: "og:image", content: OG_IMAGE },
      { property: "og:image:width", content: "1920" },
      { property: "og:image:height", content: "1080" },
      { name: "twitter:image", content: OG_IMAGE },
    ],
  }),
  component: DeckRoute,
});

function DeckRoute() {
  return (
    <DeckProvider>
      <DeckView />
    </DeckProvider>
  );
}

function DeckView() {
  const deck = useDeck();
  useKeyboard();
  const [zoomOrigin, setZoomOrigin] = useState("50% 50%");
  const [portrait, setPortrait] = useState(false);

  useEffect(() => {
    const check = () => setPortrait(window.innerHeight > window.innerWidth && window.innerWidth < 900);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (!deck.zoom) return;
    const onMove = (e: MouseEvent) => {
      setZoomOrigin(`${(e.clientX / window.innerWidth) * 100}% ${(e.clientY / window.innerHeight) * 100}%`);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [deck.zoom]);

  // preload the next two slides' imagery
  useEffect(() => {
    [1, 2].forEach((d) => {
      const s = slides[deck.index + d];
      if (!s) return;
      void s;
    });
  }, [deck.index]);

  // wheel navigation, throttled
  useEffect(() => {
    let last = 0;
    const onWheel = (e: WheelEvent) => {
      const now = Date.now();
      if (now - last < 600 || Math.abs(e.deltaY) < 14) return;
      last = now;
      if (e.deltaY > 0) deck.next();
      else deck.prev();
    };
    window.addEventListener("wheel", onWheel, { passive: true });
    return () => window.removeEventListener("wheel", onWheel);
  }, [deck]);

  if (deck.overlay === "overview") {
    return <OverviewGrid onClose={() => deck.setOverlay(null)} />;
  }

  return (
    <main className={`relative h-screen w-screen overflow-hidden bg-terminal ${deck.calm ? "calm" : ""}`}>
      <div
        className="h-full w-full transition-transform duration-300"
        style={{ transform: deck.zoom ? "scale(2)" : "scale(1)", transformOrigin: zoomOrigin }}
      >
        <Stage
          onClickHalf={(dir) => (dir === 1 ? deck.next() : deck.prev())}
          onSwipe={(dir) => (dir === 1 ? deck.next() : deck.prev())}
        >
          <AnimatePresence mode="sync" initial={false}>
            <motion.div
              key={deck.slide.id}
              className="h-full w-full"
              initial={deck.calm ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <SlideRenderer
                slide={deck.slide}
                step={deck.step}
                calm={deck.calm}
                onGoto={(i) => deck.goto(i)}
              />
            </motion.div>
          </AnimatePresence>
        </Stage>
      </div>

      {portrait ? (
        <div className="pointer-events-none absolute top-[14px] left-1/2 z-40 -translate-x-1/2 bg-navy-card px-4 py-2 font-mono text-[12px] tracking-[0.16em] text-term-text">
          ROTATE FOR FULL SCREEN
        </div>
      ) : null}

      <SectionIndicator />
      <ProgressRail />
      <ControlBar />
      <ThumbDrawer />
      <NotesDrawer />
      <HelpOverlay />
      <BlankOverlay />
      <Pointer />
      <LiveRegion />
    </main>
  );
}
