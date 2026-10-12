/** HMAC-signed short-lived tokens for the /print route. Server only. */

const enc = new TextEncoder();

function secret() {
  const s = process.env["PRINT_TOKEN_SECRET"];
  if (!s) throw new Error("PRINT_TOKEN_SECRET is not configured");
  return s;
}

async function key(s: string) {
  return crypto.subtle.importKey("raw", enc.encode(s), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
  ]);
}

function b64url(bytes: ArrayBuffer | Uint8Array) {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let s = "";
  arr.forEach((b) => (s += String.fromCharCode(b)));
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function signPrintToken(variant: string, ttlSec = 120) {
  const payload = `${variant}.${Date.now() + ttlSec * 1000}`;
  const sig = await crypto.subtle.sign("HMAC", await key(secret()), enc.encode(payload));
  return `${payload}.${b64url(sig)}`;
}

export async function verifyPrintToken(token: string, variant: string) {
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [tokenVariant, expires, sig] = parts as [string, string, string];
  if (tokenVariant !== variant) return false;
  if (!(Number(expires) > Date.now())) return false;
  const expected = await crypto.subtle.sign(
    "HMAC",
    await key(secret()),
    enc.encode(`${tokenVariant}.${expires}`),
  );
  return safeEqual(b64url(expected), sig);
}

/** Presenter PIN (4 digits), stored only as a salted PBKDF2-SHA256 hash. Server only. */
const PIN_HASH = {
  salt: "NSDL/Cg9SFyJe/s6Naqj5A==",
  iterations: 100_000, // Cloudflare Workers' PBKDF2 maximum
  hash: "dw2jSR91s1SAti0o15c3RZYulUpjtXDLk/2ucu16ZZg=",
};

const fromB64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

async function hashPin(pin: string) {
  const base = await crypto.subtle.importKey("raw", enc.encode(pin), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: fromB64(PIN_HASH.salt), iterations: PIN_HASH.iterations },
    base,
    256,
  );
  return btoa(String.fromCharCode(...new Uint8Array(bits)));
}

/** True when `pin` is the presenter PIN. A wrong PIN waits ~0.8 s to slow guessing. */
export async function checkPin(pin: string | undefined | null) {
  // Local dev only (compiled out of builds): a test PIN from the launch config, as in deck-gate.server.ts.
  const devPin = import.meta.env.DEV ? process.env["DEV_PRESENTER_PIN"] : undefined;
  if (devPin && pin === devPin) return true;
  const ok =!!pin && /^\d{4}$/.test(pin) && safeEqual(await hashPin(pin), PIN_HASH.hash);
  if (!ok) await new Promise((r) => setTimeout(r, 800));
  return ok;
}
