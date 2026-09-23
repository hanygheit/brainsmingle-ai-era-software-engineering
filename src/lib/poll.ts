import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const POLL_SESSION = "cairo26";
export type Choice = "allow" | "depends" | "block";
export type Tally = Record<number, Record<Choice, number>>;

const empty = (): Tally => ({
  1: { allow: 0, depends: 0, block: 0 },
  2: { allow: 0, depends: 0, block: 0 },
  3: { allow: 0, depends: 0, block: 0 },
  4: { allow: 0, depends: 0, block: 0 },
});

export function voterId() {
  const k = "poll-voter-id";
  let id = localStorage.getItem(k);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(k, id);
  }
  return id;
}

export async function castVote(question: number, choice: Choice) {
  const { error } = await supabase.rpc("cast_vote", {
    _session: POLL_SESSION,
    _question: question,
    _choice: choice,
    _voter: voterId(),
  });
  if (error) throw new Error(error.message.includes("closed") ? "The poll is closed." : "Vote failed.");
}

/** Live tally + open flag. Realtime on the session row; falls back to 3s polling. */
export function usePoll(enabled = true) {
  const [tally, setTally] = useState<Tally>(empty);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (!enabled) return;
    let alive = true;
    let timer: ReturnType<typeof setInterval> | null = null;

    const load = async () => {
      const [{ data }, { data: s }] = await Promise.all([
        supabase.rpc("poll_results", { _session: POLL_SESSION }),
        supabase.from("poll_sessions").select("is_open").eq("session_code", POLL_SESSION).maybeSingle(),
      ]);
      if (!alive) return;
      const t = empty();
      (data ?? []).forEach((r) => {
        const q = t[r.question_id];
        if (q) q[r.choice as Choice] = Number(r.votes);
      });
      setTally(t);
      if (s) setOpen(s.is_open);
    };
    const startPolling = () => {
      if (!timer) timer = setInterval(() => void load(), 3000);
    };

    void load();
    const ch = supabase
      .channel(`poll-${POLL_SESSION}-${Math.random().toString(36).slice(2)}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "poll_sessions", filter: `session_code=eq.${POLL_SESSION}` },
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
  }, [enabled]);

  return { tally, open };
}
