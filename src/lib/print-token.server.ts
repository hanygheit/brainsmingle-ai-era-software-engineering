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

/**
 * Presenter PIN. Its salted PBKDF2-SHA256 hash comes from the server env vars PRESENTER_PIN_HASH and
 * PRESENTER_PIN_SALT (base64, made by scripts/hash-pin.mjs; 6–8 digits). Server only.
 */
const PIN_ITERATIONS = 100_000; // Cloudflare Workers' PBKDF2 maximum; must match scripts/hash-pin.mjs

/**
 * TEMPORARY (talk day, 12 Oct 2026): until the two secrets are set, the old 4-digit PIN keeps working.
 * Its hash is already public in the git history, so it is weak. Delete this fallback once the secrets exist.
 */
const LEGACY_PIN = { salt: "NSDL/Cg9SFyJe/s6Naqj5A==", hash: "dw2jSR91s1SAti0o15c3RZYulUpjtXDLk/2ucu16ZZg=" };

const fromB64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

/** The configured hash and salt, or the temporary legacy PIN when either secret is missing. */
function pinSecret() {
  const hash = process.env["PRESENTER_PIN_HASH"]?.trim();
  const salt = process.env["PRESENTER_PIN_SALT"]?.trim();
  if (!hash || !salt) return LEGACY_PIN;
  return { hash, salt };
}

async function hashPin(pin: string, salt: string) {
  const base = await crypto.subtle.importKey("raw", enc.encode(pin), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: fromB64(salt), iterations: PIN_ITERATIONS },
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
  let ok = false;
  const secret = pinSecret();
  if (!!pin && /^\d{4,8}$/.test(pin)) {
    try {
      ok = safeEqual(await hashPin(pin, secret.salt), secret.hash);
    } catch {
      ok = false; // malformed salt in the env: refuse
    }
  }
  if (!ok) await new Promise((r) => setTimeout(r, 800));
  return ok;
}
