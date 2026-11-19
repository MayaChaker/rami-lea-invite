import { beforeEach, describe, expect, it, vi } from "vitest";
import { allow, LIMITS } from "@/lib/rateLimit";

// The visitor's request headers, and a fake database with rpc()
const fake = vi.hoisted(() => ({
  headers: new Map<string, string>(),
  calls: [] as { fn: string; args: Record<string, unknown> }[],
  result: { data: true as unknown, error: null as { message: string } | null },
  throws: false,
}));

vi.mock("next/headers", () => ({
  headers: async () => ({ get: (name: string) => fake.headers.get(name) ?? null }),
}));

vi.mock("@/lib/supabase", () => ({
  db: () => {
    if (fake.throws) throw new Error("SUPABASE_URL and SUPABASE_SECRET_KEY must be set");
    return {
      rpc: async (fn: string, args: Record<string, unknown>) => {
        fake.calls.push({ fn, args });
        return fake.result;
      },
    };
  },
}));

beforeEach(() => {
  fake.headers = new Map([["x-forwarded-for", "203.0.113.7, 10.0.0.1"]]);
  fake.calls = [];
  fake.result = { data: true, error: null };
  fake.throws = false;
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("allow", () => {
  it("asks the database with this kind's limit and window", async () => {
    expect(await allow("login")).toBe(true);
    expect(fake.calls[0].fn).toBe("rate_limit_hit");
    expect(fake.calls[0].args).toMatchObject({ p_limit: LIMITS.login.limit, p_window_seconds: LIMITS.login.windowSeconds });
  });

  it("refuses when the database says the visitor is over the limit", async () => {
    fake.result = { data: false, error: null };
    expect(await allow("rsvp")).toBe(false);
  });

  it("never stores the IP address, only a hash of it", async () => {
    await allow("rsvp");
    const bucket = String(fake.calls[0].args.p_bucket);
    expect(bucket).toMatch(/^rsvp:[0-9a-f]{32}$/);
    expect(bucket).not.toContain("203.0.113.7");
  });

  it("the same visitor always gets the same bucket, another visitor another one", async () => {
    await allow("rsvp");
    await allow("rsvp");
    fake.headers = new Map([["x-forwarded-for", "198.51.100.1"]]);
    await allow("rsvp");
    const [a, b, c] = fake.calls.map((call) => call.args.p_bucket);
    expect(a).toBe(b);
    expect(c).not.toBe(a);
  });

  it("logins and replies are counted apart", async () => {
    await allow("rsvp");
    await allow("login");
    expect(fake.calls[0].args.p_bucket).not.toBe(fake.calls[1].args.p_bucket);
  });

  it("uses Vercel's x-real-ip first", async () => {
    fake.headers.set("x-real-ip", "198.51.100.1");
    await allow("rsvp");
    const withRealIp = fake.calls[0].args.p_bucket;
    fake.headers = new Map([["x-forwarded-for", "198.51.100.1"]]);
    await allow("rsvp");
    expect(fake.calls[1].args.p_bucket).toBe(withRealIp);
  });

  it.each([
    ["the database answers with an error", () => (fake.result = { data: null, error: { message: "function not found" } })],
    ["the database is not configured", () => (fake.throws = true)],
  ])("allows when %s: our outage never locks out a guest", async (_, breakIt) => {
    breakIt();
    expect(await allow("rsvp")).toBe(true);
  });
});
