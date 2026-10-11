import { useEffect, useRef, useState } from "react";
import { useDeck } from "@/deck/store";
import { isPaper } from "@/deck/theme";
import { pointer, usePointer } from "@/deck/pointer";

type Pt = [number, number];
const INK = "#F2B33D"; // validate fill: a marker yellow that reads on paper and navy
const INK_WIDTH = 30; // slide px
const DIM = "rgba(11, 21, 43, 0.8)"; // room navy, never pure black

const path = (pts: Pt[]) =>
  pts.length === 1
    ? `M${pts[0]![0]} ${pts[0]![1]}l0.1 0`
    : pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join("");

/**
 * Highlighter ink, rendered inside the scaled 1920×1080 canvas so strokes stay on
 * the content when the window resizes. While the highlighter is on it also takes
 * the pointer (drawing instead of click-to-advance). Ink clears on slide change, R or C.
 */
export function PointerInk() {
  const deck = useDeck();
  const { tool, clear } = usePointer();
  const [strokes, setStrokes] = useState<Pt[][]>([]);
  const [live, setLive] = useState<Pt[] | null>(null);
  const liveRef = useRef<Pt[] | null>(null);
  const drawing = tool === "highlight" && deck.overlay === null;
  const paper = isPaper(deck.screen.id);

  useEffect(() => {
    setStrokes([]);
    setLive(null);
    liveRef.current = null;
  }, [deck.screen.id, deck.replay, clear]);

  const toSlide = (e: React.PointerEvent<SVGSVGElement>): Pt => {
    const r = e.currentTarget.getBoundingClientRect();
    return [((e.clientX - r.left) / r.width) * 1920, ((e.clientY - r.top) / r.height) * 1080];
  };
  const end = () => {
    const done = liveRef.current;
    liveRef.current = null;
    setLive(null);
    if (done) setStrokes((s) => [...s, done]);
  };

  if (!drawing && strokes.length === 0) return null;
  return (
    <svg
      className="absolute inset-0 z-20 h-full w-full"
      viewBox="0 0 1920 1080"
      style={{
        pointerEvents: drawing ? "auto" : "none",
        cursor: drawing ? "crosshair" : undefined,
        touchAction: "none",
        mixBlendMode: paper ? "multiply" : "normal",
      }}
      aria-hidden
      onClick={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
      onTouchEnd={(e) => e.stopPropagation()}
      onPointerDown={(e) => {
        if (e.button !== 0) return;
        e.stopPropagation();
        e.currentTarget.setPointerCapture(e.pointerId);
        liveRef.current = [toSlide(e)];
        setLive(liveRef.current);
      }}
      onPointerMove={(e) => {
        if (!liveRef.current) return;
        liveRef.current = [...liveRef.current, toSlide(e)];
        setLive(liveRef.current);
      }}
      onPointerUp={end}
      onPointerCancel={end}
    >
      <g
        fill="none"
        stroke={INK}
        strokeWidth={INK_WIDTH}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={paper ? 0.55 : 0.45}
      >
        {strokes.map((s, i) => (
          <path key={i} d={path(s)} />
        ))}
        {live ? <path d={path(live)} /> : null}
      </g>
    </svg>
  );
}

/**
 * Spotlight: dims everything but a soft circle that follows the mouse. Sits in the
 * stage's unscaled overlay layer so it also covers the letterbox in fullscreen;
 * it never takes the pointer, so clicks still advance. Wheel or [ ] resizes it.
 */
export function Spotlight() {
  const deck = useDeck();
  const { tool, radius } = usePointer();
  const ref = useRef<HTMLDivElement>(null);
  const [at, setAt] = useState<{ x: number; y: number; scale: number } | null>(null);
  const on = tool === "spotlight" && deck.overlay === null;

  useEffect(() => {
    if (!on) return;
    const el = ref.current;
    const place = (cx?: number, cy?: number) => {
      if (!el) return;
      const r = el.getBoundingClientRect();
      const scale = Math.min(r.width / 1920, r.height / 1080);
      setAt({ x: (cx ?? r.left + r.width / 2) - r.left, y: (cy ?? r.top + r.height / 2) - r.top, scale });
    };
    place();
    const move = (e: PointerEvent) => place(e.clientX, e.clientY);
    const wheel = (e: WheelEvent) => pointer.resize(e.deltaY < 0 ? 1 : -1);
    window.addEventListener("pointermove", move);
    window.addEventListener("wheel", wheel, { passive: true });
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("wheel", wheel);
    };
  }, [on]);

  if (!on) return <div ref={ref} className="hidden" />;
  const r = at ? radius * at.scale : 0;
  return (
    <div
      ref={ref}
      className="pointer-events-none absolute inset-0 z-[35]"
      style={
        at
          ? {
              background: `radial-gradient(circle at ${at.x}px ${at.y}px, transparent ${r * 0.86}px, ${DIM} ${r * 1.08}px)`,
            }
          : undefined
      }
      aria-hidden
    />
  );
}
