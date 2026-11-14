import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// The connection to the database, for the server only.
// It uses the secret key, which can read and write everything, so it must
// never reach a browser: "server-only" makes the build fail if a client
// component ever imports this file.
//
// The client is created on first use, not when the file is loaded: the build
// reads this file too, and it must not need the keys to do so.

let client: SupabaseClient | null = null;

export function db(): SupabaseClient {
  if (client) return client;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) {
    throw new Error("SUPABASE_URL and SUPABASE_SECRET_KEY must be set (.env.local, and in Vercel).");
  }

  client = createClient(url, key, {
    // No user logins on the server: nothing to keep between requests.
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}
