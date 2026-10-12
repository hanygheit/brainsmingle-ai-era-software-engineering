/**
 * Deck time gate. Server only. The full deck opens at DECK_UNLOCK_AT (server clock);
 * before that a presenter-PIN unlock token (HMAC-signed, expiring) opens it for one browser.
 */
import { DECK_UNLOCK_AT, UNLOCK_TOKEN_HOURS } from "@/config";
import { checkPin, safeEqual } from "./print-token.server";

const enc = new TextEncoder();

/** Unlock instant in ms. Local dev only: DECK_UNLOCK_AT_OVERRIDE simulates another time. */
export function unlockAtMs() {
  const override = import.meta.env.DEV ? process.env["DECK_UNLOCK_AT_OVERRIDE"] : undefined;
  const t = Date.parse(override || DECK_UNLOCK_AT);
  return Number.isFinite(t) ? t : Date.parse(DECK_UNLOCK_AT);
}

function secret() {
  const s = process.env["PRINT_TOKEN_SECRET"] || process.env["SUPABASE_SERVICE_ROLE_KEY"];
  if (s) return s;
  if (import.meta.env.DEV) return "local-dev-only-deck-unlock";
  throw new Error("No signing secret configured");
}

function b64url(bytes: ArrayBuffer) {
  let s = "";
  new Uint8Array(bytes).forEach((b) => (s += String.fromCharCode(b)));
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function sign(payload: string) {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret()), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return b64url(await crypto.subtle.sign("HMAC", key, enc.encode(`deck-unlock.${payload}`)));
}

export async function signUnlockToken() {
  const exp = Date.now() + UNLOCK_TOKEN_HOURS * 3600_000;
  return { token: `u1.${exp}.${await sign(String(exp))}`, exp };
}

/** Expiry (ms) of a valid, unexpired token; 0 otherwise. */
export async function verifyUnlockToken(token: string | null | undefined) {
  if (!token) return 0;
  const [v, exp, sig] = token.split(".");
  if (v !== "u1" || !exp || !sig || !(Number(exp) > Date.now())) return 0;
  try {
    return safeEqual(await sign(exp), sig) ? Number(exp) : 0;
  } catch {
    return 0;
  }
}

export async function gateStatus(token: string | null | undefined) {
  const now = Date.now();
  const unlockAt = unlockAtMs();
  const tokenExp = await verifyUnlockToken(token);
  return { now, unlockAt, open: now >= unlockAt || tokenExp > 0, tokenExp: tokenExp || null };
}

/** True when the full deck is open for this request (time passed or valid token). */
export async function isDeckOpen(token: string | null | undefined) {
  return (await gateStatus(token)).open;
}

/* ---------- PIN attempts: 5 wrong per client per 15 min, then a 15-min lockout ---------- */
const WINDOW_MS = 15 * 60_000;
const MAX_FAILS = 5;
const fails = new Map<string, { count: number; first: number }>();

async function clientKey() {
  try {
    const { getRequestHeader, getRequestIP } = await import("@tanstack/react-start/server");
    const fwd = getRequestHeader("x-forwarded-for")?.split(",")[0]?.trim();
    return getRequestHeader("cf-connecting-ip") || fwd || getRequestIP() || "unknown";
  } catch {
    return "unknown";
  }
}

export async function unlockWithPin(pin: string) {
  const key = await clientKey();
  const now = Date.now();
  const f = fails.get(key);
  if (f && now - f.first > WINDOW_MS) fails.delete(key);
  const cur = fails.get(key);
  if (cur && cur.count >= MAX_FAILS) {
    const minutes = Math.ceil((cur.first + WINDOW_MS - now) / 60_000);
    return { ok: false as const, error: `Too many attempts. Try again in ${minutes} min.` };
  }
  const devPin = import.meta.env.DEV ? process.env["DEV_PRESENTER_PIN"] : undefined;
  const ok = (devPin && pin === devPin) || (await checkPin(pin));
  if (!ok) {
    fails.set(key, { count: (cur?.count ?? 0) + 1, first: cur?.first ?? now });
    return { ok: false as const, error: "Wrong PIN." };
  }
  fails.delete(key);
  return { ok: true as const, ...(await signUnlockToken()) };
}
