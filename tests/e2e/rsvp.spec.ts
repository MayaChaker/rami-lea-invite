import { expect, test, type Page } from "@playwright/test";

// The RSVP, from the guest's tap to the row in the database. The database is
// the fake one (tests/e2e/fake-supabase.mjs): we ask it what was saved.

const FAKE_DB = "http://localhost:54321";

type Row = { id: string; guest_token: string | null; name: string; answer: string; count: number; message: string };

async function savedRows(page: Page): Promise<Row[]> {
  return (await page.request.get(`${FAKE_DB}/__rows`)).json();
}

// Open the invitation and go straight to the RSVP card
async function openRsvp(page: Page, path: string) {
  await page.goto(path);
  await page.getByRole("button", { name: "Skip" }).click();
  const form = page.locator("#rsvp");
  await form.scrollIntoViewIfNeeded();
  return {
    form,
    answer: form.locator("select").first(),
    count: form.getByLabel("Number attending"),
    note: form.getByPlaceholder(/A note for/),
    name: form.getByPlaceholder("Your name"),
    send: form.getByRole("button", { name: "Confirm RSVP" }),
  };
}

test.beforeEach(async ({ page }) => {
  await page.request.post(`${FAKE_DB}/__reset`);
});

test.describe("personal link", () => {
  test("a guest accepts for 3 people with a note: saved once, under their name", async ({ page }) => {
    const rsvp = await openRsvp(page, "/i/rami-lea/haddad-7x2k");

    await rsvp.answer.selectOption("yes");
    await rsvp.count.selectOption("3");
    await rsvp.note.fill("Can't wait!");
    await rsvp.send.click();

    await expect(rsvp.form.getByRole("heading", { name: "With gratitude" })).toBeVisible();
    await expect(rsvp.form.getByText("The Haddad Family · 3 attending")).toBeVisible();

    const rows = await savedRows(page);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      guest_token: "haddad-7x2k",
      name: "The Haddad Family",
      answer: "yes",
      count: 3,
      message: "Can't wait!",
    });
  });

  test("the reply is still there after closing the page, and changing it updates the same row", async ({ page }) => {
    let rsvp = await openRsvp(page, "/i/rami-lea/haddad-7x2k");
    await rsvp.answer.selectOption("yes");
    await rsvp.send.click();
    await expect(rsvp.form.getByRole("heading", { name: "With gratitude" })).toBeVisible();

    // Next day, same phone: the thank-you is shown, not an empty form
    rsvp = await openRsvp(page, "/i/rami-lea/haddad-7x2k");
    await expect(rsvp.form.getByRole("heading", { name: "With gratitude" })).toBeVisible();

    // Plans changed
    await rsvp.form.getByRole("button", { name: "Change reply" }).click();
    await rsvp.answer.selectOption("no");
    await rsvp.send.click();
    await expect(rsvp.form.getByText("Regretfully declined")).toBeVisible();

    const rows = await savedRows(page);
    expect(rows).toHaveLength(1); // updated, not a second reply
    expect(rows[0]).toMatchObject({ answer: "no", count: 0 });
  });

  test("sending without choosing an answer asks for one, and saves nothing", async ({ page }) => {
    const rsvp = await openRsvp(page, "/i/rami-lea/haddad-7x2k");
    await rsvp.send.click();
    await expect(rsvp.form.getByRole("alert")).toHaveText("Choose one of the two answers first.");
    expect(await savedRows(page)).toHaveLength(0);
  });

  test("the guest picks from 1 to 7 people, starting at their seats", async ({ page }) => {
    const rsvp = await openRsvp(page, "/i/rami-lea/haddad-7x2k");
    await rsvp.answer.selectOption("yes");
    await expect(rsvp.count.locator("option")).toHaveText(["1", "2", "3", "4", "5", "6", "7"]);
    await expect(rsvp.count).toHaveValue("2"); // Haddad has 2 seats
  });
});

test.describe("shared link", () => {
  test("the guest must write a name, then the reply is saved without a token", async ({ page }) => {
    const rsvp = await openRsvp(page, "/");
    await rsvp.answer.selectOption("no");
    await rsvp.send.click();
    await expect(rsvp.form.getByRole("alert")).toHaveText("Please write your name first.");
    expect(await savedRows(page)).toHaveLength(0);

    await rsvp.name.fill("Nadine Saab");
    await rsvp.send.click();
    await expect(rsvp.form.getByText("Nadine Saab · Regretfully declined")).toBeVisible();

    const rows = await savedRows(page);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ guest_token: null, name: "Nadine Saab", answer: "no", count: 0 });
  });

  test("changing a shared-link reply updates the same row", async ({ page }) => {
    const rsvp = await openRsvp(page, "/");
    await rsvp.name.fill("Nadine Saab");
    await rsvp.answer.selectOption("no");
    await rsvp.send.click();
    await rsvp.form.getByRole("button", { name: "Change reply" }).click();
    await rsvp.answer.selectOption("yes");
    await rsvp.send.click();
    await expect(rsvp.form.getByText("Nadine Saab · 1 attending")).toBeVisible();

    const rows = await savedRows(page);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ answer: "yes", count: 1 });
  });
});

test("when the database is down, the guest is asked to try again, and the retry works", async ({ page }) => {
  const rsvp = await openRsvp(page, "/i/rami-lea/haddad-7x2k");
  await rsvp.answer.selectOption("yes");

  await page.request.post(`${FAKE_DB}/__fail`); // the next request fails
  await rsvp.send.click();
  await expect(rsvp.form.getByRole("alert")).toHaveText("Something went wrong, please try again.");
  await expect(rsvp.send).toBeVisible(); // the form and the answer are kept

  await rsvp.send.click();
  await expect(rsvp.form.getByRole("heading", { name: "With gratitude" })).toBeVisible();
  expect(await savedRows(page)).toHaveLength(1);
});
