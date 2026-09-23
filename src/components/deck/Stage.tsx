import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Renders children on a fixed 1920x1080 canvas, scaled to fit the container
 * while keeping 16:9 and letterboxing with the terminal navy.
 */
export function Stage({
  children,
  className = "",
  onClickHalf,
  onSwipe,
}: {
  children: ReactNode;
  className?: string;
  onClickHalf?: (dir: 1 | -1) => void;
  onSwipe?: (dir: 1 | -1) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const touchX = useRef<number | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const { width, height } = el.getBoundingClientRect();
      setScale(Math.min(width / 1920, height / 1080));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className={`deck-viewport h-full w-full ${className}`}
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
      <div className="deck-stage" style={{ transform: `scale(${scale})` }}>
        {children}
      </div>
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
