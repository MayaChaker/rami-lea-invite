import "server-only";
import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { db } from "./supabase";

// Limits on how often one visitor may do something, against bots: a script
// sending thousands of RSVPs on the shared link, or guessing the dashboard
// password. Counted in the database (supabase/rate_limits.sql), because on
// Vercel each request may run on a different server with its own memory.
//
// The limits are generous on purpose: on Lebanese mobile networks many phones
// share one IP address, and a real family must never be blocked.
export const LIMITS = {
  rsvp: { limit: 20, windowSeconds: 60 * 60 }, // new shared-link replies per hour
  login: { limit: 10, windowSeconds: 15 * 60 }, // dashboard password attempts per 15 min
} as const;

export type LimitKind = keyof typeof LIMITS;

// The visitor, as a hash of their IP address: the address itself is never stored.
async function visitor(): Promise<string> {
  const h = await headers();
  const ip = h.get("x-real-ip") ?? h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  return createHash("sha256").update(`rate-limit:${ip}`).digest("hex").slice(0, 32);
}

/**
 * Records one attempt and says whether it is allowed.
 * If the check itself fails (database down, or the SQL not run yet), the
 * attempt is allowed: our own outage must never lock out a real guest.
 */
export async function allow(kind: LimitKind): Promise<boolean> {
  const { limit, windowSeconds } = LIMITS[kind];
  try {
    const { data, error } = await db().rpc("rate_limit_hit", {
      p_bucket: `${kind}:${await visitor()}`,
      p_limit: limit,
      p_window_seconds: windowSeconds,
    });
    if (error) throw new Error(error.message);
    return data !== false;
  } catch (e) {
    console.error(`rate limit (${kind}) not checked:`, e instanceof Error ? e.message : e);
    return true;
  }
}
