import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { POLL_IDS, type PollId } from "@/config";
import { getFeedbackResults, type FeedbackEntry } from "@/lib/feedback.functions";
import { fetchVoteRows, POLL_CONTENT, splitOption, usePollCounts } from "@/lib/poll";
import { readPin, savePin } from "@/lib/presenter-pin";
import { downloadCsv, toCsv } from "@/lib/csv";
import { MiniBars, MobileShell } from "@/components/mobile/shell";
import fb from "@/content/feedback.json";

export const Route = createFileRoute("/results")({
  head: () => ({
    meta: [
      { title: "Results — AI-Era Software Engineering" },
      { name: "description", content: "Private presenter results for Hany Saad’s BrainsMingle AI Summit 2026 keynote: audience polls and session feedback." },
      { property: "og:title", content: "Results — AI-Era Software Engineering" },
      { property: "og:description", content: "Private audience poll and session feedback results for Hany Saad’s keynote." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ResultsPage,
});

const card = "mt-6 rounded-2xl border border-line bg-surface/60 p-4 sm:p-5";
const h2 = "font-mono text-[12px] tracking-[0.14em] text-muted uppercase";
const btn =
  "rounded-xl border border-line bg-surface/80 px-3 py-2 font-mono text-[13px] text-text outline-none hover:border-[var(--own)] focus-visible:ring-2 focus-visible:ring-[var(--own)] disabled:opacity-60";

function ResultsPage() {
  const load = useServerFn(getFeedbackResults);
  const [pin, setPin] = useState("");
  const [entries, setEntries] = useState<FeedbackEntry[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const unlock = async (p: string, quiet = false) => {
    if (!p) return;
    setBusy(true);
    setErr(null);
    try {
      const r = await load({ data: { pin: p } });
      if (!r.ok) {
        if (!quiet) setErr(r.error);
        return;
      }
      savePin(p);
      setPin(p);
      setEntries(r.entries);
    } catch {
      if (!quiet) setErr("Could not load the results. Try again.");
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    const saved = readPin();
    if (saved) void unlock(saved, true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!entries) {
    return (
      <MobileShell>
        <h1 className="mt-8 font-display text-[28px] font-bold tracking-[-0.02em]">Results</h1>
        <form
          className="mt-6"
          onSubmit={(e) => {
            e.preventDefault();
            void unlock(pin);
          }}
        >
          <label htmlFor="pin" className="text-[16px] font-semibold">Presenter PIN</label>
          <input
            id="pin"
            type="password"
            autoComplete="current-password"
            inputMode="numeric"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            maxLength={64}
            className="mt-2 w-full rounded-xl border border-line bg-surface/80 px-4 py-3 text-[18px] outline-none focus-visible:border-[var(--own)] focus-visible:ring-2 focus-visible:ring-[var(--own)]/40"
          />
          {err ? <p className="mt-3 text-[15px] text-[var(--fail)]" role="alert">{err}</p> : null}
          <button type="submit" disabled={busy || !pin} className="mt-4 min-h-[52px] w-full rounded-2xl bg-own-fill font-display text-[17px] font-bold text-[#0B152B] disabled:opacity-60">
            {busy ? "Checking…" : "Show results"}
          </button>
        </form>
      </MobileShell>
    );
  }

  return (
    <MobileShell wide>
      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-[28px] font-bold tracking-[-0.02em]">Results</h1>
        <div className="flex gap-2">
          <button className={btn} disabled={busy} onClick={() => void unlock(pin)}>{busy ? "Refreshing…" : "Refresh"}</button>
          <button
            className={btn}
            onClick={() => {
              savePin("");
              setEntries(null);
              setPin("");
            }}
          >
            Lock
          </button>
        </div>
      </div>
      {err ? <p className="mt-3 text-[15px] text-[var(--fail)]" role="alert">{err}</p> : null}
      <Polls />
      <Feedback entries={entries} />
    </MobileShell>
  );
}

/* ---------- polls ---------- */
function Polls() {
  const [csvBusy, setCsvBusy] = useState(false);
  const exportCsv = async () => {
    setCsvBusy(true);
    try {
      const rows = await fetchVoteRows();
      downloadCsv(
        "ai-era-polls.csv",
        toCsv(
          ["poll_id", "question", "option", "answer", "voted_at"],
          rows.map((r) => [r.poll_id, POLL_CONTENT[r.poll_id]?.question, r.option, POLL_CONTENT[r.poll_id]?.options[r.option - 1], r.created_at]),
        ),
      );
    } catch {
      alert("Could not export the votes. Try again.");
    } finally {
      setCsvBusy(false);
    }
  };
  return (
    <section className={card}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className={h2}>Polls · live</h2>
        <button className={btn} disabled={csvBusy} onClick={() => void exportCsv()}>Download CSV</button>
      </div>
      <div className="mt-4 grid gap-6 md:grid-cols-2">
        {POLL_IDS.map((p) => <PollResult key={p} poll={p} />)}
      </div>
    </section>
  );
}

function PollResult({ poll }: { poll: PollId }) {
  const { remote } = usePollCounts(poll);
  const total = remote.reduce((a, b) => a + b, 0);
  return (
    <div>
      <p className="font-mono text-[12px] text-muted">{poll}</p>
      <p className="mt-1 text-[17px] font-semibold">{POLL_CONTENT[poll].question}</p>
      <p className="mt-1 text-[14px] text-muted tabular-nums">{total} {total === 1 ? "vote" : "votes"}</p>
      <div className="mt-3">
        <MiniBars labels={POLL_CONTENT[poll].options.map((o) => splitOption(o).head)} counts={remote} />
      </div>
    </div>
  );
}

/* ---------- feedback ---------- */
function Feedback({ entries }: { entries: FeedbackEntry[] }) {
  const n = entries.length;
  const avg = n ? entries.reduce((a, e) => a + e.rating, 0) / n : 0;
  const dist = [5, 4, 3, 2, 1].map((r) => entries.filter((e) => e.rating === r).length);
  const parts = fb.valuable.options.map((o) => entries.filter((e) => e.valuable === o).length);
  const exportCsv = () =>
    downloadCsv(
      "ai-era-feedback.csv",
      toCsv(
        ["submitted_at", "rating", "most_valuable", "one_change_7_days", "comments", "name", "email", "ok_to_contact"],
        entries.map((e) => [e.submittedAt, e.rating, e.valuable ?? "", e.change, e.comments, e.name, e.email, e.contactOk ? "yes" : "no"]),
      ),
    );
  return (
    <>
      <section className={card}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className={h2}>Feedback</h2>
          <button className={btn} disabled={!n} onClick={exportCsv}>Download CSV</button>
        </div>
        <div className="mt-4 grid gap-6 md:grid-cols-3">
          <div>
            <p className="text-[14px] text-muted">Responses</p>
            <p className="font-display text-[40px] leading-none font-bold tabular-nums">{n}</p>
            <p className="mt-4 text-[14px] text-muted">Average rating</p>
            <p className="font-display text-[40px] leading-none font-bold tabular-nums">
              {n ? avg.toFixed(1) : "—"} <span className="text-[20px] text-validate">★</span>
            </p>
          </div>
          <div>
            <p className="mb-3 text-[14px] text-muted">Rating distribution</p>
            <MiniBars labels={["5 ★", "4 ★", "3 ★", "2 ★", "1 ★"]} counts={dist} />
          </div>
          <div>
            <p className="mb-3 text-[14px] text-muted">{fb.valuable.label}</p>
            <MiniBars labels={fb.valuable.options} counts={parts} />
          </div>
        </div>
      </section>

      <section className={card}>
        <h2 className={h2}>All responses</h2>
        {n ? (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[860px] border-collapse text-left text-[14px]">
              <thead className="text-muted">
                <tr className="border-b border-line">
                  {["When", "★", "Most valuable", "One change (7 days)", "Comments", "Name", "Email", "Contact"].map((h) => (
                    <th key={h} scope="col" className="px-2 py-2 font-mono text-[11px] font-normal tracking-[0.1em] uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...entries].reverse().map((e) => (
                  <tr key={e.id} className="border-b border-line/60 align-top">
                    <td className="px-2 py-2 whitespace-nowrap text-muted tabular-nums">{new Date(e.submittedAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short", hour12: true })}</td>
                    <td className="px-2 py-2 tabular-nums">{e.rating}</td>
                    <td className="px-2 py-2">{e.valuable ?? "—"}</td>
                    <td className="px-2 py-2">{e.change || "—"}</td>
                    <td className="max-w-[320px] px-2 py-2 whitespace-pre-wrap">{e.comments || "—"}</td>
                    <td className="px-2 py-2">{e.name || "—"}</td>
                    <td className="px-2 py-2 break-all">{e.email || "—"}</td>
                    <td className="px-2 py-2">{e.contactOk ? "Yes" : "No"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-3 text-[15px] text-muted">No responses yet.</p>
        )}
      </section>
    </>
  );
}
