import type { PollId } from "@/config";

/**
 * Votes for STORED_POLLS live in the `exports` bucket as one empty-ish file per voter:
 * `votes/<poll>/<voterId>.<option>.json`. The option is in the name, so a tally is a
 * folder listing (no downloads). A changed vote writes the new file, then removes the old one;
 * if both briefly exist, the newest file per voter wins.
 */
export const votesFolder = (poll: PollId) => `votes/${poll}`;
export const VOTER_ID = /^[A-Za-z0-9-]{8,64}$/;
export const voteFileName = (voter: string, option: number) => `${voter}.${option}.json`;

export function parseVoteFile(name: string): { voter: string; option: number } | null {
  const m = /^([A-Za-z0-9-]{8,64})\.(\d)\.json$/.exec(name);
  return m ? { voter: m[1]!, option: Number(m[2]) } : null;
}

/** Latest vote per voter → counts per option (1-based options, `optionCount` long) and one row per voter. */
export function tallyVoteFiles(files: { name: string; at: string }[], optionCount: number) {
  const latest = new Map<string, { option: number; at: string }>();
  for (const f of files) {
    const v = parseVoteFile(f.name);
    if (!v || v.option < 1 || v.option > optionCount) continue;
    const prev = latest.get(v.voter);
    if (!prev || f.at >= prev.at) latest.set(v.voter, { option: v.option, at: f.at });
  }
  const counts = Array.from({ length: optionCount }, () => 0);
  const rows = [...latest.values()].sort((a, b) => a.at.localeCompare(b.at));
  rows.forEach((r) => counts[r.option - 1]!++);
  return { counts, rows };
}
