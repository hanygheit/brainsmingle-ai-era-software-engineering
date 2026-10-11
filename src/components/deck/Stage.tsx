import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";

// Measure before first paint on the client (no flash of an unscaled canvas); plain effect on the server.
const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * Renders children on a fixed 1920x1080 canvas, scaled to fit the container
 * while keeping 16:9. Unframed (fullscreen) it letterboxes with the slide's own
 * background; framed (windowed) the canvas floats as a rounded, lit screen.
 * The frame wrapper is always rendered so toggling never remounts the slide.
 */
export function Stage({
  children,
  overlay,
  framed = false,
  className = "",
  onClickHalf,
  onSwipe,
  gutterX = 0,
  aside,
}: {
  children: ReactNode;
  /** Unscaled layer on top of the canvas, clipped to the frame (e.g. the progress bar). */
  overlay?: ReactNode;
  framed?: boolean;
  className?: string;
  onClickHalf?: (dir: 1 | -1) => void;
  onSwipe?: (dir: 1 | -1) => void;
  /** Framed only: px kept clear left and right of the canvas (side arrows); dropped on narrow screens. */
  gutterX?: number;
  /** Unscaled layer beside the canvas: gets the gap from the container edge to the canvas, and the scale. */
  aside?: (gap: number, scale: number) => ReactNode;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  // null until measured: the server cannot know the window, so the canvas stays hidden until the first measure.
  const [box, setBox] = useState<{ w: number; h: number } | null>(null);
  const measured = box !== null;
  const { w: bw, h: bh } = box ?? { w: 1920, h: 1080 };
  const gx = framed && bw >= 600 ? gutterX : 0;
  const scale = Math.min((bw - 2 * gx) / 1920, bh / 1080);
  const touchX = useRef<number | null>(null);

  useIsoLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const { width, height } = el.getBoundingClientRect();
      setBox({ w: width, h: height });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className={`deck-viewport h-full w-full ${framed ? "deck-viewport--framed" : ""} ${className}`}
      onClick={(e) => {
        if (!onClickHalf) return;
        const rect = e.currentTarget.getBoundingClientRect();
        onClickHalf(e.clientX - rect.left > rect.width / 2 ? 1 : -1);
      }}
      onTouchStart={(e) => {
        touchX.current = e.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(e) => {
        if (touchX.current === null || !onSwipe) return;
        const dx = (e.changedTouches[0]?.clientX ?? 0) - touchX.current;
        if (Math.abs(dx) > 60) onSwipe(dx < 0 ? 1 : -1);
        touchX.current = null;
      }}
    >
      <div
        className={framed ? "deck-frame deck-frame--framed" : "deck-frame"}
        style={(() => {
          if (!framed) return measured ? undefined : { visibility: "hidden" as const };
          // Whole-pixel box: a fractional offset would blur every glyph on the slide.
          const w = Math.round(1920 * scale);
          const h = Math.round(1080 * scale);
          return { width: w, height: h, left: Math.round((bw - w) / 2), top: Math.round((bh - h) / 2), visibility: measured ? undefined : ("hidden" as const) };
        })()}
      >
        <div className="deck-stage" style={{ transform: `scale(${scale})`, visibility: measured ? undefined : "hidden" }}>
          {children}
        </div>
        {overlay}
      </div>
      {measured && aside ? aside((bw - 1920 * scale) / 2, scale) : null}
    </div>
  );
}

/** Non-interactive scaled preview used by the overview grid and presenter view. */
export function MiniStage({ children, width }: { children: ReactNode; width: number }) {
  const scale = width / 1920;
  return (
    <div
      className="deck-viewport"
      style={{ width, height: width * (1080 / 1920) }}
      aria-hidden="true"
    >
      <div className="deck-stage pointer-events-none" style={{ transform: `scale(${scale})` }}>
        {children}
      </div>
    </div>
  );
}
