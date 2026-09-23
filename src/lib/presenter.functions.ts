import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Pin = z.object({ pin: z.string().max(64) });

export const verifyPin = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => Pin.parse(d))
  .handler(async ({ data }) => {
    const { checkPin } = await import("./print-token.server");
    if (!process.env["PRESENTER_PIN"]) return { ok: true as const, configured: false };
    return { ok: checkPin(data.pin), configured: true };
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

const PollAdmin = z.object({
  pin: z.string().max(64),
  session: z.string().max(40),
  action: z.enum(["reset", "open", "close"]),
});

export const pollAdmin = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => PollAdmin.parse(d))
  .handler(async ({ data }) => {
    const { checkPin } = await import("./print-token.server");
    if (process.env["PRESENTER_PIN"] && !checkPin(data.pin)) {
      return { ok: false as const, error: "Wrong presenter PIN." };
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    if (data.action === "reset") {
      const { error } = await supabaseAdmin.from("poll_votes").delete().eq("session_code", data.session);
      if (error) return { ok: false as const, error: error.message };
    }
    const { data: row } = await supabaseAdmin
      .from("poll_sessions")
      .select("version")
      .eq("session_code", data.session)
      .maybeSingle();
    const patch: { session_code: string; version: number; updated_at: string; is_open?: boolean } = {
      session_code: data.session,
      version: (row?.version ?? 0) + 1,
      updated_at: new Date().toISOString(),
    };
    if (data.action !== "reset") patch.is_open = data.action === "open";
    const { error } = await supabaseAdmin.from("poll_sessions").upsert(patch);
    if (error) return { ok: false as const, error: error.message };
    return { ok: true as const };
  });
