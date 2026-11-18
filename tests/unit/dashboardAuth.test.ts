import { beforeEach, describe, expect, it, vi } from "vitest";
import { checkPassword, isSignedIn, passwordIsSet, sessionValue } from "@/lib/dashboardAuth";

// A fake cookie jar: isSignedIn reads the cookie with next/headers, which only
// works inside Next.js. Each test puts in it the cookie it wants.
const jar = vi.hoisted(() => ({ value: undefined as string | undefined }));
vi.mock("next/headers", () => ({
  cookies: async () => ({ get: () => (jar.value === undefined ? undefined : { value: jar.value }) }),
}));

beforeEach(() => {
  jar.value = undefined;
  vi.stubEnv("DASHBOARD_PASSWORD", "orange-tree-42");
});

describe("checkPassword", () => {
  it("accepts the right password", () => {
    expect(checkPassword("orange-tree-42")).toBe(true);
  });

  it.each(["", "orange", "Orange-tree-42", "orange-tree-42 ", "orange-tree-420"])("refuses %j", (typed) => {
    expect(checkPassword(typed)).toBe(false);
  });

  it("refuses everything when no password is set, even an empty one", () => {
    vi.stubEnv("DASHBOARD_PASSWORD", "");
    expect(passwordIsSet()).toBe(false);
    expect(checkPassword("")).toBe(false);
  });
});

describe("the cookie", () => {
  it("never holds the password itself", () => {
    expect(sessionValue()).not.toContain("orange-tree-42");
    expect(sessionValue()).toMatch(/^[0-9a-f]{64}$/);
  });

  it("the right cookie signs in", async () => {
    jar.value = sessionValue();
    expect(await isSignedIn()).toBe(true);
  });

  it.each([
    ["no cookie", undefined],
    ["an empty cookie", ""],
    ["a made-up cookie", "a".repeat(64)],
    ["the password itself", "orange-tree-42"],
  ])("%s does not sign in", async (_, value) => {
    jar.value = value;
    expect(await isSignedIn()).toBe(false);
  });

  it("changing the password signs everyone out", async () => {
    jar.value = sessionValue(); // signed in with the old password
    vi.stubEnv("DASHBOARD_PASSWORD", "new-password-77");
    expect(await isSignedIn()).toBe(false);
  });

  it("nobody is signed in when no password is set", async () => {
    vi.stubEnv("DASHBOARD_PASSWORD", "");
    jar.value = sessionValue(); // the cookie for an empty password
    expect(await isSignedIn()).toBe(false);
  });
});
