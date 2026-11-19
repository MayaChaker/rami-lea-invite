// A fake Supabase for the end-to-end tests. The site talks to it exactly as
// it talks to the real one (the same supabase-js calls, over HTTP), but the
// rows live in memory and vanish when the tests end. The real database is
// never touched.
//
// It understands only what the site uses on the `rsvps` table: insert,
// upsert, update and select, with eq./is. filters. The tests also use:
//   GET  /__rows   every row, to check what was saved
//   POST /__reset  empty the table
//   POST /__fail   make the next request fail, like a database that is down
//   POST /__seed   {"kind":"rsvp","count":20}: as if the visitor had already
//                  tried that many times (no need to fill a form 20 times)
//
// It also runs rate_limit_hit (supabase/rate_limits.sql) the same way: it
// counts each visitor's attempts in the window and refuses over the limit.
import { randomUUID } from "node:crypto";
import { createServer } from "node:http";

const PORT = Number(process.env.FAKE_SUPABASE_PORT ?? 54321);
let rows = [];
let failNext = false;
let hits = []; // rate limit attempts: { bucket, at }
let seeded = {}; // kind → attempts to add for every visitor

// ?invitation_slug=eq.rami-lea&guest_token=is.null → a test for each row
function filters(params) {
  const tests = [];
  for (const [key, value] of params) {
    if (["select", "order", "on_conflict", "columns"].includes(key)) continue;
    const [op, ...rest] = value.split(".");
    const expected = rest.join(".");
    if (op === "eq") tests.push((r) => String(r[key]) === expected);
    if (op === "is") tests.push((r) => r[key] === null);
  }
  return (r) => tests.every((t) => t(r));
}

function send(res, status, body, req) {
  // .single() asks for one object instead of an array
  const single = req?.headers.accept?.includes("vnd.pgrst.object");
  const data = single && Array.isArray(body) ? body[0] : body;
  res.writeHead(status, { "content-type": "application/json" });
  res.end(data === undefined ? "" : JSON.stringify(data));
}

createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  let raw = "";
  for await (const chunk of req) raw += chunk;
  const body = raw ? JSON.parse(raw) : null;

  if (url.pathname === "/__rows") return send(res, 200, rows);
  if (url.pathname === "/__reset") return (rows = []), (hits = []), (seeded = {}), send(res, 200, { ok: true });
  if (url.pathname === "/__fail") return (failNext = true), send(res, 200, { ok: true });

  if (url.pathname === "/__seed") return (seeded[body.kind] = body.count), send(res, 200, { ok: true });

  if (url.pathname === "/rest/v1/rpc/rate_limit_hit") {
    const { p_bucket, p_limit, p_window_seconds } = body;
    const since = Date.now() - p_window_seconds * 1000;
    const kind = p_bucket.split(":")[0];
    const recent = hits.filter((h) => h.bucket === p_bucket && h.at > since).length + (seeded[kind] ?? 0);
    if (recent >= p_limit) return send(res, 200, false);
    hits.push({ bucket: p_bucket, at: Date.now() });
    return send(res, 200, true);
  }

  if (url.pathname !== "/rest/v1/rsvps") return send(res, 404, { message: "not found" });
  if (failNext) {
    failNext = false;
    return send(res, 500, { message: "database is down (fake)" });
  }

  const match = filters(url.searchParams);
  const now = () => new Date().toISOString();

  if (req.method === "GET") {
    return send(res, 200, rows.filter(match), req);
  }

  if (req.method === "POST") {
    const conflict = url.searchParams.get("on_conflict")?.split(",");
    const incoming = Array.isArray(body) ? body : [body];
    const saved = incoming.map((row) => {
      const existing = conflict && rows.find((r) => conflict.every((c) => r[c] === row[c]));
      if (existing) return Object.assign(existing, row);
      const created = { id: randomUUID(), created_at: now(), ...row };
      rows.push(created);
      return created;
    });
    return send(res, 201, saved, req);
  }

  if (req.method === "PATCH") {
    const changed = rows.filter(match);
    for (const r of changed) Object.assign(r, body);
    return send(res, 200, changed, req);
  }

  send(res, 405, { message: "method not supported by the fake" });
}).listen(PORT, () => console.log(`fake supabase on http://localhost:${PORT}`));
