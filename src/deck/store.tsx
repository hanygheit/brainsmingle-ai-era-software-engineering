import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { slides, TOTAL_SLIDES } from "@/content/slides";

export type OverlayKey = "help" | "overview" | "black" | "white" | "thumbs";

export interface DeckState {
  index: number; // 0-based
  step: number; // 0 = nothing revealed
}

interface DeckContextValue extends DeckState {
  slide: (typeof slides)[number];
  total: number;
  next: () => void;
  prev: () => void;
  goto: (index: number, step?: number) => void;
  skipBuilds: () => void;
  overlay: OverlayKey | null;
  setOverlay: (o: OverlayKey | null) => void;
  laser: boolean;
  spotlight: boolean;
  zoom: boolean;
  notesOpen: boolean;
  timerOn: boolean;
  calm: boolean;
  toggle: (k: "laser" | "spotlight" | "zoom" | "notesOpen" | "timerOn" | "calm") => void;
  isPresenter: boolean;
}

const DeckContext = createContext<DeckContextValue | null>(null);

const slideAt = (i: number) => slides[Math.max(0, Math.min(TOTAL_SLIDES - 1, i))]!;

const CHANNEL = "agent-deck-sync";
const LS_KEY = "agent-deck-state";

function readHash(): number | null {
  if (typeof window === "undefined") return null;
  const m = window.location.hash.match(/^#\/(\d+)/);
  if (!m) return null;
  const n = Number(m[1]) - 1;
  return n >= 0 && n < TOTAL_SLIDES ? n : null;
}

export function DeckProvider({
  children,
  isPresenter = false,
}: {
  children: ReactNode;
  isPresenter?: boolean;
}) {
  const [state, setState] = useState<DeckState>({ index: 0, step: 0 });
  const [overlay, setOverlay] = useState<OverlayKey | null>(null);
  const [flags, setFlags] = useState({
    laser: false,
    spotlight: false,
    zoom: false,
    notesOpen: false,
    timerOn: false,
    calm: false,
  });
  const channelRef = useRef<BroadcastChannel | null>(null);
  const applyingRemote = useRef(false);

  // honour prefers-reduced-motion by starting in Calm mode
  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setFlags((f) => ({ ...f, calm: true }));
    }
  }, []);

  // hydrate from hash / storage
  useEffect(() => {
    const fromHash = readHash();
    if (fromHash !== null) {
      setState({ index: fromHash, step: 0 });
      return;
    }
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) setState(JSON.parse(raw) as DeckState);
    } catch {
      /* ignore */
    }
  }, []);

  // cross-window sync
  useEffect(() => {
    if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") return;
    const ch = new BroadcastChannel(CHANNEL);
    channelRef.current = ch;
    ch.onmessage = (e: MessageEvent<DeckState>) => {
      applyingRemote.current = true;
      setState(e.data);
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === LS_KEY && e.newValue) {
        applyingRemote.current = true;
        setState(JSON.parse(e.newValue) as DeckState);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => {
      ch.close();
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  // publish state
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
    if (!applyingRemote.current) {
      channelRef.current?.postMessage(state);
      const hash = `#/${state.index + 1}`;
      if (window.location.hash !== hash) {
        window.history.pushState(null, "", hash);
      }
    }
    applyingRemote.current = false;
  }, [state]);

  // browser back/forward
  useEffect(() => {
    const onPop = () => {
      const n = readHash();
      if (n !== null) setState((s) => (s.index === n ? s : { index: n, step: 0 }));
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const goto = useCallback((index: number, step = 0) => {
    const clamped = Math.max(0, Math.min(TOTAL_SLIDES - 1, index));
    setState({ index: clamped, step });
  }, []);

  const next = useCallback(() => {
    setState((s) => {
      // One click reveals the whole slide; builds auto-play in SlideRenderer.
      const maxStep = slideAt(s.index).steps;
      void maxStep;
      if (s.index < TOTAL_SLIDES - 1) return { index: s.index + 1, step: 0 };
      return s;
    });
  }, []);

  const prev = useCallback(() => {
    setState((s) => {
            if (s.index > 0) return { index: s.index - 1, step: 0 };
      return s;
    });
  }, []);

  const skipBuilds = useCallback(() => {
    setState((s) => ({ ...s, step: slideAt(s.index).steps }));
  }, []);

  const toggle = useCallback((k: keyof typeof flags) => {
    setFlags((f) => ({ ...f, [k]: !f[k] }));
  }, []);

  const value = useMemo<DeckContextValue>(
    () => ({
      ...state,
      slide: slideAt(state.index),
      total: TOTAL_SLIDES,
      next,
      prev,
      goto,
      skipBuilds,
      overlay,
      setOverlay,
      ...flags,
      toggle,
      isPresenter,
    }),
    [state, next, prev, goto, skipBuilds, overlay, flags, toggle, isPresenter],
  );

  return <DeckContext.Provider value={value}>{children}</DeckContext.Provider>;
}

export function useDeck() {
  const ctx = useContext(DeckContext);
  if (!ctx) throw new Error("useDeck must be used inside <DeckProvider>");
  return ctx;
}
