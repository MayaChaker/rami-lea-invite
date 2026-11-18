import { expect, test } from "@playwright/test";
import { DASHBOARD_PASSWORD } from "../../playwright.config";

// The couple's private dashboard, and what must never reach a guest.

const FAKE_DB = "http://localhost:54321";

test.beforeEach(async ({ page }) => {
  await page.request.post(`${FAKE_DB}/__reset`);
});

test("before the password: a card in the middle of the screen, and nothing about the guests", async ({ page }) => {
  const response = await page.goto("/dashboard");
  const dialog = page.getByRole("dialog", { name: "Rami & Lea" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByLabel("Password")).toBeFocused();

  // Not hidden, not blurred: not sent at all. Checked in the raw HTML.
  const html = await response!.text();
  for (const secret of ["Haddad", "Khoury", "Guests coming", "haddad-7x2k"]) {
    expect(html, secret).not.toContain(secret);
  }
});

test("a wrong password is refused", async ({ page }) => {
  await page.goto("/dashboard");
  await page.getByLabel("Password").fill("not-the-password");
  await page.getByRole("button", { name: "Open" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("alert")).toHaveText("Wrong password, please try again.");
  await expect(page.getByText("Guests coming")).toHaveCount(0);
});

test("the right password opens the dashboard, with the replies from the database", async ({ page, context }) => {
  // A guest replies first
  await page.goto("/i/rami-lea/haddad-7x2k");
  await page.getByRole("button", { name: "Skip" }).click();
  await page.locator("#rsvp select").first().selectOption("yes");
  await page.getByPlaceholder(/A note for/).fill("See you in Faraya");
  await page.getByRole("button", { name: "Confirm RSVP" }).click();
  await expect(page.getByRole("heading", { name: "With gratitude" })).toBeVisible();

  await page.goto("/dashboard");
  await page.getByLabel("Password").fill(DASHBOARD_PASSWORD);
  await page.getByRole("button", { name: "Open" }).click();

  await expect(page.getByText("Guests coming")).toBeVisible();
  await expect(page.getByText("See you in Faraya")).toBeVisible();

  // The cookie that keeps them signed in: JavaScript on the page cannot read
  // it, it is only sent to /dashboard, and it is not the password.
  const cookie = (await context.cookies()).find((c) => c.name === "dashboard");
  expect(cookie).toMatchObject({ httpOnly: true, path: "/dashboard", sameSite: "Lax" });
  expect(cookie!.value).not.toContain(DASHBOARD_PASSWORD);
  expect(await page.evaluate(() => document.cookie)).not.toContain("dashboard");

  // Signed in on this phone: no password next time
  await page.reload();
  await expect(page.getByText("Guests coming")).toBeVisible();
});

test("the dashboard is never listed by search engines", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
});

test("the database secret key never reaches the browser", async ({ page }) => {
  const scripts: string[] = [];
  page.on("response", async (r) => {
    if (r.request().resourceType() === "script") scripts.push(await r.text().catch(() => ""));
  });
  for (const path of ["/", "/i/rami-lea/haddad-7x2k", "/dashboard"]) {
    const html = await (await page.goto(path))!.text();
    await page.waitForLoadState("networkidle");
    expect(html).not.toContain("fake-secret-key-for-tests");
  }
  expect(scripts.length).toBeGreaterThan(0);
  for (const js of scripts) {
    expect(js).not.toContain("fake-secret-key-for-tests");
    expect(js).not.toContain(DASHBOARD_PASSWORD);
  }
});
