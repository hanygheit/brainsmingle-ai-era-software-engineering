/**
 * One swappable entry point for headless-Chrome PDF rendering.
 * - APP_PDF_RENDERER_URL set → POST the same JSON body to your own Puppeteer service.
 * - otherwise → Browserless /pdf REST endpoint with BROWSERLESS_TOKEN.
 */
export interface RenderOptions {
  width: number;
  height: number;
  readySelector: string;
  timeoutMs: number;
}

export async function renderPdf(url: string, o: RenderOptions): Promise<Uint8Array> {
  const custom = process.env["APP_PDF_RENDERER_URL"];
  const token = process.env["BROWSERLESS_TOKEN"];
  if (!custom && !token) throw new Error("PDF rendering is not configured yet.");

  const endpoint =
    custom ?? `https://production-sfo.browserless.io/pdf?token=${encodeURIComponent(token!)}`;

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      url,
      viewport: { width: o.width, height: o.height, deviceScaleFactor: 1 },
      gotoOptions: { waitUntil: "networkidle2", timeout: o.timeoutMs },
      waitForSelector: { selector: o.readySelector, timeout: o.timeoutMs },
      options: {
        width: `${o.width}px`,
        height: `${o.height}px`,
        printBackground: true,
        preferCSSPageSize: true,
        displayHeaderFooter: false,
        margin: { top: "0", bottom: "0", left: "0", right: "0" },
      },
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error(`PDF renderer failed [${res.status}]: ${body}`);
    throw new Error(`The PDF service returned an error (${res.status}).`);
  }
  return new Uint8Array(await res.arrayBuffer());
}

export function countPdfPages(bytes: Uint8Array) {
  const text = new TextDecoder("latin1").decode(bytes);
  return (text.match(/\/Type\s*\/Page(?!s)/g) ?? []).length;
}
