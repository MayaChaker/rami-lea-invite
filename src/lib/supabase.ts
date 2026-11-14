import "server-only";
import { createClient } from "@supabase/supabase-js";

// The connection to the database, for the server only.
// It uses the secret key, which can read and write everything, so it must
// never reach a browser: "server-only" makes the build fail if a client
// component ever imports this file.

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY;

if (!url || !key) {
  throw new Error("SUPABASE_URL and SUPABASE_SECRET_KEY must be set (see .env.local).");
}

export const db = createClient(url, key, {
  // No user logins on the server: nothing to keep between requests.
  auth: { persistSession: false, autoRefreshToken: false },
});
