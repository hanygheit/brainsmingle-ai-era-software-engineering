import { useEffect, useState } from "react";
import { usePrintMode } from "@/deck/print-mode";
import { supabase } from "@/integrations/supabase/client";
import { POLL_IDS, STORED_POLLS, type PollId } from "@/config";
import opening from "@/content/opening.json";
import { CHOICE_EVENT, type ChoiceDetail } from "@/deck/events";
import { DEFAULT_POLL_STATE, getPollState, type PollState } from "./poll-state.functions";
import { voterId } from "./device-id";
import { castStoredVote, getStoredCounts, getStoredVoteRows } from "./votes.functions";

/** Votes per option, one entry per option (s2-challenge has 4). */
export type Counts = number[];

export const POLL_SCREEN: Record<PollId, string> = { "s2-challenge": "S2" };
export const POLL_CONTENT: Record<PollId, { question: string; options: string[] }> = {
  "s2-challenge": opening.poll,
};
export const isPollId = (v: unknown): v is PollId => POLL_IDS.includes(v as PollId);
export const optionCount = (poll: PollId) => POLL_CONTENT[poll].options.length;
const zero = (poll: PollId): Counts => Array.from({ length: optionCount(poll) }, () => 0);
const isStored = (poll: PollId) => STORED_POLLS.includes(poll);

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
    return v >= 1 && v <= optionCount(poll) ? v : null;
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

/** Raw vote rows for the results CSV: poll_votes (public under the existing RLS) + the bucket-stored polls. */
export async function fetchVoteRows() {
  const [{ data, error }, stored] = await Promise.all([
    supabase
      .from("poll_votes")
      .select("poll_id, option, created_at")
      .in("poll_id", POLL_IDS.filter((p) => !isStored(p)))
      .order("created_at", { ascending: true }),
    getStoredVoteRows(),
  ]);
  if (error) throw error;
  return [...stored, ...((data ?? []) as { poll_id: PollId; option: number; created_at: string }[])];
}

/* ---------- voter ---------- */
export { voterId };

export async function castVote(poll: PollId, option: number) {
  if (isStored(poll)) {
    const r = await castStoredVote({ data: { poll, option, voter: voterId() } }).catch(() => null);
    if (!r?.ok) throw new Error("Your vote didn't go through. Try again.");
    return;
  }
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
    return Array.isArray(v) && v.length === optionCount(poll) ? v.map(Number) : zero(poll);
  } catch {
    return zero(poll);
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
  if (option < 1 || option > optionCount(poll)) return;
  const c = readManual(poll);
  c[option - 1] = (c[option - 1] ?? 0) + 1;
  writeManual(poll, c);
}
export const clearManual = (poll: PollId) => writeManual(poll, zero(poll));

/** Keys 1–4 add one manual vote on S2. One listener per window, however many tallies are mounted. */
let choiceKeysBound = false;
function listenForChoiceKeys() {
  if (choiceKeysBound) return;
  choiceKeysBound = true;
  window.addEventListener(CHOICE_EVENT, (e) => {
    const d = (e as CustomEvent<ChoiceDetail>).detail;
    if (d.screenId === POLL_SCREEN["s2-challenge"] && d.n <= optionCount("s2-challenge")) addManual("s2-challenge", d.n);
  });
}

/* ---------- live counts ---------- */
async function fetchCounts(poll: PollId): Promise<Counts> {
  if (isStored(poll)) {
    const c = await getStoredCounts({ data: { poll } });
    return zero(poll).map((_, i) => c[i] ?? 0);
  }
  const { data, error } = await supabase.from("poll_votes").select("option").eq("poll_id", poll);
  if (error) throw error;
  const c = zero(poll);
  (data ?? []).forEach((r) => {
    if (r.option && r.option >= 1 && r.option <= c.length) c[r.option - 1] = (c[r.option - 1] ?? 0) + 1;
  });
  return c;
}

/**
 * Live tally for one poll: realtime subscription with a 3 s polling fallback (poll_votes),
 * or a 2 s server poll (bucket-stored polls), plus the manual fallback (keys on the poll's screen, or presenter buttons).
 */
export function usePollCounts(poll: PollId, { live = true }: { live?: boolean } = {}) {
  const print = usePrintMode();
  const [remote, setRemote] = useState<Counts>(() => zero(poll));
  const [manual, setManual] = useState<Counts>(() => zero(poll));
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
    if (isStored(poll)) {
      timer = setInterval(() => {
        if (document.visibilityState !== "hidden") void load();
      }, 2000);
      const onVis = () => void load();
      document.addEventListener("visibilitychange", onVis);
      return () => {
        alive = false;
        if (timer) clearInterval(timer);
        document.removeEventListener("visibilitychange", onVis);
      };
    }
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

  const counts = remote.map((v, i) => v + (manual[i] ?? 0));
  return { counts, remote, manual, online, total: counts.reduce((a, b) => a + b, 0), refresh: () => fetchCounts(poll).then(setRemote) };
}
