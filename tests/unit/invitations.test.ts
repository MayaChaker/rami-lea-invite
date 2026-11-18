import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { allGuestPaths, getHomeInvitation } from "@/lib/getInvitation";
import { ramiLea } from "@/data/invitations/rami-lea";

// Checks every invitation data file. A mistake in the data still builds,
// but breaks the page for a guest; these tests catch it first.
const invitations = [ramiLea];

describe.each(invitations)("invitation $slug", (inv) => {
  it("every guest has a different token, long enough not to be guessed", () => {
    const tokens = inv.guests.map((g) => g.token);
    expect(new Set(tokens).size).toBe(tokens.length);
    for (const token of tokens) expect(token).toMatch(/^[a-z0-9-]{8,}$/);
  });

  it("every guest is invited to events that exist", () => {
    const ids = inv.events.map((e) => e.id);
    for (const g of inv.guests) {
      expect(g.events.length).toBeGreaterThan(0);
      for (const id of g.events) expect(ids).toContain(id);
    }
  });

  it("seats are between 1 and the RSVP maximum", () => {
    for (const g of inv.guests) {
      expect(g.seats).toBeGreaterThanOrEqual(1);
      expect(g.seats).toBeLessThanOrEqual(inv.rsvpMax);
    }
  });

  it("every photo exists in public/", () => {
    for (const path of Object.values(inv.media)) {
      if (typeof path !== "string" || !path.startsWith("/")) continue; // alt texts
      expect(existsSync(join("public", path)), path).toBe(true);
    }
  });

  it("dates are real, and replies close before the wedding", () => {
    const wedding = Date.parse(inv.date);
    expect(wedding).not.toBeNaN();
    expect(Date.parse(inv.rsvpBy)).toBeLessThan(wedding);
    for (const e of inv.events) expect(Date.parse(e.startsAt)).not.toBeNaN();
  });

  it("every text has both English and Arabic", () => {
    const texts = [
      inv.couple.groom, inv.couple.bride, inv.couple.families.groom, inv.couple.families.bride,
      inv.city, inv.letter, inv.media.heroAlt,
      ...inv.notes.flatMap((n) => [n.title, n.text]),
      ...inv.events.flatMap((e) => [e.label, e.time, e.place]),
      ...inv.guests.map((g) => g.name),
    ];
    for (const t of texts) {
      expect(t.en.trim(), JSON.stringify(t)).not.toBe("");
      expect(t.ar.trim(), JSON.stringify(t)).not.toBe("");
    }
  });
});

describe("getInvitation", () => {
  it("builds one page per guest", () => {
    expect(allGuestPaths()).toContainEqual({ slug: "rami-lea", token: "haddad-7x2k" });
    expect(allGuestPaths()).toHaveLength(invitations.reduce((n, i) => n + i.guests.length, 0));
  });

  it("the home page shows the first invitation", () => {
    expect(getHomeInvitation().slug).toBe("rami-lea");
  });
});
