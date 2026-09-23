import { useEffect, useMemo, useRef, useState } from "react";

/**
 * Types an array of lines sequentially. Returns how many lines are complete
 * and the partially typed text of the current line.
 */
export function useTypedLines(lines: string[], active: boolean, charMs = 12) {
  const [done, setDone] = useState(0);
  const [partial, setPartial] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const key = lines.join("\u0000");
  // Callers pass a fresh array each render; key on content so typing doesn't restart.
  const stable = useMemo(() => key.split("\u0000"), [key]);

  useEffect(() => {
    const lines = stable;

    if (!active) {
      setDone(0);
      setPartial("");
      return;
    }
    let cancelled = false;
    let line = 0;
    let char = 0;

    const tick = () => {
      if (cancelled) return;
      const current = lines[line];
      if (current === undefined) return;
      if (char >= current.length) {
        line += 1;
        char = 0;
        setDone(line);
        setPartial("");
        if (line >= lines.length) return;
        timer.current = setTimeout(tick, 90);
        return;
      }
      char = Math.min(current.length, char + 2);
      setPartial(current.slice(0, char));
      timer.current = setTimeout(tick, charMs);
    };

    tick();
    return () => {
      cancelled = true;
      if (timer.current) clearTimeout(timer.current);
    };
  }, [stable, active, charMs]);

  const complete = () => {
    if (timer.current) clearTimeout(timer.current);
    setDone(lines.length);
    setPartial("");
  };

  return { done, partial, complete, finished: done >= lines.length };
}

export function Caret() {
  return <span className="ml-[2px] inline-block h-[0.95em] w-[9px] translate-y-[2px] bg-gold" />;
}
