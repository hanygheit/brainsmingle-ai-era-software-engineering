import { useEffect, useState } from "react";
import { usePrintMode } from "@/deck/print-mode";
import { supabase } from "@/integrations/supabase/client";
import { POLL_IDS, type PollId } from "@/config";
import interview from "@/content/interview.json";
import opening from "@/content/opening.json";
import { CHOICE_EVENT, type ChoiceDetail } from "@/deck/events";
import { DEFAULT_POLL_STATE, getPollState, type PollState } from "./poll-state.functions";
import { voterId } from "./device-id";

export type Counts = [number, number, number];
const zero = (): Counts => [0, 0, 0];

export const POLL_SCREEN: Record<PollId, string> = { "s2-challenge": "S2", "s7-interview": "S12" };
export const POLL_CONTENT: Record<PollId, { question: string; options: string[] }> = {
  "s2-challenge": opening.poll,
  "s7-interview": interview.poll,
};
export const isPollId = (v: unknown): v is PollId => POLL_IDS.includes(v as PollId);

/** "Learning — student or recent graduate" → head "Learning", sub "student or recent graduate". */
export function splitOption(label: string) {
  const [head, ...rest] = label.split(" — ");
  return { head: head!, sub: rest.join(" — ") || null };
}

/** This device's vote on a poll (remembered by the vote page). */
export const MY_VOTE_KEY = (poll: PollId) => `ai-era-my-vote-${poll}`;
export function readMyVote(poll: PollId): number | null {
  try {
    const v = Number(localStorage.getItem(MY_VOTE_KEY(poll)));
    return v >= 1 && v <= 3 ? v : null;
  } catch {
    return null;
  }
}

