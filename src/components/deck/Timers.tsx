import { useEffect, useRef, useState } from "react";

export function useStopwatch() {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const raf = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!running) return;
    raf.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => {
      if (raf.current) clearInterval(raf.current);
    };
  }, [running]);

  return {
    elapsed,
    running,
    start: () => setRunning(true),
    pause: () => setRunning(false),
    reset: () => {
      setRunning(false);
      setElapsed(0);
    },
  };
}

export function fmt(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
