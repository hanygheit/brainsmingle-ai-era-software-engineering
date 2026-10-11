import { useEffect, useState } from "react";
import { usePrintMode } from "@/deck/print-mode";
import { supabase } from "@/integrations/supabase/client";
import { POLL_IDS, type PollId } from "@/config";
import interview from "@/content/interview.json";
import opening from "@/content/opening.json";
import { CHOICE_EVENT, type ChoiceDetail } from "@/deck/useKeyboard";

export type Counts = [number, number, number];
const zero = (): Counts => [0, 0, 0];

export const POLL_SCREEN: Record<PollId, string> = { "s2-challenge": "S2", "s7-interview": "S12" };
export const POLL_CONTENT: Record<PollId, { question: string; options: string[] }> = {
  "s2-challenge": opening.poll,
  "s7-interview": interview.poll,
};
export const isPollId = (v: unknown): v is PollId => POLL_IDS.includes(v as PollId);

/* ---------- voter ---------- */
export function voterId() {
  const k = "ai-era-voter-id";
  try {
    let id = localStorage.getItem(k);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(k, id);
    }
    return id;
  } catch {
    return crypto.randomUUID();
  }
}

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
    const sync = () => setManual(readManual(poll));
    sync();
    const onChoice = (e: Event) => {
      const d = (e as CustomEvent<ChoiceDetail>).detail;
      // Keys 1/2/3 add manual votes on S2 only; on S12 they reveal the answers instead.
      if (poll === "s2-challenge" && d.screenId === POLL_SCREEN[poll] && d.n <= 3) addManual(poll, d.n);
    };
    window.addEventListener(MANUAL_EVENT, sync);
    window.addEventListener(CHOICE_EVENT, onChoice);
    return () => {
      window.removeEventListener(MANUAL_EVENT, sync);
      window.removeEventListener(CHOICE_EVENT, onChoice);
    };
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
