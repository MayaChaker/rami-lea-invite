import { expect, test } from "@playwright/test";
import { DASHBOARD_PASSWORD } from "../../playwright.config";

// Bots: the hidden honeypot field, and the limits per visitor
// (src/lib/rateLimit.ts, counted by the fake database like the real one).

const FAKE_DB = "http://localhost:54321";

test.beforeEach(async ({ page }) => {
  await page.request.post(`${FAKE_DB}/__reset`);
});

async function sharedRsvp(page: import("@playwright/test").Page, name: string) {
  await page.goto("/");
  await page.getByRole("button", { name: "Skip" }).click();
  const form = page.locator("#rsvp");
  await form.scrollIntoViewIfNeeded();
  await form.getByPlaceholder("Your name").fill(name);
  await form.locator("select").first().selectOption("no");
  return form;
}

test("a person never sees or reaches the honeypot field", async ({ page }) => {
  const form = await sharedRsvp(page, "Nadine Saab");
  const trap = form.locator('input[name="rsvp_extra_info"]');
  await expect(trap).toHaveAttribute("tabindex", "-1");
  // The field sits in a 1×1 px box that cuts everything off, fully transparent
  const wrapper = trap.locator("..");
  const box = await wrapper.boundingBox();
  expect((box?.width ?? 0) * (box?.height ?? 0)).toBeLessThanOrEqual(1);
  await expect(wrapper).toHaveCSS("opacity", "0");
  await expect(wrapper).toHaveCSS("overflow", "hidden");
  // Hidden from screen readers too
  await expect(form.getByRole("textbox", { name: "rsvp_extra_info" })).toHaveCount(0);
});

test("a bot that fills every field sees a thank-you, but nothing is saved", async ({ page }) => {
  const form = await sharedRsvp(page, "Spam Bot");
  await form.locator('input[name="rsvp_extra_info"]').fill("http://spam.example", { force: true });
  await form.getByRole("button", { name: "Confirm RSVP" }).click();
  await expect(form.getByRole("heading", { name: "With gratitude" })).toBeVisible();
  expect(await (await page.request.get(`${FAKE_DB}/__rows`)).json()).toHaveLength(0);
});

test("after 20 new replies in an hour, a 21st from the same visitor is refused", async ({ page }) => {
  await page.request.post(`${FAKE_DB}/__seed`, { data: { kind: "rsvp", count: 20 } });
  const form = await sharedRsvp(page, "Reply Twenty One");
  await form.getByRole("button", { name: "Confirm RSVP" }).click();
  await expect(form.getByRole("alert")).toHaveText("Something went wrong, please try again.");
  expect(await (await page.request.get(`${FAKE_DB}/__rows`)).json()).toHaveLength(0);
});

test("one reply under the limit goes through", async ({ page }) => {
  await page.request.post(`${FAKE_DB}/__seed`, { data: { kind: "rsvp", count: 19 } });
  const form = await sharedRsvp(page, "Reply Twenty");
  await form.getByRole("button", { name: "Confirm RSVP" }).click();
  await expect(form.getByRole("heading", { name: "With gratitude" })).toBeVisible();
});

test("after 10 password attempts, even the right password must wait", async ({ page }) => {
  await page.request.post(`${FAKE_DB}/__seed`, { data: { kind: "login", count: 10 } });
  await page.goto("/dashboard");
  await page.getByLabel("Password").fill(DASHBOARD_PASSWORD);
  await page.getByRole("button", { name: "Open" }).click();
  await expect(page.getByRole("dialog").getByRole("alert")).toHaveText(
    "Too many attempts. Please wait 15 minutes and try again.",
  );
  await expect(page.getByText("Guests coming")).toHaveCount(0);
});

test("wrong passwords are really counted: the 11th attempt is refused", async ({ page }) => {
  test.slow(); // 10 wrong attempts, each paused on purpose by the server
  await page.goto("/dashboard");
  const dialog = page.getByRole("dialog");
  for (let i = 1; i <= 10; i++) {
    await page.getByLabel("Password").fill(`guess-${i}`);
    await page.getByRole("button", { name: "Open" }).click();
    await expect(dialog.getByRole("alert")).toHaveText("Wrong password, please try again.");
    await expect(page.getByRole("button", { name: "Open" })).toBeEnabled();
  }
  await page.getByLabel("Password").fill("guess-11");
  await page.getByRole("button", { name: "Open" }).click();
  await expect(dialog.getByRole("alert")).toHaveText("Too many attempts. Please wait 15 minutes and try again.");
});
