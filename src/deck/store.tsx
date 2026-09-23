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

function normalizeState(value: unknown): DeckState | null {
  if (!value || typeof value !== "object") return null;
  const candidate = value as Partial<DeckState>;
  if (!Number.isInteger(candidate.index) || !Number.isInteger(candidate.step)) return null;
  const index = Math.max(0, Math.min(TOTAL_SLIDES - 1, candidate.index ?? 0));
  const step = Math.max(0, Math.min(slideAt(index).steps, candidate.step ?? 0));
  return { index, step };
}

function readStoredState(): DeckState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? normalizeState(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

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
  const remoteStateRef = useRef<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // honour prefers-reduced-motion by starting in Calm mode
  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setFlags((f) => ({ ...f, calm: true }));
    }
  }, []);

  // A clean audience URL always means slide 1. Presenter windows inherit the
  // current audience state when they are opened without an explicit hash.
  useEffect(() => {
    const fromHash = readHash();
    if (fromHash !== null) {
      setState({ index: fromHash, step: 0 });
    } else if (isPresenter) {
      setState(readStoredState() ?? { index: 0, step: 0 });
    } else {
      setState({ index: 0, step: 0 });
    }
    setHydrated(true);
  }, [isPresenter]);

  // cross-window sync
  useEffect(() => {
    if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") return;
    const ch = new BroadcastChannel(CHANNEL);
    channelRef.current = ch;
    const applyRemote = (value: unknown) => {
      const nextState = normalizeState(value);
      if (!nextState) return;
      remoteStateRef.current = JSON.stringify(nextState);
      setState((current) =>
        current.index === nextState.index && current.step === nextState.step ? current : nextState,
      );
    };
    ch.onmessage = (e: MessageEvent<DeckState>) => {
      applyRemote(e.data);
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === LS_KEY && e.newValue) {
        try {
          applyRemote(JSON.parse(e.newValue));
        } catch {
          /* ignore malformed storage from an older session */
        }
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
    if (typeof window === "undefined" || !hydrated) return;
    const serialized = JSON.stringify(state);
    try {
      localStorage.setItem(LS_KEY, serialized);
    } catch {
      /* ignore */
    }
    if (remoteStateRef.current !== serialized) {
      channelRef.current?.postMessage(state);
    }
    remoteStateRef.current = null;

    const hash = `#/${state.index + 1}`;
    if (window.location.hash !== hash) {
      window.history.replaceState(null, "", hash);
    }
  }, [state, hydrated]);

  // browser back/forward
  useEffect(() => {
    const onPop = () => {
      const n = readHash();
      const index = n ?? 0;
      setState((s) => (s.index === index ? s : { index, step: 0 }));
    };
    window.addEventListener("popstate", onPop);
    window.addEventListener("hashchange", onPop);
    return () => {
      window.removeEventListener("popstate", onPop);
      window.removeEventListener("hashchange", onPop);
    };
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
