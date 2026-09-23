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

export function checkPin(pin: string | undefined | null) {
  const real = process.env["PRESENTER_PIN"];
  if (!real || !pin) return false;
  return safeEqual(pin, real);
}
