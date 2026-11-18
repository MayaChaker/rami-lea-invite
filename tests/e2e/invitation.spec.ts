import { expect, test } from "@playwright/test";

// What a guest sees when they open their link.

test("English guest: their name on the envelope, which opens onto the invitation", async ({ page }) => {
  await page.goto("/i/rami-lea/haddad-7x2k");

  await expect(page.locator("main")).toHaveAttribute("lang", "en");
  await expect(page.locator("main")).toHaveAttribute("dir", "ltr");
  // The name on the envelope (it is also on the RSVP form)
  await expect(page.getByRole("button", { name: /The Haddad Family/ })).toBeVisible();

  await page.getByRole("button", { name: /Open the invitation/ }).click();
  // The envelope animates for about 3 s, then is removed from the page
  await expect(page.getByRole("button", { name: /Open the invitation/ })).toBeHidden({ timeout: 10_000 });
  await expect(page.getByRole("heading", { name: "RSVP" })).toBeAttached();
});

test("Arabic guest: right to left, Arabic name, only their events", async ({ page }) => {
  await page.goto("/i/rami-lea/khoury-m4q9");

  await expect(page.locator("main")).toHaveAttribute("lang", "ar");
  await expect(page.locator("main")).toHaveAttribute("dir", "rtl");
  await expect(page.getByRole("button", { name: /عائلة خوري الكريمة/ })).toBeVisible();

  await page.getByRole("button", { name: "تخطّي" }).click(); // Skip
  // Khoury is invited to the ceremony and reception, not the zaffe
  await expect(page.getByText("الإكليل", { exact: true })).toBeAttached();
  await expect(page.getByText("حفل الاستقبال", { exact: true })).toBeAttached();
  await expect(page.getByText("الزفّة", { exact: true })).toHaveCount(0);
});

test("Skip goes straight to the invitation", async ({ page }) => {
  await page.goto("/i/rami-lea/haddad-7x2k");
  await page.getByRole("button", { name: "Skip" }).click();
  await expect(page.getByRole("button", { name: "Skip" })).toBeHidden();
});

test("a guest whose phone asks for less motion skips the animation", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/i/rami-lea/haddad-7x2k");
  await expect(page.getByRole("button", { name: /Open the invitation/ })).toBeHidden();
});

// The status is 200, not 404: with Cache Components the page starts streaming
// before notFound() runs, and `dynamicParams = false` is not allowed. A proxy
// could send a 404, but it would run before every guest's page and slow it
// down. What matters is checked here: nothing about any guest is shown.
test("a made-up link shows 'not found', not someone else's invitation", async ({ page }) => {
  for (const path of ["/i/rami-lea/made-up", "/i/nobody/haddad-7x2k"]) {
    await page.goto(path);
    await expect(page.getByText("This page could not be found")).toBeVisible();
    await expect(page.getByText("The Haddad Family")).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "RSVP" })).toHaveCount(0);
  }
});

test("invitation pages ask search engines not to list them", async ({ page }) => {
  for (const path of ["/", "/i/rami-lea/haddad-7x2k"]) {
    await page.goto(path);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  }
});

test("the browser tab and the phone home screen show the couple's monogram icon", async ({ page, request }) => {
  await page.goto("/");
  for (const rel of ["icon", "apple-touch-icon"]) {
    const href = await page.locator(`link[rel="${rel}"]`).getAttribute("href");
    expect(href, rel).toBeTruthy();
    const response = await request.get(href!);
    expect(response.headers()["content-type"]).toBe("image/png");
  }
  // Not the default Next.js icon
  expect((await request.get("/favicon.ico")).status()).toBe(404);
});

test("the WhatsApp preview has a title and a picture", async ({ page, request }) => {
  await page.goto("/i/rami-lea/haddad-7x2k");
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", /Rami/);
  const image = await page.locator('meta[property="og:image"]').getAttribute("content");
  expect(image).toBeTruthy();
  // The picture's URL is absolute (for WhatsApp); fetch it from this test server
  const response = await request.get(new URL(image!).pathname + new URL(image!).search);
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("image/");
});
