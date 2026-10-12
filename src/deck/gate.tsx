import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { DECK_UNLOCK_AT, PREVIEW_SLIDES } from "@/config";
import { deckGate, unlockDeck } from "@/lib/deck-gate.functions";

/**
 * Deck time gate (client side). The server decides: it reports its clock, the unlock
 * time and whether this browser's unlock token is valid. The token lives in localStorage,
 * so the presenter window on the same origin shares it.
 */
const KEY = "ai-era-unlock";

export type GateStatus = "pending" | "locked" | "open";

interface GateValue {
  status: GateStatus;
  unlockAt: number;
  /** server clock − this device's clock, ms */
  offset: number;
  tokenExp: number | null;
  /** True when slide `index` may be shown. */
  canSee: (index: number) => boolean;
  unlock: (pin: string) => Promise<{ ok: true } | { ok: false; error: string }>;
}

export function readUnlockToken() {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

function writeToken(token: string | null) {
  try {
    if (token) localStorage.setItem(KEY, token);
    else localStorage.removeItem(KEY);
  } catch {
    /* private mode: unlock lasts for this page only */
  }
}

/** Expiry encoded in a token (u1.<exp>.<sig>); used only if the server can't be reached. */
const tokenExpiry = (t: string | null) => Number(t?.split(".")[1]) || 0;

const fallback: GateValue = {
  status: "pending",
  unlockAt: Date.parse(DECK_UNLOCK_AT),
  offset: 0,
  tokenExp: null,
  canSee: (i) => i < PREVIEW_SLIDES,
  unlock: async () => ({ ok: false, error: "Not available." }),
};

const GateContext = createContext<GateValue>(fallback);

export function GateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState({
    status: "pending" as GateStatus,
    unlockAt: fallback.unlockAt,
    offset: 0,
    tokenExp: null as number | null,
  });
  const memToken = useRef<string | null>(null);

  const refresh = useCallback(async () => {
    const token = readUnlockToken() ?? memToken.current;
    try {
      const sentAt = Date.now();
      const r = await deckGate({ data: { token } });
      const offset = r.now - Math.round((sentAt + Date.now()) / 2);
      if (token && !r.tokenExp) {
        writeToken(null);
        memToken.current = null;
      }
      setState({ status: r.open ? "open" : "locked", unlockAt: r.unlockAt, offset, tokenExp: r.tokenExp });
    } catch {
      // Server unreachable: an unexpired local token still opens the deck; otherwise stay locked and retry.
      const exp = tokenExpiry(token);
      setState((s) => ({ ...s, status: exp > Date.now() ? "open" : "locked", tokenExp: exp || null }));
      setTimeout(() => void refresh(), 5000);
    }
  }, []);

  useEffect(() => {
    void refresh();
    // another window (deck ↔ presenter) unlocked or cleared the token
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) void refresh();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [refresh]);

  // Re-ask the server when the unlock time or the token's expiry is reached.
  useEffect(() => {
    if (state.status === "pending") return;
    const serverNow = Date.now() + state.offset;
    const next = [state.status === "locked" ? state.unlockAt : null, state.tokenExp]
      .filter((t): t is number => t !== null && t > serverNow)
      .sort((a, b) => a - b)[0];
    if (next === undefined) return;
    const id = setTimeout(() => void refresh(), Math.min(next - serverNow + 500, 2 ** 31 - 1));
    return () => clearTimeout(id);
  }, [state, refresh]);

  const unlock = useCallback(async (pin: string) => {
    try {
      const r = await unlockDeck({ data: { pin } });
      if (!r.ok) return { ok: false as const, error: r.error };
      writeToken(r.token);
      memToken.current = r.token;
      setState((s) => ({ ...s, status: "open", tokenExp: r.exp }));
      return { ok: true as const };
    } catch {
      return { ok: false as const, error: "Could not check the PIN. Try again." };
    }
  }, []);

  const value = useMemo<GateValue>(
    () => ({
      ...state,
      canSee: (i: number) => state.status === "open" || i < PREVIEW_SLIDES,
      unlock,
    }),
    [state, unlock],
  );
  return <GateContext.Provider value={value}>{children}</GateContext.Provider>;
}

export const useGate = () => useContext(GateContext);

/** Current time on the server's clock, ticking every second (null until mounted). */
export function useServerNow() {
  const { offset } = useGate();
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now() + offset);
    const id = setInterval(() => setNow(Date.now() + offset), 1000);
    return () => clearInterval(id);
  }, [offset]);
  return now;
}
