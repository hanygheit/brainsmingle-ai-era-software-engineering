import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { CheckCircle2 } from "lucide-react";
import { castVote, isPollId, POLL_CONTENT } from "@/lib/poll";
import { EVENT, SPEAKER } from "@/config";
import opening from "@/content/opening.json";
import monogram from "@/assets/hs-monogram.png.asset.json";
import { BrandBar } from "@/components/screens/shared";

const TALK_TITLE = opening.s0.title;

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
    <main className="deck-room relative min-h-dvh overflow-hidden px-5 pt-6 pb-10 font-sans text-text" style={{ ["--ambient" as string]: "#5EE6AA" }}>
      <div className="room-backdrop" aria-hidden />
      <div className="relative mx-auto max-w-md">
        <header className="flex items-center gap-3">
          <img src={monogram.url} alt="" className="h-[32px] w-[32px]" />
          <div className="min-w-0 leading-tight">
            <p className="truncate font-display text-[15px] font-bold">{TALK_TITLE}</p>
            <p className="truncate font-mono text-[11px] tracking-[0.12em] text-muted uppercase">{EVENT.name}</p>
          </div>
        </header>

        <p className="mt-10 inline-flex items-center gap-2 rounded-full border border-line px-3 py-1.5 font-mono text-[12px] tracking-[0.14em] text-muted uppercase">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-own-fill opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-own-fill" />
          </span>
          Live poll
        </p>
        <h1 className="mt-4 font-display text-[30px] leading-[1.1] font-bold tracking-[-0.02em] [text-wrap:balance]">{content.question}</h1>
        <div className="mt-5">
          <BrandBar width={120} height={3} />
        </div>

        {mine ? (
          <p className="glass mt-6 flex items-start gap-3 rounded-2xl border border-[var(--own)] p-4 text-[16px]">
            <CheckCircle2 className="mt-[2px] h-5 w-5 shrink-0 text-own" />
            <span>
              Thanks — watch the screen. <span className="text-muted">You can change your vote.</span>
            </span>
          </p>
        ) : null}
        <div className="mt-6 space-y-3">
          {([1, 2, 3] as const).map((n) => {
            const on = mine === n;
            return (
              <button
                key={n}
                disabled={busy}
                onClick={() => void vote(n)}
                aria-pressed={on}
                className="glass flex min-h-[84px] w-full items-center gap-4 rounded-2xl border px-5 text-left transition-[border-color,background-color,transform] duration-200 active:scale-[0.99] disabled:opacity-70"
                style={{
                  borderColor: on ? "var(--own)" : "var(--line)",
                  backgroundColor: on ? "color-mix(in oklab, var(--own-fill) 12%, var(--surface))" : undefined,
                }}
              >
                <span
                  className="flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-xl border font-display text-[24px] font-bold"
                  style={{ borderColor: on ? "var(--own)" : "var(--line)", color: on ? "var(--own)" : "var(--muted)" }}
                >
                  {n}
                </span>
                <span className="flex-1 text-[18px] leading-snug">{content.options[n - 1]}</span>
                {on ? <CheckCircle2 className="h-5 w-5 shrink-0 text-own" aria-hidden /> : null}
              </button>
            );
          })}
        </div>
        {err ? <p className="mt-4 text-[15px] text-[var(--fail)]">{err}</p> : null}

        <footer className="mt-12 flex items-center justify-between border-t border-line pt-5 font-mono text-[11px] tracking-[0.12em] text-muted uppercase">
          <span>{SPEAKER.name}</span>
          <span>{EVENT.track}</span>
        </footer>
      </div>
    </main>
  );
}
