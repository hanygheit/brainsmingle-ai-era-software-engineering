import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { POLL_IDS, type PollId } from "@/config";

/** Open/closed state per poll; `at` = when it was last opened (bare /vote picks the latest). */
export type PollState = Record<PollId, { open: boolean; at: string | null }>;

const STATE_PATH = "state/polls.json";
/** Open until the presenter closes it: a missing or unreadable state never blocks voting. */
export const DEFAULT_POLL_STATE: PollState = {
  "s2-challenge": { open: true, at: null },
};

function normalise(v: unknown): PollState {
  const out = structuredClone(DEFAULT_POLL_STATE);
  if (v && typeof v === "object") {
    for (const id of POLL_IDS) {
      const e = (v as Record<string, { open?: unknown; at?: unknown }>)[id];
      if (e && typeof e.open === "boolean") out[id] = { open: e.open, at: typeof e.at === "string" ? e.at : null };
    }
  }
  return out;
}

let cache: { at: number; state: PollState } | null = null;

async function load(): Promise<PollState> {
  if (cache && Date.now() - cache.at < 2000) return cache.state;
  const { readJson } = await import("./store.server");
  const state = normalise(await readJson(STATE_PATH).catch(() => null));
  cache = { at: Date.now(), state };
  return state;
}

/** Public: which polls accept votes right now. */
export const getPollState = createServerFn({ method: "GET" }).handler(async () => {
  try {
    return await load();
  } catch {
    return DEFAULT_POLL_STATE;
  }
});

/** Presenter: open or close one poll. Requires the presenter PIN. */
export const setPollOpen = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({ pin: z.string().max(64), poll: z.enum(POLL_IDS), open: z.boolean() }).parse(d),
  )
  .handler(async ({ data }) => {
    const { checkPin } = await import("./print-token.server");
    if (!(await checkPin(data.pin))) return { ok: false as const, error: "Wrong presenter PIN." };
    try {
      const { readJson, writeJson } = await import("./store.server");
      const state = normalise(await readJson(STATE_PATH).catch(() => null));
      state[data.poll] = { open: data.open, at: data.open ? new Date().toISOString() : state[data.poll].at };
      await writeJson(STATE_PATH, state);
      cache = { at: Date.now(), state };
      return { ok: true as const, state };
    } catch (e) {
      return { ok: false as const, error: e instanceof Error ? e.message : "Could not save the poll state." };
    }
  });
