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
import { BROADCAST_CHANNEL } from "@/config";
import { screens, TOTAL_SCREENS, type Screen } from "@/content/screens";

export type OverlayKey = "overview" | "sources" | "black" | "presenter";

export interface DeckState {
  index: number;
  step: number;
  /** Bumped by R / Replay so the current screen remounts from its initial state. */
  replay: number;
  /** Screen-local choice from keys 1–6 (null = none). */
  choice: number | null;
}

interface DeckContextValue extends DeckState {
  screen: Screen;
  total: number;
  next: () => void;
  prev: () => void;
  goto: (index: number, step?: number) => void;
  resetScreen: () => void;
  setChoice: (c: number | null) => void;
  overlay: OverlayKey | null;
  setOverlay: (o: OverlayKey | null) => void;
  isPresenter: boolean;
}

const DeckContext = createContext<DeckContextValue | null>(null);
const SS_KEY = "ai-era-deck-state";

const clampIndex = (i: number) => Math.max(0, Math.min(TOTAL_SCREENS - 1, Math.trunc(i) || 0));
const clampStep = (index: number, step: number) =>
  Math.max(0, Math.min(screens[index]!.steps, Math.trunc(step) || 0));

export function normalizeState(value: unknown): DeckState | null {
  if (!value || typeof value !== "object") return null;
  const v = value as Partial<DeckState>;
  if (typeof v.index !== "number" || typeof v.step !== "number") return null;
  const index = clampIndex(v.index);
  return {
    index,
    step: clampStep(index, v.step),
    replay: typeof v.replay === "number" ? v.replay : 0,
    choice: typeof v.choice === "number" && v.choice >= 1 && v.choice <= 6 ? v.choice : null,
  };
}

/** Pure step/screen arithmetic, exported for tests. */
export function stepForward(s: DeckState): DeckState {
  if (s.step < screens[s.index]!.steps) return { ...s, step: s.step + 1 };
  if (s.index < TOTAL_SCREENS - 1) return { ...s, index: s.index + 1, step: 0, choice: null };
  return s;
}
export function stepBack(s: DeckState): DeckState {
  if (s.step > 0) return { ...s, step: s.step - 1 };
  if (s.index > 0) {
    const index = s.index - 1;
    return { ...s, index, step: screens[index]!.steps, choice: null };
  }
  return s;
}

function readSession(): DeckState | null {
  try {
    const raw = sessionStorage.getItem(SS_KEY);
    return raw ? normalizeState(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

export function DeckProvider({
  children,
  isPresenter = false,
  initial,
  syncUrl = false,
}: {
  children: ReactNode;
  isPresenter?: boolean;
  /** Explicit start position (from /present/N?step=k or "/"). Presenter omits it. */
  initial?: { index: number; step: number };
  /** Audience windows mirror their position into /present/N?step=k. */
  syncUrl?: boolean;
}) {
  const [state, setState] = useState<DeckState>(() => ({
    index: clampIndex(initial?.index ?? 0),
    step: initial ? clampStep(clampIndex(initial.index), initial.step) : 0,
    replay: 0,
    choice: null,
  }));
  const [overlay, setOverlay] = useState<OverlayKey | null>(null);
  const [ready, setReady] = useState(false);
  const channelRef = useRef<BroadcastChannel | null>(null);
  const lastRemote = useRef<string | null>(null);

  // Presenter windows resume from the shared session state.
  useEffect(() => {
    if (!initial) {
      const stored = readSession();
      if (stored) setState(stored);
    }
    setReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (typeof BroadcastChannel === "undefined") return;
    const ch = new BroadcastChannel(BROADCAST_CHANNEL);
    channelRef.current = ch;
    ch.onmessage = (e: MessageEvent) => {
      const data = e.data as { type?: string; state?: unknown } | undefined;
      if (data?.type === "hello") {
        // a freshly opened window asks for the current position
        ch.postMessage({ type: "state", state: stateRef.current });
        return;
      }
      if (data?.type !== "state") return;
      const nextState = normalizeState(data.state);
      if (!nextState) return;
      lastRemote.current = JSON.stringify(nextState);
      setState(nextState);
    };
    if (!initial) ch.postMessage({ type: "hello" });
    return () => ch.close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    if (!ready) return;
    const serialized = JSON.stringify(state);
    try {
      sessionStorage.setItem(SS_KEY, serialized);
    } catch {
      /* private mode */
    }
    if (lastRemote.current !== serialized) channelRef.current?.postMessage({ type: "state", state });
    lastRemote.current = null;
    if (syncUrl) {
      const url = `/present/${state.index}${state.step ? `?step=${state.step}` : ""}`;
      if (window.location.pathname + window.location.search !== url) {
        window.history.replaceState(window.history.state, "", url);
      }
    }
    const s = screens[state.index]!;
    document.title = `${s.id} · ${state.index + 1}/${TOTAL_SCREENS} — ${s.title}`;
  }, [state, ready, syncUrl]);

  const next = useCallback(() => setState(stepForward), []);
  const prev = useCallback(() => setState(stepBack), []);
  const goto = useCallback((index: number, step = 0) => {
    const i = clampIndex(index);
    setState((s) => ({ ...s, index: i, step: clampStep(i, step), choice: null }));
  }, []);
  const resetScreen = useCallback(
    () => setState((s) => ({ ...s, step: 0, choice: null, replay: s.replay + 1 })),
    [],
  );
  const setChoice = useCallback((c: number | null) => setState((s) => ({ ...s, choice: c })), []);

  const value = useMemo<DeckContextValue>(
    () => ({
      ...state,
      screen: screens[state.index]!,
      total: TOTAL_SCREENS,
      next,
      prev,
      goto,
      resetScreen,
      setChoice,
      overlay,
      setOverlay,
      isPresenter,
    }),
    [state, next, prev, goto, resetScreen, setChoice, overlay, isPresenter],
  );

  return <DeckContext.Provider value={value}>{children}</DeckContext.Provider>;
}

export function useDeck() {
  const ctx = useContext(DeckContext);
  if (!ctx) throw new Error("useDeck must be used inside <DeckProvider>");
  return ctx;
}
