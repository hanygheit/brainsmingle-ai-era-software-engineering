// Time-gate checks (Playwright) against a local dev server.
// Before unlock: start the dev server with DECK_UNLOCK_AT_OVERRIDE=2030-01-01T00:00:00Z and DEV_PRESENTER_PIN=<test pin>, then
//   DECK_TEST_PIN=<test pin> node scripts/test-gate.mjs before http://localhost:8084
// After unlock: start it with DECK_UNLOCK_AT_OVERRIDE=2020-01-01T00:00:00Z, then
//   node scripts/test-gate.mjs after http://localhost:8085
// (Both overrides and DEV_PRESENTER_PIN work in local dev only; builds ignore them.)
import { chromium } from "playwright";

const mode = process.argv[2];
const base = (process.argv[3] ?? "http://localhost:8080").replace(/\/$/, "");
const LOCK = "The full deck opens after the live session";
const S5 = "Everyone can build software now";
let failed = 0;
const check = (name, ok, extra = "") => {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${extra ? ` — ${extra}` : ""}`);
  if (!ok) failed++;
};

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
const page = await ctx.newPage();
const visible = (text, p = page) => p.getByText(text, { exact: false }).first().isVisible().catch(() => false);
const settle = (p = page) => p.waitForTimeout(1500);
const go = async (path, p = page) => {
  await p.goto(base + path, { waitUntil: "networkidle" });
  await settle(p);
};
const printReady = (p = page) =>
  p.waitForFunction(() => window.__PRINT_READY === true, null, { timeout: 20_000 }).then(() => true, () => false);

if (mode === "before") {
  const pin = process.env.DECK_TEST_PIN;
  if (!pin) throw new Error("Set DECK_TEST_PIN");

  await go("/");
  check("/ shows the lobby", (await visible("What we’ll cover")) && !(await visible(LOCK)));
  await go("/present/1");
  check("/present/1 shows the cold open", (await visible("Add secure authentication")) && !(await visible(LOCK)));
  await page.keyboard.press("ArrowRight");
  await settle();
  check("→ on slide 1 shows the lock screen", await visible(LOCK), page.url());
  await page.keyboard.press("ArrowRight");
  await settle();
  check("→ again stays on the lock screen at /present/2", page.url().endsWith("/present/2"), page.url());
  await page.keyboard.press("ArrowLeft");
  await settle();
  check("← returns to slide 1", page.url().endsWith("/present/1") && !(await visible(LOCK)), page.url());
  for (const key of ["o", "n", "d", "p"]) {
    await page.keyboard.press(key);
    await settle();
    const locked = await visible(LOCK);
    check(`key ${key.toUpperCase()} on slide 1 shows the lock screen`, locked);
    await page.getByRole("button", { name: "Back to the preview" }).click().catch(() => {});
    await settle();
  }
  await page.getByRole("button", { name: "Overview (O)" }).evaluate((b) => b.click());
  await settle();
  check("overview button shows the lock screen", await visible(LOCK));
  await page.getByRole("button", { name: "Back to the preview" }).click();
  await page.keyboard.press("g");
  await page.keyboard.press("2");
  await page.keyboard.press("0");
  await page.keyboard.press("Enter");
  await settle();
  check("G 20 shows the lock screen", await visible(LOCK));

  for (const path of ["/present/5", "/presenter", "/blueprint", "/print"]) {
    await go(path);
    check(`${path} shows the lock screen`, await visible(LOCK));
  }
  check("/present/5 has no slide content", !(await visible(S5)));
  check("/print never becomes ready", !(await page.evaluate(() => window.__PRINT_READY === true)));
  for (const path of ["/present/5", "/blueprint", "/print", "/presenter"]) {
    const html = await (await page.request.get(base + path)).text();
    check(`server HTML of ${path} has no locked content`, !html.includes(S5) && !html.includes("bp-section") && !html.includes("End of deck"));
  }

  for (const [path, text] of [["/vote", "Who"], ["/feedback", "Session feedback"]]) {
    await go(path);
    check(`${path} works`, (await visible(text)) && !(await visible(LOCK)));
  }

  // Wrong PIN, then the right one.
  await go("/present/5");
  await page.getByRole("button", { name: "Presenter? Enter PIN" }).click();
  await page.fill("#deck-pin", pin === "0000" ? "1111" : "0000");
  await page.getByRole("button", { name: "Unlock" }).click();
  await page.waitForTimeout(2000);
  check("wrong PIN fails with a clear error", (await visible("Wrong PIN.")) && (await visible(LOCK)));
  await page.fill("#deck-pin", pin);
  await page.getByRole("button", { name: "Unlock" }).click();
  await page.waitForTimeout(2000);
  check("correct PIN unlocks slide 5", (await visible(S5)) && !(await visible(LOCK)));
  check("token stored in localStorage", !!(await page.evaluate(() => localStorage.getItem("ai-era-unlock"))));
  await page.reload({ waitUntil: "networkidle" });
  await settle();
  check("unlock survives a reload", (await visible(S5)) && !(await visible(LOCK)));
  await page.keyboard.press("ArrowRight");
  await settle();
  check("→ moves on to slide 6", page.url().endsWith("/present/6") && !(await visible(LOCK)), page.url());

  const presenter = await ctx.newPage();
  await go("/presenter", presenter);
  check("presenter window opens with the token", (await visible("NEXT", presenter)) && !(await visible(LOCK, presenter)));
  await go("/blueprint", presenter);
  check("/blueprint opens with the token", !(await visible(LOCK, presenter)) && (await presenter.locator(".bp-section").count()) > 0);
  await presenter.goto(base + "/print", { waitUntil: "networkidle" });
  check("/print renders with the token", await printReady(presenter));

  // PDF: capture the real exportPdf call, then replay it without the token.
  await go("/present/1");
  const respP = page
    .waitForResponse(async (r) => r.url().includes("_serverFn") && r.request().method() === "POST" && (await r.text().catch(() => "")).includes("PDF"), { timeout: 10_000 })
    .catch(() => null);
  await page.keyboard.press("d");
  const req = (await respP)?.request();
  if (!req) check("captured the exportPdf request", false);
  else {
    const token = await page.evaluate(() => localStorage.getItem("ai-era-unlock"));
    const body = req.postData() ?? "";
    const headers = { ...req.headers() };
    const withToken = await (await page.request.post(req.url(), { data: body, headers })).text();
    const without = await (await page.request.post(req.url(), { data: body.split(token).join("u1.0.forged"), headers })).text();
    check("exportPdf with the token is not refused by the gate", !withToken.includes("opens after the live session"));
    check("exportPdf without a valid token is refused on the server", without.includes("opens after the live session"));
  }

  // Rate limit (last: it blocks this client for 15 minutes).
  const other = await browser.newContext();
  const p2 = await other.newPage();
  await go("/present/5", p2);
  await p2.getByRole("button", { name: "Presenter? Enter PIN" }).click();
  for (let i = 0; i < 6; i++) {
    await p2.fill("#deck-pin", pin === "0000" ? "1111" : "0000");
    await p2.getByRole("button", { name: "Unlock" }).click();
    await p2.waitForTimeout(1300);
  }
  check("repeated wrong PINs are rate-limited", await visible("Too many attempts", p2));
  check("a fresh browser without the token stays locked", await visible(LOCK, p2));
} else if (mode === "after") {
  for (const path of ["/present/5", "/presenter", "/blueprint"]) {
    await go(path);
    check(`${path} open without a PIN`, !(await visible(LOCK)));
  }
  await go("/present/1");
  await page.keyboard.press("ArrowRight");
  await settle();
  check("→ on slide 1 goes to slide 2", page.url().endsWith("/present/2") && !(await visible(LOCK)), page.url());
  await page.keyboard.press("o");
  await settle();
  check("overview opens", await visible("Overview"));
  await page.goto(base + "/print", { waitUntil: "networkidle" });
  check("/print renders", await printReady());
  check("no token was needed", !(await page.evaluate(() => localStorage.getItem("ai-era-unlock"))));
} else {
  throw new Error("mode: before | after");
}

await browser.close();
console.log(failed ? `\n${failed} check(s) failed` : "\nAll checks passed");
process.exit(failed ? 1 : 0);
