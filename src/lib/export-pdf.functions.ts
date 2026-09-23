import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Input = z.object({
  variant: z.enum(["slides", "notes"]).default("slides"),
  origin: z.string().url(),
  pin: z.string().max(64).optional(),
});

const lastRenderByIp = new Map<string, number>();

/** Renders /print to a 1920x1080 PDF via hosted headless Chrome, cached in storage. */
export const exportPdf = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => Input.parse(data))
  .handler(async ({ data }) => {
    try {
      const { signPrintToken, checkPin } = await import("./print-token.server");
      const { renderPdf, countPdfPages } = await import("./pdf-renderer.server");
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { getRequestHeader } = await import("@tanstack/react-start/server");

      if (data.variant === "notes" && !checkPin(data.pin)) {
        return { ok: false as const, error: "The presenter PIN is required for speaker notes." };
      }

      const path = `deck-${__DECK_VERSION__}-${data.variant}.pdf`;
      const bucket = supabaseAdmin.storage.from("exports");

      const { data: existing } = await bucket.list("", { search: path, limit: 1 });
      const hit = existing?.find((f) => f.name === path);
      if (hit) {
        const { data: signed, error } = await bucket.createSignedUrl(path, 600);
        if (error) throw error;
        const { TOTAL_SLIDES } = await import("@/content/slides");
        const pages = TOTAL_SLIDES * (data.variant === "notes" ? 2 : 1);
        return { ok: true as const, url: signed.signedUrl, pages, cached: true };
      }

      const ip =
        getRequestHeader("cf-connecting-ip") ??
        getRequestHeader("x-forwarded-for")?.split(",")[0]?.trim() ??
        "unknown";
      const now = Date.now();
      if (now - (lastRenderByIp.get(ip) ?? 0) < 30_000) {
        return { ok: false as const, error: "A render just ran. Try again in 30 seconds." };
      }
      lastRenderByIp.set(ip, now);

      const base = (process.env["PUBLIC_APP_URL"] ?? data.origin).replace(/\/$/, "");
      const host = new URL(base).hostname;
      if (host === "localhost" || host === "127.0.0.1") {
        return {
          ok: false as const,
          error: "PDF export only works on the online preview or published site.",
        };
      }

      const token = await signPrintToken(data.variant);
      const url = `${base}/print?variant=${data.variant}&token=${encodeURIComponent(token)}`;
      const pdf = await renderPdf(url, {
        width: 1920,
        height: 1080,
        readySelector: 'body[data-print-ready="true"]',
        timeoutMs: 30_000,
      });
      const pages = countPdfPages(pdf);

      const { error: upErr } = await bucket.upload(path, pdf, {
        contentType: "application/pdf",
        upsert: true,
        metadata: { pages: String(pages) },
      });
      if (upErr) throw upErr;
      const { data: signed, error } = await bucket.createSignedUrl(path, 600);
      if (error) throw error;
      return { ok: true as const, url: signed.signedUrl, pages, cached: false };
    } catch (e) {
      console.error("exportPdf failed", e);
      return {
        ok: false as const,
        error: e instanceof Error ? e.message : "Could not render the PDF.",
      };
    }
  });
