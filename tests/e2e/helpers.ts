import { expect, type Page } from "@playwright/test";

// Opens the envelope the way a guest does: a tap, then the animation
// (about 3 s) until the envelope is gone and the invitation can scroll.
export async function openEnvelope(page: Page) {
  const envelope = page.getByRole("button", { name: /Open the invitation|افتحوا الدعوة/ });
  await envelope.click();
  await expect(envelope).toBeHidden({ timeout: 10_000 });
}
