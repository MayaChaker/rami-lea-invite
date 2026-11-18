import { defineConfig, devices } from "@playwright/test";

// End-to-end tests: the real site, built for production, opened in a real
// browser on a phone screen, the way a guest opens it from WhatsApp.
// The database is a fake (tests/e2e/fake-supabase.mjs), so nothing real is
// read or written.

const PORT = 3100;
const FAKE_DB = 54321;
export const DASHBOARD_PASSWORD = "e2e-password";

export default defineConfig({
  testDir: "tests/e2e",
  // Tests share the fake database, so they run one after the other.
  workers: 1,
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI), // a forgotten test.only fails CI
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",

  use: {
    baseURL: `http://localhost:${PORT}`,
    ...devices["Pixel 5"],
    // On GitHub the browser Playwright downloads; on Maya's laptop Edge,
    // which Windows already has.
    channel: process.env.CI ? undefined : "msedge",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },

  webServer: [
    {
      command: "node tests/e2e/fake-supabase.mjs",
      port: FAKE_DB,
      reuseExistingServer: !process.env.CI,
    },
    {
      // A fresh production build, like on Vercel. Never an old server left
      // running: it would test old code and pass when it should fail.
      command: `npm run build && npx next start -p ${PORT}`,
      port: PORT,
      timeout: 300_000,
      reuseExistingServer: false,
      env: {
        SUPABASE_URL: `http://localhost:${FAKE_DB}`,
        SUPABASE_SECRET_KEY: "fake-secret-key-for-tests",
        DASHBOARD_PASSWORD,
      },
    },
  ],
});
