import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

// The couple's dashboard is protected by a password (DASHBOARD_PASSWORD, in
// .env.local and in Vercel). After they type it once, a cookie keeps them in
// on that phone. The cookie holds a hash of the password, never the password,
// and changing the password signs everyone out.

export const COOKIE = "dashboard";
export const COOKIE_DAYS = 180;

const hash = (value: string) => createHash("sha256").update(`rami-lea-dashboard:${value}`).digest();

export function passwordIsSet(): boolean {
  return Boolean(process.env.DASHBOARD_PASSWORD);
}

// Compares in constant time, so the answer time does not leak the password.
function same(a: Buffer, b: Buffer): boolean {
  return a.length === b.length && timingSafeEqual(a, b);
}

export function checkPassword(typed: string): boolean {
  const real = process.env.DASHBOARD_PASSWORD;
  return Boolean(real) && same(hash(typed), hash(real!));
}

/** The cookie value for the current password. */
export function sessionValue(): string {
  return hash(process.env.DASHBOARD_PASSWORD ?? "").toString("hex");
}

export async function isSignedIn(): Promise<boolean> {
  if (!passwordIsSet()) return false;
  const value = (await cookies()).get(COOKIE)?.value ?? "";
  return same(Buffer.from(value), Buffer.from(sessionValue()));
}
