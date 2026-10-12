import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { STORED_POLLS, type PollId } from "@/config";
import opening from "@/content/opening.json";
import { tallyVoteFiles, voteFileName, VOTER_ID, votesFolder } from "./stored-votes";

/** Option count per stored poll (server-side validation of the option). */
const OPTION_COUNT: Partial<Record<PollId, number>> = { "s2-challenge": opening.poll.options.length };
const StoredPoll = z.enum(STORED_POLLS as [PollId, ...PollId[]]);

/** Short per-instance cache: every open slide, phone and presenter window polls every 2 s. */
const cache = new Map<PollId, { at: number; tally: ReturnType<typeof tallyVoteFiles> }>();

async function tally(poll: PollId) {
  const hit = cache.get(poll);
  if (hit && Date.now() - hit.at < 1000) return hit.tally;
  const { listFiles } = await import("./store.server");
  const t = tallyVoteFiles(await listFiles(votesFolder(poll)), OPTION_COUNT[poll] ?? 0);
  cache.set(poll, { at: Date.now(), tally: t });
  return t;
}

/** Public: one vote per voter id, upserted (a new answer replaces the old one). Rejected while the poll is closed. */
export const castStoredVote = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({ poll: StoredPoll, voter: z.string().regex(VOTER_ID), option: z.number().int().min(1) }).parse(d),
  )
  .handler(async ({ data }) => {
    if (data.option > (OPTION_COUNT[data.poll] ?? 0)) return { ok: false as const, error: "Unknown option." };
    const { listFiles, readJson, removeFiles, writeJson } = await import("./store.server");
    const state = await readJson<Record<string, { open?: boolean }>>("state/polls.json").catch(() => null);
    if (state?.[data.poll]?.open === false) return { ok: false as const, error: "Voting is closed." };
    const folder = votesFolder(data.poll);
    const name = voteFileName(data.voter, data.option);
    try {
      await writeJson(`${folder}/${name}`, { voter_id: data.voter, option: data.option, at: new Date().toISOString() });
      const old = (await listFiles(folder, data.voter)).filter((f) => f.name !== name && f.name.startsWith(`${data.voter}.`));
      await removeFiles(old.map((f) => `${folder}/${f.name}`));
      cache.delete(data.poll);
      return { ok: true as const };
    } catch (e) {
      return { ok: false as const, error: e instanceof Error ? e.message : "Could not save the vote." };
    }
  });

/** Public: live counts per option (same visibility as the poll_votes counts). */
export const getStoredCounts = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ poll: StoredPoll }).parse(d))
  .handler(async ({ data }) => (await tally(data.poll)).counts);

/** Public: one row per voter (option + time, no voter id) for the results CSV. */
export const getStoredVoteRows = createServerFn({ method: "GET" }).handler(async () =>
  (await Promise.all(STORED_POLLS.map(async (poll) => (await tally(poll)).rows.map((r) => ({ poll_id: poll, option: r.option, created_at: r.at }))))).flat(),
);
