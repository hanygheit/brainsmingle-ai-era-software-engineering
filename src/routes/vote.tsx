import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Icon } from "@/components/deck/primitives";
import { slides } from "@/content/slides";
import { castVote, usePoll, type Choice } from "@/lib/poll";

export const Route = createFileRoute("/vote")({
  head: () => ({
    meta: [
      { title: "Vote live — Before You Put an AI Agent on Call" },
      {
        name: "description",
        content: "You are the on-call owner. Vote on what the agent may do at 03:07 — live at DevOpsDays Cairo 2026.",
      },
      { property: "og:title", content: "Vote live — What would you let this agent do?" },
      {
        property: "og:description",
        content: "Allow, depends or block — four actions, live on the big screen at DevOpsDays Cairo 2026.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: VotePage,
});

const pollSlide = slides.find((s) => s.layout === "poll")!;
const options = (pollSlide.data as { options: { icon: string; action: string; hint: string }[] }).options;
const CHOICES: [Choice, string][] = [
  ["allow", "Allow"],
  ["depends", "Depends"],
  ["block", "Block"],
];
const LS = "poll-my-votes";

function VotePage() {
  const { open } = usePoll();
  const [mine, setMine] = useState<Record<number, Choice>>({});
  const [busy, setBusy] = useState<number | null>(null);

  useEffect(() => {
    try {
      setMine(JSON.parse(localStorage.getItem(LS) ?? "{}"));
    } catch {
      /* ignore */
    }
  }, []);

  const vote = async (q: number, c: Choice) => {
    setBusy(q);
    try {
      await castVote(q, c);
      const next = { ...mine, [q]: c };
      setMine(next);
      localStorage.setItem(LS, JSON.stringify(next));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Vote failed.");
    } finally {
      setBusy(null);
    }
  };

  const done = Object.keys(mine).length === options.length;

  return (
    <main className="min-h-screen bg-navy px-5 py-8 text-term-text">
      <div className="mx-auto max-w-[560px]">
        <div className="flex items-center gap-3">
          <span className="block h-[3px] w-[30px] bg-gold" />
          <span className="font-mono text-[12px] tracking-[0.22em] text-term-text uppercase">
            {pollSlide.kicker}
          </span>
        </div>
        <h1 className="mt-4 font-sans text-[30px] leading-[1.15] font-bold text-white">{pollSlide.title}</h1>
        {!open ? (
          <p className="mt-4 border border-navy-line bg-navy-card px-4 py-3 font-mono text-[14px] text-gold">
            The poll is closed right now.
          </p>
        ) : null}

        <div className="mt-6 flex flex-col gap-4">
          {options.map((o, i) => {
            const q = i + 1;
            return (
              <section key={o.action} className="deck-card-dark p-5">
                <div className="flex items-center gap-4">
                  <span className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-full bg-gold text-navy">
                    <Icon name={o.icon} size={24} />
                  </span>
                  <div>
                    <h2 className="font-sans text-[20px] font-bold text-white">{o.action}</h2>
                    <p className="font-serif text-[16px] italic text-gray-light">{o.hint}</p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2" role="group" aria-label={`Vote on ${o.action}`}>
                  {CHOICES.map(([c, label]) => {
                    const on = mine[q] === c;
                    const tone =
                      c === "allow" ? "border-ok bg-ok" : c === "depends" ? "border-gold bg-gold" : "border-deny bg-deny";
                    return (
                      <button
                        key={c}
                        disabled={!open || busy === q}
                        onClick={() => void vote(q, c)}
                        aria-pressed={on}
                        className={`min-h-[52px] border font-mono text-[15px] font-bold tracking-[0.1em] uppercase transition-colors disabled:opacity-50 ${
                          on ? `${tone} text-white` : "border-navy-line text-term-text hover:border-gold"
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>

        {done ? (
          <div className="mt-6 border-l-[3px] border-gold pl-4" aria-live="polite">
            <p className="font-sans text-[24px] font-bold text-white">Thanks, look at the screen.</p>
            <p className="font-serif text-[16px] italic text-gray-light">You can change a vote any time.</p>
          </div>
        ) : null}
      </div>
    </main>
  );
}
