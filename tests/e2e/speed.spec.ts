import { appendFileSync } from "node:fs";
import { expect, test, type BrowserContext, type Page } from "@playwright/test";

// Speed of the invitation on a mid-range Android (CPU 4x slower than a
// laptop), empty cache: a guest opening the link from WhatsApp for the first
// time. Two networks:
//
// - 4G: an ordinary mobile connection. The project's targets apply here:
//   first content under 1 s, largest content under 2 s.
// - Slow 4G (Lighthouse's profile): a crowded or weak network, a stress test.
//   Its budgets are set just above today's numbers, so the page cannot get
//   heavier without the CI noticing.
const NETWORKS = {
  "4G": { latency: 60, downloadThroughput: (9 * 1024 * 1024) / 8, uploadThroughput: (1.5 * 1024 * 1024) / 8 },
  "Slow 4G": { latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 },
};

const TIME_BUDGET = {
  // The project's targets are FCP < 1 s and LCP < 2 s. LCP is held to its
  // target. FCP measures 0.7 to 1.1 s depending on how busy the CPU is (a CI
  // machine is slower than a laptop), so its budget leaves room for that.
  "4G": { fcpMs: 1500, lcpMs: 2000 },
  "Slow 4G": { fcpMs: 2500, lcpMs: 4500 },
};

// Bytes do not depend on the network: checked once, on Slow 4G
const BYTES_BUDGET = {
  jsKB: 160, // target 100
  fontsKB: { en: 130, ar: 310 },
  loadKB: { en: 1150, ar: 1150 }, // everything downloaded until the page "load" event
};

async function measure(page: Page, context: BrowserContext, path: string, network: keyof typeof NETWORKS) {
  const cdp = await context.newCDPSession(page);
  await cdp.send("Network.enable");
  await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });
  await cdp.send("Network.emulateNetworkConditions", { offline: false, ...NETWORKS[network] });
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
  const loadKB = Math.round(kb.all);
  await page.waitForTimeout(1500); // let the largest paint settle

  const { fcp, lcp } = await page.evaluate(() => ({
    fcp: Math.round(performance.getEntriesByName("first-contentful-paint")[0]?.startTime ?? -1),
    lcp: Math.round((window as unknown as { lcp?: number }).lcp ?? -1),
  }));
  return { fcp, lcp, jsKB: Math.round(kb.script), fontsKB: Math.round(kb.font), loadKB };
}

for (const network of Object.keys(NETWORKS) as (keyof typeof NETWORKS)[]) {
  for (const [lang, path] of [
    ["en", "/i/rami-lea/haddad-7x2k"],
    ["ar", "/i/rami-lea/khoury-m4q9"],
  ] as const) {
    test(`${lang} invitation on ${network} stays within its speed budget`, async ({ page, context }) => {
      const r = await measure(page, context, path, network);
      const time = TIME_BUDGET[network];

      test.info().annotations.push({ type: "speed", description: JSON.stringify(r) });
      console.log(`speed ${lang} ${network}:`, r);
      // On GitHub: a line in the run's summary page
      if (process.env.GITHUB_STEP_SUMMARY) {
        appendFileSync(
          process.env.GITHUB_STEP_SUMMARY,
          `| ${lang} | ${network} | ${r.fcp} / ${time.fcpMs} ms | ${r.lcp} / ${time.lcpMs} ms | ${r.jsKB} KB | ${r.fontsKB} KB | ${r.loadKB} KB |\n`,
        );
      }

      expect.soft(r.fcp, "first content (ms)").toBeLessThanOrEqual(time.fcpMs);
      expect.soft(r.lcp, "largest content (ms)").toBeLessThanOrEqual(time.lcpMs);
      if (network === "Slow 4G") {
        expect.soft(r.jsKB, "JavaScript (KB)").toBeLessThanOrEqual(BYTES_BUDGET.jsKB);
        expect.soft(r.fontsKB, "fonts (KB)").toBeLessThanOrEqual(BYTES_BUDGET.fontsKB[lang]);
        expect.soft(r.loadKB, "downloaded until load (KB)").toBeLessThanOrEqual(BYTES_BUDGET.loadKB[lang]);
      }
    });
  }
}
