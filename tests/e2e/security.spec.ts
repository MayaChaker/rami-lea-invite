import { expect, test } from "@playwright/test";

// Security headers on every kind of page (see next.config.ts).

const PAGES = ["/", "/i/rami-lea/haddad-7x2k", "/dashboard", "/i/rami-lea/made-up"];

for (const path of PAGES) {
  test(`security headers on ${path}`, async ({ request }) => {
    const headers = (await request.get(path)).headers();
    expect(headers["content-security-policy"]).toContain("frame-ancestors 'none'");
    expect(headers["x-frame-options"]).toBe("DENY");
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(headers["permissions-policy"]).toContain("camera=()");
  });
}

test("another site cannot show the dashboard inside a frame", async ({ page, baseURL }) => {
  // A page on another origin (about:blank) that tries to frame the dashboard
  await page.setContent(`<iframe src="${baseURL}/dashboard" width="400" height="400"></iframe>`);
  const frame = page.frames().find((f) => f.url().includes("/dashboard"));
  // The browser refuses: the frame stays empty, no password field inside
  const field = frame ? await frame.locator("#password").count() : 0;
  expect(field).toBe(0);
});

test("another site (like Google Maps) never receives the guest's private link", async ({ page }) => {
  await page.goto("/i/rami-lea/haddad-7x2k");
  // 127.0.0.1 is another origin than localhost, like maps.google.com would be
  const sent = page.waitForRequest((r) => r.url().startsWith("http://127.0.0.1:54321/"));
  await page.evaluate(() => fetch("http://127.0.0.1:54321/__rows").catch(() => {}));
  const referer = (await sent).headers()["referer"] ?? "";
  expect(referer).not.toContain("haddad-7x2k"); // only the site's address, never the token
});
