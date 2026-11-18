import { appendFileSync } from "node:fs";
import { expect, test } from "@playwright/test";

// Speed budgets: how heavy the invitation is, and how fast it shows, on a
// mid-range Android over a slow 4G, with an empty cache (a guest opening the
// link from WhatsApp for the first time).
//
// Today's numbers are above the project's targets (JS < 100 KB, LCP < 2 s).
// So these budgets are set just above today's numbers: they stop the page
// from getting heavier. Each speed fix lowers them, until they reach the targets.
const BUDGET = {
  jsKB: 160, // target 100
  fontsKB: { en: 130, ar: 310 },
  loadKB: { en: 1150, ar: 1150 }, // everything downloaded until the page "load" event
  lcpMs: 4500, // target 2000
};

// Lighthouse's "Slow 4G" and a phone 4x slower than a laptop
const SLOW_4G = { latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 };

for (const [lang, path] of [
  ["en", "/i/rami-lea/haddad-7x2k"],
  ["ar", "/i/rami-lea/khoury-m4q9"],
] as const) {
  test(`${lang} invitation stays within its speed budget`, async ({ page, context }) => {
    const cdp = await context.newCDPSession(page);
    await cdp.send("Network.enable");
    await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });
    await cdp.send("Network.emulateNetworkConditions", { offline: false, ...SLOW_4G });
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });

    // Bytes on the wire (compressed), by type
    const kb = { script: 0, font: 0, all: 0 };
    const types = new Map<string, string>();
    cdp.on("Network.responseReceived", (e) => types.set(e.requestId, e.type));
    cdp.on("Network.loadingFinished", (e) => {
      const type = types.get(e.requestId);
      kb.all += e.encodedDataLength / 1024;
      if (type === "Script") kb.script += e.encodedDataLength / 1024;
      if (type === "Font") kb.font += e.encodedDataLength / 1024;
    });

    await page.addInitScript(() => {
      new PerformanceObserver((list) => {
        const last = list.getEntries().at(-1);
        if (last) (window as unknown as { lcp: number }).lcp = last.startTime;
      }).observe({ type: "largest-contentful-paint", buffered: true });
    });

    await page.goto(path, { waitUntil: "load", timeout: 120_000 });
    const loaded = Math.round(kb.all);
    await page.waitForTimeout(1500); // let the largest paint settle

    const { fcp, lcp } = await page.evaluate(() => ({
      fcp: Math.round(performance.getEntriesByName("first-contentful-paint")[0]?.startTime ?? -1),
      lcp: Math.round((window as unknown as { lcp?: number }).lcp ?? -1),
    }));

    const result = { fcp, lcp, jsKB: Math.round(kb.script), fontsKB: Math.round(kb.font), loadKB: loaded };
    // Shown in the GitHub summary of every run, so the trend is visible
    test.info().annotations.push({ type: "speed", description: JSON.stringify(result) });
    console.log(`speed ${lang}:`, result);
    // On GitHub: a line in the run's summary page
    if (process.env.GITHUB_STEP_SUMMARY) {
      appendFileSync(
        process.env.GITHUB_STEP_SUMMARY,
        `| ${lang} | ${fcp} ms | ${lcp} ms / ${BUDGET.lcpMs} | ${result.jsKB} / ${BUDGET.jsKB} KB | ${result.fontsKB} KB | ${loaded} KB |\n`,
      );
    }

    expect.soft(result.jsKB, "JavaScript (KB)").toBeLessThanOrEqual(BUDGET.jsKB);
    expect.soft(result.fontsKB, "fonts (KB)").toBeLessThanOrEqual(BUDGET.fontsKB[lang]);
    expect.soft(result.loadKB, "downloaded until load (KB)").toBeLessThanOrEqual(BUDGET.loadKB[lang]);
    expect.soft(result.lcp, "LCP (ms)").toBeLessThanOrEqual(BUDGET.lcpMs);
  });
}
