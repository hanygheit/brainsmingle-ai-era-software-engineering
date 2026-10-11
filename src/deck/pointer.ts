import { useSyncExternalStore } from "react";

/** Presenter pointer tools for the audience window: a dimming spotlight or a freehand highlighter. */
export type PointerTool = "spotlight" | "highlight";

interface PointerState {
  tool: PointerTool | null;
  /** Spotlight radius in slide pixels (1920×1080 canvas). */
  radius: number;
  /** Bumped by C / the eraser button to wipe the highlighter ink. */
  clear: number;
}

export const SPOT_MIN = 120;
export const SPOT_MAX = 520;
const SPOT_STEP = 40;

let state: PointerState = { tool: null, radius: 240, clear: 0 };
const listeners = new Set<() => void>();
const set = (next: Partial<PointerState>) => {
  state = { ...state, ...next };
  listeners.forEach((l) => l());
};

export const pointer = {
  get: () => state,
  subscribe: (l: () => void) => {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  /** Same tool again switches it off. */
  toggle: (tool: PointerTool) => set({ tool: state.tool === tool ? null : tool }),
  off: () => set({ tool: null }),
  clearInk: () => set({ clear: state.clear + 1 }),
  resize: (dir: 1 | -1) =>
    set({ radius: Math.max(SPOT_MIN, Math.min(SPOT_MAX, state.radius + dir * SPOT_STEP)) }),
};

export function usePointer() {
  return useSyncExternalStore(pointer.subscribe, pointer.get, pointer.get);
}
