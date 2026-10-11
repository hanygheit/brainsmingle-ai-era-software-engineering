// Offline PDF export: renders /print in headless Chromium (Playwright) and writes the PDF.
// Usage: node scripts/export-pdf.mjs [baseUrl] [outFile]
import { chromium } from "playwright";

const LIVE = "https://brainsmingle-ai-era-software-engineering.lovable.app";
const base = (process.argv[2] ?? LIVE).replace(/\/$/, "");
const out = process.argv[3] ?? "AI-Era-Software-Engineering_Hany-Saad_BrainsMingle-2026.pdf";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
// Lovable-hosted assets (/__l5e/…: monogram, QR images) only exist on the published site;
// when rendering a local dev server, fetch them from there.
if (base !== LIVE) {
  await page.route("**/__l5e/**", async (route) => {
    const res = await fetch(LIVE + new URL(route.request().url()).pathname);
    await route.fulfill({
      status: res.status,
      contentType: res.headers.get("content-type") ?? undefined,
      body: Buffer.from(await res.arrayBuffer()),
    });
  });
}
await page.goto(`${base}/print`, { waitUntil: "networkidle", timeout: 120_000 });
await page.waitForFunction(() => window.__PRINT_READY === true, null, { timeout: 120_000 });
await page.emulateMedia({ media: "print" });
await page.pdf({
  path: out,
  width: "1920px",
  height: "1080px",
  printBackground: true,
  preferCSSPageSize: true,
  tagged: true,
  outline: true,
});
await browser.close();
console.log(`Wrote ${out}`);
