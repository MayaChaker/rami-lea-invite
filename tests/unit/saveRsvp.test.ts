import { beforeEach, describe, expect, it, vi } from "vitest";
import { saveRsvp } from "@/app/i/[slug]/[token]/actions";

// A fake database. saveRsvp talks to Supabase with chained calls, e.g.
// db().from("rsvps").upsert(...). The fake records every call, and `await`
// on it gives back `fake.result`, which each test can change.
// vi.hoisted: vi.mock runs before the imports, so what it uses must exist
// before them too.
const fake = vi.hoisted(() => {
  const state = {
    calls: [] as { method: string; args: unknown[] }[],
    result: { data: null as unknown, error: null as { message: string } | null },
    query: {} as Record<string, unknown>,
  };
  for (const method of ["from", "upsert", "update", "insert", "eq", "is", "select", "single"]) {
    state.query[method] = (...args: unknown[]) => {
      state.calls.push({ method, args });
      return state.query;
    };
  }
  state.query.then = (resolve: (value: unknown) => void) => resolve(state.result);
  return state;
});

vi.mock("@/lib/supabase", () => ({ db: () => fake.query }));

const base = { slug: "rami-lea", answer: "yes", count: 2, message: "" };
// The arguments of the first call to `method`
const argsOf = (method: string) => fake.calls.find((c) => c.method === method)?.args;


beforeEach(() => {
  fake.calls = [];
  fake.result = { data: null, error: null };
  vi.spyOn(console, "error").mockImplementation(() => {}); // keep the output clean
});

describe("saveRsvp: refuses bad input", () => {
  it("an invitation that does not exist", async () => {
    expect(await saveRsvp({ ...base, slug: "nope", token: "haddad-7x2k" })).toEqual({ ok: false, error: "invalid" });
    expect(fake.calls).toHaveLength(0); // never reaches the database
  });

  it("an answer other than yes or no", async () => {
    expect(await saveRsvp({ ...base, token: "haddad-7x2k", answer: "maybe" })).toEqual({ ok: false, error: "invalid" });
  });

  it.each([0, -1, 8, 99, Number.NaN])("yes with %s people", async (count) => {
    expect(await saveRsvp({ ...base, token: "haddad-7x2k", count })).toEqual({ ok: false, error: "invalid" });
  });

  it("a personal link with a token that does not exist", async () => {
    expect(await saveRsvp({ ...base, token: "made-up" })).toEqual({ ok: false, error: "invalid" });
    expect(fake.calls).toHaveLength(0);
  });

  it("a shared-link reply without a real name", async () => {
    expect(await saveRsvp({ ...base, name: " a  " })).toEqual({ ok: false, error: "invalid" });
    expect(fake.calls).toHaveLength(0);
  });
});

describe("saveRsvp: personal link", () => {
  it("saves one row per guest, with the name from our data, not from the browser", async () => {
    const result = await saveRsvp({ ...base, token: "haddad-7x2k", name: "Someone else" });
    expect(result).toEqual({ ok: true });
    const [row, options] = argsOf("upsert") as [Record<string, unknown>, unknown];
    expect(row).toMatchObject({ invitation_slug: "rami-lea", guest_token: "haddad-7x2k", answer: "yes", count: 2 });
    expect(row.name).not.toBe("Someone else");
    expect(options).toEqual({ onConflict: "invitation_slug,guest_token" });
  });

  it("a decline always saves 0 people", async () => {
    await saveRsvp({ ...base, token: "haddad-7x2k", answer: "no", count: 5 });
    expect((argsOf("upsert") as [Record<string, unknown>])[0]).toMatchObject({ answer: "no", count: 0 });
  });

  it("trims the note and cuts it at 1000 characters", async () => {
    await saveRsvp({ ...base, token: "haddad-7x2k", message: `  ${"x".repeat(5000)}  ` });
    const row = (argsOf("upsert") as [Record<string, string>])[0];
    expect(row.message).toHaveLength(1000);
  });
});

describe("saveRsvp: shared link", () => {
  it("a new reply is inserted and its id is returned", async () => {
    fake.result = { data: { id: "11111111-1111-1111-1111-111111111111" }, error: null };
    const result = await saveRsvp({ ...base, name: "  Nadine   Saab " });
    expect(result).toEqual({ ok: true, id: "11111111-1111-1111-1111-111111111111" });
    expect((argsOf("insert") as [Record<string, unknown>])[0]).toMatchObject({ name: "Nadine Saab", guest_token: null });
  });

  it("changing a reply only touches a shared-link row of this invitation", async () => {
    const id = "22222222-2222-2222-2222-222222222222";
    fake.result = { data: [{ id }], error: null };
    expect(await saveRsvp({ ...base, name: "Nadine", id })).toEqual({ ok: true, id });
    expect(fake.calls).toContainEqual({ method: "eq", args: ["id", id] });
    expect(fake.calls).toContainEqual({ method: "eq", args: ["invitation_slug", "rami-lea"] });
    expect(fake.calls).toContainEqual({ method: "is", args: ["guest_token", null] });
  });

  it("an id that is not a UUID is ignored: a new row instead", async () => {
    fake.result = { data: { id: "33333333-3333-3333-3333-333333333333" }, error: null };
    await saveRsvp({ ...base, name: "Nadine", id: "1 OR 1=1" });
    expect(argsOf("update")).toBeUndefined();
    expect(argsOf("insert")).toBeDefined();
  });
});

describe("saveRsvp: when the database fails", () => {
  it("answers 'server' instead of crashing", async () => {
    fake.result = { data: null, error: { message: "connection refused" } };
    expect(await saveRsvp({ ...base, token: "haddad-7x2k" })).toEqual({ ok: false, error: "server" });
  });
});
