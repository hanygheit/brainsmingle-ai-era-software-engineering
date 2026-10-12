import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { POLL_IDS, STORED_POLLS } from "@/config";
import { votesFolder } from "./stored-votes";

const Pin = z.object({ pin: z.string().max(64) });

export const verifyPin = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => Pin.parse(d))
  .handler(async ({ data }) => {
    const { checkPin } = await import("./print-token.server");
    return { ok: await checkPin(data.pin), configured: true };
  });

export const verifyPrintAccess = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) =>
    z.object({ variant: z.enum(["slides", "notes"]), token: z.string().max(400) }).parse(d),
  )
  .handler(async ({ data }) => {
    const { verifyPrintToken } = await import("./print-token.server");
    try {
      return { ok: await verifyPrintToken(data.token, data.variant) };
    } catch {
      return { ok: false };
    }
  });

/** Clears every vote of one poll (poll_votes rows, plus the bucket votes of a stored poll). Requires the presenter PIN. */
export const resetPoll = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ pin: z.string().max(64), poll: z.enum(POLL_IDS) }).parse(d))
  .handler(async ({ data }) => {
    const { checkPin } = await import("./print-token.server");
    if (!(await checkPin(data.pin))) return { ok: false as const, error: "Wrong presenter PIN." };
    if (STORED_POLLS.includes(data.poll)) {
      try {
        const { listFiles, removeFiles } = await import("./store.server");
        const folder = votesFolder(data.poll);
        await removeFiles((await listFiles(folder)).map((f) => `${folder}/${f.name}`));
      } catch (e) {
        return { ok: false as const, error: e instanceof Error ? e.message : "Could not clear the votes." };
      }
      // Its old poll_votes rows are never read any more: tidy them up, best effort.
      try {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        await supabaseAdmin.from("poll_votes").delete().eq("poll_id", data.poll);
      } catch {
        /* ignore */
      }
      return { ok: true as const };
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("poll_votes").delete().eq("poll_id", data.poll);
    if (error) return { ok: false as const, error: error.message };
    return { ok: true as const };
  });
