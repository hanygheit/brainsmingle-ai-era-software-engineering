import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

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

/** Clears every vote of one poll. Requires the presenter PIN. */
export const resetPoll = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({ pin: z.string().max(64), poll: z.enum(["s2-challenge", "s7-interview"]) }).parse(d),
  )
  .handler(async ({ data }) => {
    const { checkPin } = await import("./print-token.server");
    if (!(await checkPin(data.pin))) return { ok: false as const, error: "Wrong presenter PIN." };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("poll_votes").delete().eq("poll_id", data.poll);
    if (error) return { ok: false as const, error: error.message };
    return { ok: true as const };
  });
