// Makes the presenter PIN secrets for Lovable Cloud → Secrets.
// Usage: node scripts/hash-pin.mjs
// Asks for a 6–8 digit PIN twice (nothing is echoed), then prints PRESENTER_PIN_SALT and
// PRESENTER_PIN_HASH (base64, PBKDF2-SHA256, 100,000 iterations — the same as checkPin in
// src/lib/print-token.server.ts). The PIN itself is never printed, logged or written to disk.
import { pbkdf2Sync, randomBytes } from "node:crypto";

const ITERATIONS = 100_000; // must match PIN_ITERATIONS in src/lib/print-token.server.ts

/** Reads one line from the terminal without echoing it (or the first line of piped input). */
function askHidden(question) {
  return new Promise((resolve, reject) => {
    const { stdin, stdout } = process;
    if (!stdin.isTTY) {
      let buf = "";
      stdin.setEncoding("utf8");
      stdin.on("data", (d) => (buf += d));
      stdin.on("end", () => resolve(buf.split(/\r?\n/)[0] ?? ""));
      stdin.on("error", reject);
      return;
    }
    stdout.write(question);
    let value = "";
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding("utf8");
    const onData = (chunk) => {
      for (const ch of chunk) {
        if (ch === "\r" || ch === "\n") {
          done();
          resolve(value);
          return;
        }
        if (ch === "\u0003") {
          done();
          reject(new Error("Cancelled."));
          return;
        }
        if (ch === "\u007f" || ch === "\b") value = value.slice(0, -1);
        else value += ch;
      }
    };
    const done = () => {
      stdin.off("data", onData);
      stdin.setRawMode(false);
      stdin.pause();
      stdout.write("\n");
    };
    stdin.on("data", onData);
  });
}

try {
  const pin = (await askHidden("New presenter PIN (6–8 digits): ")).trim();
  if (!/^\d{6,8}$/.test(pin)) throw new Error("The PIN must be 6 to 8 digits.");
  if (process.stdin.isTTY) {
    const again = (await askHidden("Type it again: ")).trim();
    if (again !== pin) throw new Error("The two PINs don't match.");
  }
  const salt = randomBytes(16);
  const hash = pbkdf2Sync(pin, salt, ITERATIONS, 32, "sha256");
  console.log("\nAdd these two secrets in Lovable Cloud → Secrets:\n");
  console.log(`PRESENTER_PIN_SALT=${salt.toString("base64")}`);
  console.log(`PRESENTER_PIN_HASH=${hash.toString("base64")}`);
} catch (e) {
  console.error(e instanceof Error ? e.message : "Failed.");
  process.exit(1);
}
