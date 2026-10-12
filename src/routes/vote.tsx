import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { POLL_IDS, type PollId } from "@/config";
import { castVote, currentOpenPoll, isPollId, MY_VOTE_KEY, POLL_CONTENT, readMyVote, splitOption, usePollCounts, usePollState } from "@/lib/poll";
import type { PollState } from "@/lib/poll-state.functions";
import { MiniBars, MobileShell, StatusPill } from "@/components/mobile/shell";
import v from "@/content/vote.json";

const t = v.page;

export const Route = createFileRoute("/vote")({
  validateSearch: (s) => z.object({ poll: z.string().max(40).optional().catch(undefined) }).parse(s),
  head: () => ({
    meta: [
      { title: "Vote — AI-Era Software Engineering live poll" },
      { name: "description", content: "Cast your vote in the live poll during Hany Saad's keynote." },
      { property: "og:title", content: "Live poll — AI-Era Software Engineering" },
      { property: "og:description", content: "Cast your vote in the live poll during the keynote." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: VotePage,
});

/** Bare /vote follows the open poll: it keeps the one shown until it closes or a poll is opened after it. */
function useFollowedPoll(state: PollState | null) {
  const [shown, setShown] = useState<PollId | null>(null);
  useEffect(() => {
    if (!state) return;
    setShown((cur) => {
      const next = currentOpenPoll(state);
      if (!cur || !state[cur].open) return next;
      const nextAt = next ? state[next].at : null;
      if (next && next !== cur && nextAt && (!state[cur].at || nextAt > state[cur].at!)) return next;
      return cur;
    });
  }, [state]);
  return shown;
}

function VotePage() {
  const { poll: requested } = Route.useSearch();
  const { state } = usePollState(6000);
  const followed = useFollowedPoll(state);

  if (requested !== undefined && !isPollId(requested)) {
    return (
      <MobileShell>
        <p className="mt-10 text-[18px]">{t.unknown}</p>
      </MobileShell>
    );
  }
  const poll = isPollId(requested) ? requested : followed;
  if (!poll) {
    return (
      <MobileShell>
        {state ? (
          <section className="mt-10" aria-live="polite">
            <StatusPill live={false}>{t.live}</StatusPill>
            <h1 className="mt-4 font-display text-[28px] leading-[1.15] font-bold tracking-[-0.02em]">{t.noPoll}</h1>
            <p className="mt-3 text-[17px] text-muted">{t.noPollHint}</p>
            <FeedbackLink />
          </section>
        ) : (
          <p className="mt-10 text-[17px] text-muted" aria-live="polite">Loading the poll…</p>
        )}
      </MobileShell>
    );
  }
  // An explicit poll shows straight away (open until the state says otherwise) — no wait on slow data.
  const open = state ? state[poll].open : true;
  const other = POLL_IDS.find((p) => p !== poll && state?.[p].open);
  return (
    <MobileShell>
      <PollScreen key={poll} poll={poll} open={open} />
      {other ? (
        <p className="mt-8 text-[15px] text-muted">
          {t.otherPoll}{" "}
          <Link to="/vote" search={{ poll: other }} className="text-own underline underline-offset-4">
            {POLL_CONTENT[other].question}
          </Link>
        </p>
      ) : null}
      <FeedbackLink />
    </MobileShell>
  );
}

function FeedbackLink() {
  return (
    <p className="mt-6 text-[15px]">
      <Link to="/feedback" className="text-muted underline underline-offset-4 hover:text-text">
        {t.feedback} →
      </Link>
    </p>
  );
}

function PollScreen({ poll, open }: { poll: PollId; open: boolean }) {
  const content = POLL_CONTENT[poll];
  const [mine, setMine] = useState<number | null>(null);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => setMine(readMyVote(poll)), [poll]);

  const vote = async (n: number) => {
    if (!open) return;
    const prev = mine;
    setMine(n);
    setErr(null);
    try {
      localStorage.setItem(MY_VOTE_KEY(poll), String(n));
    } catch {
      /* ignore */
    }
    try {
      await castVote(poll, n);
    } catch {
      setMine(prev);
      try {
        if (prev) localStorage.setItem(MY_VOTE_KEY(poll), String(prev));
        else localStorage.removeItem(MY_VOTE_KEY(poll));
      } catch {
        /* ignore */
      }
      setErr(t.error);
    }
  };

  return (
    <section className="mt-8">
      <StatusPill live={open}>{open ? t.live : t.closed}</StatusPill>
      <h1 className="mt-4 font-display text-[28px] leading-[1.15] font-bold tracking-[-0.02em] [text-wrap:balance]">{content.question}</h1>

      <div className="mt-5 min-h-[56px]" aria-live="polite">
        {!open ? (
          <p className="rounded-2xl border border-[var(--validate)] bg-surface/70 p-4 text-[18px] font-semibold">{t.closed}</p>
        ) : mine ? (
          <p className="rounded-2xl border border-[var(--own)] bg-surface/70 p-4 text-[17px]">
            <span className="font-semibold text-own">✓ {t.thanks}</span> <span className="text-muted">{t.change}</span>
          </p>
        ) : (
          <p className="pt-3 text-[16px] text-muted">{t.tap}</p>
        )}
      </div>

      <div className="mt-4 space-y-3" role="group" aria-label={content.question}>
        {content.options.map((option, i) => {
          const n = i + 1;
          const on = mine === n;
          const { head, sub } = splitOption(option);
          return (
            <button
              key={n}
              type="button"
              disabled={!open}
              onClick={() => void vote(n)}
              aria-pressed={on}
              className="flex min-h-[72px] w-full items-center gap-4 rounded-2xl border bg-surface/80 px-4 py-3 text-left transition-[border-color,background-color,transform] duration-150 outline-none focus-visible:ring-2 focus-visible:ring-[var(--own)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B152B] active:scale-[0.99] disabled:opacity-60"
              style={{
                borderColor: on ? "var(--own)" : "var(--line)",
                backgroundColor: on ? "color-mix(in oklab, var(--own-fill) 14%, var(--surface))" : undefined,
              }}
            >
              <span
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border font-display text-[22px] font-bold"
                style={{ borderColor: on ? "var(--own)" : "var(--line)", color: on ? "var(--own)" : "var(--muted)" }}
                aria-hidden
              >
                {n}
              </span>
              <span className="min-w-0 flex-1 text-[18px] leading-snug">
                <span className="font-semibold">{head}</span>
                {sub ? <span className="block text-[15px] text-muted">{sub}</span> : null}
              </span>
              {on ? <span className="shrink-0 text-[20px] text-own" aria-hidden>✓</span> : null}
            </button>
          );
        })}
      </div>
      {err ? <p className="mt-4 text-[15px] text-[var(--fail)]" role="alert">{err}</p> : null}

      {mine || !open ? <LiveResults poll={poll} mine={mine} /> : null}
    </section>
  );
}

function LiveResults({ poll, mine }: { poll: PollId; mine: number | null }) {
  const { remote } = usePollCounts(poll);
  const total = remote.reduce((a, b) => a + b, 0);
  const labels = POLL_CONTENT[poll].options.map((o) => splitOption(o).head);
  return (
    <div className="mt-8 rounded-2xl border border-line bg-surface/60 p-4">
      <p className="flex items-baseline justify-between font-mono text-[12px] tracking-[0.14em] text-muted uppercase">
        <span>{t.results}</span>
        <span className="tabular-nums">{total} {total === 1 ? "vote" : "votes"}</span>
      </p>
      <div className="mt-3">
        <MiniBars labels={labels} counts={remote} highlight={mine} />
      </div>
    </div>
  );
}
