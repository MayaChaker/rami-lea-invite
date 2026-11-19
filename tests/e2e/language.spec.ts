import { expect, test } from "@playwright/test";
import { openEnvelope } from "./helpers";

// The language button in the top corner: the same invitation in the other
// language, on its own pre-built page.

test("an English guest can read the invitation in Arabic, and back", async ({ page }) => {
  await page.goto("/i/rami-lea/haddad-7x2k");
  const toArabic = page.getByRole("link", { name: "Read the invitation in Arabic" });
  await expect(toArabic).toHaveText("عربي");

  await toArabic.click();
  await expect(page).toHaveURL(/\/i\/rami-lea\/haddad-7x2k\/ar$/);
  await expect(page.locator("main")).toHaveAttribute("dir", "rtl");
  await expect(page.getByRole("button", { name: /عائلة حدّاد الكريمة/ })).toBeVisible();

  await page.getByRole("link", { name: "اقرأ الدعوة بالإنجليزية" }).click();
  await expect(page).toHaveURL(/\/i\/rami-lea\/haddad-7x2k\/en$/);
  await expect(page.locator("main")).toHaveAttribute("dir", "ltr");
});

test("an Arabic guest can read it in English", async ({ page }) => {
  await page.goto("/i/rami-lea/khoury-m4q9");
  const toEnglish = page.getByRole("link", { name: "اقرأ الدعوة بالإنجليزية" });
  await expect(toEnglish).toHaveText(/English/i);
  await toEnglish.click();
  await expect(page).toHaveURL(/\/khoury-m4q9\/en$/);
  await expect(page.getByRole("button", { name: /The Khoury Family/ })).toBeVisible();
  // Still only their events in the other language
  await openEnvelope(page);
  await expect(page.getByText("The zaffé", { exact: true })).toHaveCount(0);
});

test("the shared link switches too", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Read the invitation in Arabic" }).click();
  await expect(page).toHaveURL(/\/ar$/);
  await expect(page.locator("main")).toHaveAttribute("lang", "ar");
});

test("after opening the envelope, switching keeps the guest on the same screen, without the envelope", async ({ page }) => {
  await page.goto("/i/rami-lea/haddad-7x2k");
  await openEnvelope(page);
  await page.locator("#rsvp").scrollIntoViewIfNeeded();
  await page.getByRole("link", { name: "Read the invitation in Arabic" }).click();

  await expect(page).toHaveURL(/\/ar$/);
  await expect(page.getByRole("button", { name: /افتحوا الدعوة/ })).toHaveCount(0);
  await expect(page.locator("#rsvp")).toBeInViewport({ ratio: 0.9 });
});

test("before opening, switching shows the envelope in the other language", async ({ page }) => {
  await page.goto("/i/rami-lea/haddad-7x2k");
  await page.getByRole("link", { name: "Read the invitation in Arabic" }).click();
  await expect(page.getByRole("button", { name: /افتحوا الدعوة/ })).toBeVisible();
});

test("a reply made in one language is still there in the other", async ({ page }) => {
  await page.request.post("http://localhost:54321/__reset");
  await page.goto("/i/rami-lea/haddad-7x2k");
  await openEnvelope(page);
  await page.locator("#rsvp select").first().selectOption("yes");
  await page.getByRole("button", { name: "Confirm RSVP" }).click();
  await expect(page.getByRole("heading", { name: "With gratitude" })).toBeVisible();

  await page.getByRole("link", { name: "Read the invitation in Arabic" }).click();
  await expect(page).toHaveURL(/\/ar$/);
  await expect(page.locator("#rsvp")).toContainText("عائلة حدّاد الكريمة");
  await expect(page.locator("#rsvp select")).toHaveCount(0); // the thank-you, not the form
});

test("a language that does not exist shows 'not found'", async ({ page }) => {
  await page.goto("/i/rami-lea/haddad-7x2k/fr");
  await expect(page.getByText("This page could not be found")).toBeVisible();
});