/* ---------- open / closed ---------- */
/** Poll open/closed state, refreshed every `everyMs` while the page is visible. Null until first loaded. */
export function usePollState(everyMs = 5000) {
  const print = usePrintMode();
  const [state, setState] = useState<PollState | null>(null);
  useEffect(() => {
    if (print) return;
    let alive = true;
    const load = async () => {
      if (typeof document !== "undefined" && document.visibilityState === "hidden") return;
      try {
        const s = await getPollState();
        if (alive) setState(s);
      } catch {
        if (alive) setState((prev) => prev ?? DEFAULT_POLL_STATE);
      }
    };
    void load();
    const id = setInterval(() => void load(), everyMs);
    const onVis = () => void load();
    document.addEventListener("visibilitychange", onVis);
    return () => {
      alive = false;
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [everyMs, print]);
  return { state, setState };
}

/** Bare /vote: the most recently opened poll; with no open times, the first one this device hasn't voted on. */
export function currentOpenPoll(state: PollState): PollId | null {
  const open = POLL_IDS.filter((p) => state[p].open);
  if (open.length <= 1) return open[0] ?? null;
  const timed = open.filter((p) => state[p].at).sort((a, b) => state[b].at!.localeCompare(state[a].at!));
  if (timed.length) return timed[0]!;
  return open.find((p) => readMyVote(p) === null) ?? open[open.length - 1]!;
}

/** Raw vote rows for the results CSV (public data under the existing RLS). */
export async function fetchVoteRows() {
  const { data, error } = await supabase
    .from("poll_votes")
    .select("poll_id, option, created_at")
    .in("poll_id", [...POLL_IDS])
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as { poll_id: PollId; option: number; created_at: string }[];
}

/* ---------- voter ---------- */
export { voterId };

export async function castVote(poll: PollId, option: 1 | 2 | 3) {
  const { error } = await supabase
    .from("poll_votes")
    .upsert({ poll_id: poll, option, voter_id: voterId() }, { onConflict: "poll_id,voter_id" });
  if (error) throw new Error("Your vote didn't go through. Try again.");
}

/* ---------- manual (offline) tally, shared between deck windows ---------- */
const MANUAL_KEY = (p: PollId) => `ai-era-manual-${p}`;
const MANUAL_EVENT = "ai-era-manual-tally";
let manualChannel: BroadcastChannel | null = null;
const channel = () => {
  if (!manualChannel && typeof BroadcastChannel !== "undefined") {
    manualChannel = new BroadcastChannel("ai-era-deck-poll");
    manualChannel.onmessage = (e) => {
      const { poll, counts } = e.data ?? {};
      if (!isPollId(poll)) return;
      try {
        sessionStorage.setItem(MANUAL_KEY(poll), JSON.stringify(counts));
      } catch {
        /* ignore */
      }
      window.dispatchEvent(new Event(MANUAL_EVENT));
    };
  }
  return manualChannel;
};

export function readManual(poll: PollId): Counts {
  try {
    const v = JSON.parse(sessionStorage.getItem(MANUAL_KEY(poll)) ?? "null");
    return Array.isArray(v) && v.length === 3 ? (v.map(Number) as Counts) : zero();
  } catch {
    return zero();
  }
}

function writeManual(poll: PollId, counts: Counts) {
  try {
    sessionStorage.setItem(MANUAL_KEY(poll), JSON.stringify(counts));
  } catch {
    /* ignore */
  }
  channel()?.postMessage({ poll, counts });
  window.dispatchEvent(new Event(MANUAL_EVENT));
}

export function addManual(poll: PollId, option: number) {
  if (option < 1 || option > 3) return;
  const c = readManual(poll);
  c[option - 1] = (c[option - 1] ?? 0) + 1;
  writeManual(poll, c);
}
export const clearManual = (poll: PollId) => writeManual(poll, zero());

/** Keys 1/2/3 add one manual vote on S2 (on S12 they reveal the answers instead). One listener per window, however many tallies are mounted. */
let choiceKeysBound = false;
function listenForChoiceKeys() {
  if (choiceKeysBound) return;
  choiceKeysBound = true;
  window.addEventListener(CHOICE_EVENT, (e) => {
    const d = (e as CustomEvent<ChoiceDetail>).detail;
    if (d.screenId === POLL_SCREEN["s2-challenge"] && d.n <= 3) addManual("s2-challenge", d.n);
  });
}

/* ---------- live counts ---------- */
async function fetchCounts(poll: PollId): Promise<Counts> {
  const { data, error } = await supabase.from("poll_votes").select("option").eq("poll_id", poll);
  if (error) throw error;
  const c = zero();
  (data ?? []).forEach((r) => {
    if (r.option && r.option >= 1 && r.option <= 3) c[r.option - 1] = (c[r.option - 1] ?? 0) + 1;
  });
  return c;
}

/**
 * Live tally for one poll: realtime subscription, 3 s polling fallback,
 * plus the manual 1/2/3 fallback (keys on the poll's screen, or presenter buttons).
 */
export function usePollCounts(poll: PollId, { live = true }: { live?: boolean } = {}) {
  const print = usePrintMode();
  const [remote, setRemote] = useState<Counts>(zero);
  const [manual, setManual] = useState<Counts>(zero);
  const [online, setOnline] = useState(false);

  useEffect(() => {
    channel();
    listenForChoiceKeys();
    const sync = () => setManual(readManual(poll));
    sync();
    window.addEventListener(MANUAL_EVENT, sync);
    return () => window.removeEventListener(MANUAL_EVENT, sync);
  }, [poll]);

  useEffect(() => {
    if (print) return;
    let alive = true;
    let timer: ReturnType<typeof setInterval> | null = null;
    const load = async () => {
      try {
        const c = await fetchCounts(poll);
        if (alive) {
          setRemote(c);
          setOnline(true);
        }
      } catch {
        if (alive) setOnline(false);
      }
    };
    void load();
    if (!live) return () => void (alive = false);
    const startPolling = () => {
      if (!timer) timer = setInterval(() => void load(), 3000);
    };
    const ch = supabase
      .channel(`votes-${poll}-${Math.random().toString(36).slice(2)}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "poll_votes", filter: `poll_id=eq.${poll}` },
        () => void load(),
      )
      .subscribe((status) => {
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") startPolling();
      });
    const fallback = setTimeout(() => {
      if (ch.state !== "joined") startPolling();
    }, 5000);
    return () => {
      alive = false;
      clearTimeout(fallback);
      if (timer) clearInterval(timer);
      void supabase.removeChannel(ch);
    };
  }, [poll, live]);

  const counts = remote.map((v, i) => v + manual[i]!) as Counts;
  return { counts, remote, manual, online, total: counts[0] + counts[1] + counts[2], refresh: () => fetchCounts(poll).then(setRemote) };
}
