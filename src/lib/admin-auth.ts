import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

// Minimal password-gated admin session. The password lives in the
// ADMIN_PASSWORD env var; the cookie is an HMAC-signed expiry stamp so it
// cannot be forged and rotating the password invalidates old sessions.
const COOKIE_NAME = "admin_session";
const SESSION_MS = 12 * 60 * 60 * 1000; // 12 hours

function adminPassword(): string {
  return process.env.ADMIN_PASSWORD ?? "";
}

export function isAdminConfigured(): boolean {
  return adminPassword().length > 0;
}

function sign(payload: string): string {
  return createHmac("sha256", adminPassword()).update(payload).digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export function checkPassword(input: string): boolean {
  const expected = adminPassword();
  if (expected === "") return false;
  return safeEqual(input, expected);
}

export async function createSession(): Promise<void> {
  const expiresAt = Date.now() + SESSION_MS;
  const payload = String(expiresAt);
  const store = await cookies();
  store.set(COOKIE_NAME, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: Math.floor(SESSION_MS / 1000),
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function isAdmin(): Promise<boolean> {
  // Read the cookie first so admin pages are always treated as dynamic and
  // never get statically prerendered with a baked-in "not signed in" result.
  const store = await cookies();
  if (!isAdminConfigured()) return false;
  const raw = store.get(COOKIE_NAME)?.value;
  if (!raw) return false;

  const [payload, signature] = raw.split(".");
  if (!payload || !signature) return false;
  if (!safeEqual(signature, sign(payload))) return false;

  const expiresAt = Number(payload);
  return Number.isFinite(expiresAt) && Date.now() < expiresAt;
}
