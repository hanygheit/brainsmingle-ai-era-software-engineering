import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { PDF_FILENAME } from "@/config";

const BUCKET = "exports";

function countPdfPages(bytes: Uint8Array) {
  const text = new TextDecoder("latin1").decode(bytes);
  return (text.match(/\/Type\s*\/Page(?!s)/g) ?? []).length;
}

/** Serves the uploaded deck PDF (PDF_FILENAME) from backend storage. No rendering happens here. */
export const exportPdf = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ token: z.string().max(400).nullish() }).passthrough().parse(d ?? {}))
  .handler(async ({ data }) => {
    const { isDeckOpen } = await import("./deck-gate.server");
    if (!(await isDeckOpen(data.token))) {
      return { ok: false as const, missing: true as const, error: "The PDF opens after the live session — Mon 12 Oct, 21:00 Cairo." };
    }
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const bucket = supabaseAdmin.storage.from(BUCKET);
      const { data: list } = await bucket.list("", { search: PDF_FILENAME, limit: 5 });
      const hit = list?.find((f) => f.name === PDF_FILENAME);
      if (!hit) return { ok: false as const, missing: true as const, error: "PDF available after the talk" };
      const { data: signed, error } = await bucket.createSignedUrl(PDF_FILENAME, 600, { download: PDF_FILENAME });
      if (error) throw error;
      return { ok: true as const, url: signed.signedUrl };
    } catch (e) {
      console.error("exportPdf failed", e);
      return { ok: false as const, missing: false as const, error: "Could not load the PDF. Try again." };
    }
  });

/** Upload date and page count of the stored PDF, for the presenter window. */
export const pdfInfo = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: list } = await supabaseAdmin.storage.from(BUCKET).list("", { search: PDF_FILENAME, limit: 5 });
  const hit = list?.find((f) => f.name === PDF_FILENAME);
  if (!hit) return { stored: false as const };
  const meta = (hit.metadata ?? {}) as Record<string, unknown>;
  const pages = Number((hit as { user_metadata?: Record<string, unknown> }).user_metadata?.["pages"] ?? meta["pages"] ?? 0);
  return { stored: true as const, uploadedAt: hit.updated_at ?? hit.created_at ?? null, pages, size: Number(meta["size"] ?? 0) };
});

/** PIN-protected upload that replaces the stored PDF. */
export const uploadPdf = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({ pin: z.string().max(64), base64: z.string().min(10).max(40_000_000) }).parse(d),
  )
  .handler(async ({ data }) => {
    const { checkPin } = await import("./print-token.server");
    if (!(await checkPin(data.pin))) return { ok: false as const, error: "Wrong presenter PIN." };
    const bin = atob(data.base64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    if (new TextDecoder("latin1").decode(bytes.slice(0, 5)) !== "%PDF-") {
      return { ok: false as const, error: "That file is not a PDF." };
    }
    const pages = countPdfPages(bytes);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.storage.from(BUCKET).upload(PDF_FILENAME, bytes, {
      contentType: "application/pdf",
      upsert: true,
      metadata: { pages: String(pages) },
    });
    if (error) return { ok: false as const, error: error.message };
    return { ok: true as const, pages, uploadedAt: new Date().toISOString() };
  });
