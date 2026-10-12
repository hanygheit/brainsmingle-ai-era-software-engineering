import { motion, useReducedMotion } from "framer-motion";
import { QRTile } from "@/components/kit";
import { VOTE_LINK_SHORT, voteUrl, type PollId } from "@/config";
import { usePrintMode } from "@/deck/print-mode";
import { POLL_CONTENT, splitOption, usePollCounts, usePollState } from "@/lib/poll";
import v from "@/content/vote.json";

/** Live horizontal bars: label, count and % per option; the leader takes the accent colour. Print shows no numbers. */
export function VoteBars({ poll, labels, compact = false, closed = false, closedNote = true }: { poll: PollId; labels?: string[] | undefined; compact?: boolean; closed?: boolean; closedNote?: boolean }) {
  const print = usePrintMode();
  const reduce = useReducedMotion();
  const { counts, total } = usePollCounts(poll);
  const opts = labels ?? POLL_CONTENT[poll].options;
  const max = Math.max(...counts);
  return (
    <div className="min-w-0 flex-1">
      <div className="flex items-center gap-[16px]">
        {print ? (
          <p className="font-mono text-[22px] text-muted">{v.printNote}</p>
        ) : (
          <>
            <span className="relative flex h-[14px] w-[14px]" aria-hidden>
              {closed ? null : <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--accent-fill,var(--accent))] opacity-40" />}
              <span className="relative inline-flex h-[14px] w-[14px] rounded-full" style={{ background: closed ? "var(--muted)" : "var(--accent-fill, var(--accent))" }} />
            </span>
            <motion.span
              key={total}
              className="font-display text-[44px] leading-none font-bold text-text tabular-nums"
              initial={reduce || total === 0 ? false : { scale: 1.18, opacity: 0.6 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              style={{ transformOrigin: "left center" }}
            >
              {total}
            </motion.span>
            <span className="font-mono text-[22px] text-muted" aria-live="polite">
              {total === 1 ? "vote" : "votes"}
              {closed && closedNote ? ` · ${v.closedOnSlide}` : ""}
            </span>
          </>
        )}
      </div>
      <div className={compact ? "mt-[22px] space-y-[20px]" : "mt-[28px] space-y-[30px]"}>
        {opts.map((label, i) => {
          const n = counts[i] ?? 0;
          const pct = total ? Math.round((n / total) * 100) : 0;
          const lead = !print && total > 0 && n === max;
          const { head, sub } = splitOption(label);
          return (
            <div key={label}>
              <div className="flex items-baseline gap-[16px]">
                <span
                  className="inline-flex h-[44px] w-[44px] shrink-0 items-center justify-center self-center rounded-[12px] border font-display text-[24px] font-bold"
                  style={{
                    borderColor: lead ? "var(--accent)" : "var(--line)",
                    color: lead ? "var(--accent)" : "var(--muted)",
                  }}
                >
                  {i + 1}
                </span>
                <p className={`min-w-0 flex-1 text-text ${compact ? "text-[26px]" : "text-[30px]"} leading-[1.25]`}>
                  <span className="font-semibold">{head}</span>
                  {sub ? <span className="text-muted"> — {sub}</span> : null}
                </p>
                {print ? null : (
                  <span className="shrink-0 font-mono text-[26px] tabular-nums" style={{ color: lead ? "var(--accent)" : "var(--muted)" }}>
                    {n} · {pct}%
                  </span>
                )}
              </div>
              <div className="mt-[10px] ml-[60px] h-[22px] overflow-hidden rounded-full" style={{ background: "color-mix(in oklab, var(--line) 70%, transparent)" }}>
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${pct}%`,
                    background: lead ? "var(--accent-fill, var(--accent))" : "color-mix(in oklab, var(--muted) 55%, transparent)",
                    transition: "width 300ms cubic-bezier(0.22, 1, 0.36, 1), background-color 300ms",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Poll slides: large QR + short link on the left, live bar chart on the right. */
export function LiveVote({ poll, labels }: { poll: PollId; labels?: string[] }) {
  const { state } = usePollState(5000);
  const closed = state ? !state[poll].open : false;
  return (
    <div className="flex items-start gap-[56px]">
      <div className="flex w-[380px] shrink-0 flex-col items-center text-center">
        <QRTile url={voteUrl(poll)} size={240} />
        <p className="mt-[18px] font-mono text-[26px] text-text">{VOTE_LINK_SHORT}</p>
        <p className="mt-[8px] text-[20px] leading-[1.35] text-muted">{closed ? v.closedOnSlide : v.scan}</p>
      </div>
      <VoteBars poll={poll} labels={labels} closed={closed} closedNote={false} />
    </div>
  );
}
