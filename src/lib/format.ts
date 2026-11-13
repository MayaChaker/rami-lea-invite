import type { Lang } from "./types";

// Dates are always shown in Lebanon's time zone, with Latin digits (19, not ١٩),
// and Lebanese month names in Arabic (حزيران, not يونيو).
export function formatDate(
  iso: string,
  lang: Lang,
  options: Intl.DateTimeFormatOptions,
): string {
  return new Intl.DateTimeFormat(lang === "ar" ? "ar-LB" : "en-GB", {
    ...options,
    timeZone: "Asia/Beirut",
    numberingSystem: "latn",
  }).format(new Date(iso));
}

/** Whole days from now until `iso` (0 once it has passed). Uses the clock, so
 *  only call it where the page is rendered per request. */
export function daysUntil(iso: string): number {
  return Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000));
}
