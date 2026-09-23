/** HMAC-signed short-lived tokens for the /print route. Server only. */

const enc = new TextEncoder();

async function key(secret: string) {
  return crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
    "verify",
  ]);
}

function b64url(bytes: ArrayBuffer | Uint8Array) {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let s = "";
  arr.forEach((b) => (s += String.fromCharCode(b)));
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export async function signPrintToken(variant: string, ttlSec = 120) {
  const secret = process.env["PRINT_TOKEN_SECRET"] ?? "dev-print-secret";
  const payload = `${variant}.${Date.now() + ttlSec * 1000}`;
  const sig = await crypto.subtle.sign("HMAC", await key(secret), enc.encode(payload));
  return `${payload}.${b64url(sig)}`;
}

export async function verifyPrintToken(token: string, variant: string) {
  const secret = process.env["PRINT_TOKEN_SECRET"] ?? "dev-print-secret";
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [tokenVariant, expires, sig] = parts as [string, string, string];
  if (tokenVariant !== variant) return false;
  if (Number(expires) < Date.now()) return false;
  const expected = await crypto.subtle.sign("HMAC", await key(secret), enc.encode(`${tokenVariant}.${expires}`));
  return b64url(expected) === sig;
}
