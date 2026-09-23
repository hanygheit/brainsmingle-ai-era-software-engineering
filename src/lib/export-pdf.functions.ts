import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Input = z.object({
  variant: z.enum(["slides", "notes"]).default("slides"),
  origin: z.string().url(),
});

const rateLimit = new Map<string, number>();

/** Renders the /print route to a 1920x1080 PDF through a hosted headless Chrome. */
export const exportPdf = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => Input.parse(data))
  .handler(async ({ data }) => {
    const { signPrintToken } = await import("./print-token.server");

    const token = process.env["BROWSERLESS_TOKEN"];
    if (!token) {
      return { ok: false as const, error: "PDF rendering is not configured yet." };
    }

    const now = Date.now();
    const last = rateLimit.get(data.variant) ?? 0;
    if (now - last < 30_000) {
      return { ok: false as const, error: "A render just ran. Try again in a few seconds." };
    }
    rateLimit.set(data.variant, now);

    const printToken = await signPrintToken(data.variant);
    const url = `${data.origin}/print?variant=${data.variant}&token=${encodeURIComponent(printToken)}`;
    const endpoint =
      process.env["APP_PDF_RENDERER_URL"] ??
      `https://production-sfo.browserless.io/pdf?token=${token}`;

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url,
        gotoOptions: { waitUntil: "networkidle2", timeout: 30000 },
        waitForSelector: { selector: 'body [data-print-ready="true"]', timeout: 30000 },
        options: {
          width: 1920,
          height: 1080,
          printBackground: true,
          preferCSSPageSize: true,
          margin: { top: "0", bottom: "0", left: "0", right: "0" },
        },
      }),
    });

    if (!res.ok) {
      return { ok: false as const, error: `Renderer returned ${res.status}.` };
    }

    const buf = new Uint8Array(await res.arrayBuffer());
    let binary = "";
    buf.forEach((b) => (binary += String.fromCharCode(b)));
    return { ok: true as const, base64: btoa(binary) };
  });
