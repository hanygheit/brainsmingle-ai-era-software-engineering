import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { castVote, isPollId, POLL_CONTENT } from "@/lib/poll";

export const Route = createFileRoute("/vote")({
  validateSearch: (s) => z.object({ poll: z.string().catch("s2-challenge") }).parse(s),
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

function VotePage() {
  const { poll } = Route.useSearch();
  const [mine, setMine] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    try {
      const v = Number(localStorage.getItem(`ai-era-my-vote-${poll}`));
      if (v >= 1 && v <= 3) setMine(v);
    } catch {
      /* ignore */
    }
  }, [poll]);

  if (!isPollId(poll)) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-bg p-6 text-center text-text">
        <p className="text-[18px]">This poll doesn't exist. Scan the code on screen again.</p>
      </main>
    );
  }
  const content = POLL_CONTENT[poll];

  const vote = async (n: 1 | 2 | 3) => {
    setBusy(true);
    setErr(null);
    try {
      await castVote(poll, n);
      setMine(n);
      try {
        localStorage.setItem(`ai-era-my-vote-${poll}`, String(n));
      } catch {
        /* ignore */
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Vote failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-dvh bg-bg px-5 py-8 font-sans text-text">
      <div className="mx-auto max-w-md">
        <p className="font-mono text-[12px] tracking-[0.14em] text-muted uppercase">Live poll</p>
        <h1 className="mt-3 font-display text-[28px] leading-tight font-bold">{content.question}</h1>
        {mine ? (
          <p className="mt-4 rounded-lg border border-[var(--accent)] p-3 text-[17px]">
            Thanks — watch the screen. <span className="text-muted">You can change your vote.</span>
          </p>
        ) : null}
        <div className="mt-6 space-y-3">
          {([1, 2, 3] as const).map((n) => (
            <button
              key={n}
              disabled={busy}
              onClick={() => void vote(n)}
              aria-pressed={mine === n}
              className="flex min-h-[84px] w-full items-center gap-4 rounded-2xl border bg-surface px-5 text-left transition-colors"
              style={{ borderColor: mine === n ? "var(--accent)" : "var(--line)" }}
            >
              <span className="font-display text-[36px] font-bold text-muted">{n}</span>
              <span className="text-[18px]">{content.options[n - 1]}</span>
            </button>
          ))}
        </div>
        {err ? <p className="mt-4 text-[15px] text-[var(--fail)]">{err}</p> : null}
      </div>
    </main>
  );
}
