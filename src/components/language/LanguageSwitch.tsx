"use client";

import { useEffect } from "react";
import type { Lang } from "@/lib/types";
import styles from "./LanguageSwitch.module.css";

// A small button in the top corner of every screen: the same invitation in
// the other language. Each language is its own static page (…/en, …/ar), so
// switching costs nothing in speed.
//
// A guest who switches after opening the envelope does not see it again, and
// lands on the same screen: the screen number travels in sessionStorage.

const KEY = "invitation:resume-screen";
export const SKIP_ENVELOPE = "invitation:skip-envelope"; // listened to by Envelope

type Props = {
  href: string; // the other language's page
  lang: Lang; // the other language
  label: string; // "عربي" / "English"
  title: string; // "Read the invitation in Arabic"
};

export function LanguageSwitch({ href, lang, label, title }: Props) {
  // Arriving from a switch: skip the envelope, go back to the same screen.
  useEffect(() => {
    let screen = NaN;
    try {
      screen = Number(sessionStorage.getItem(KEY) ?? NaN);
      sessionStorage.removeItem(KEY);
    } catch {
      // Private mode: start from the envelope, as on a first visit.
    }
    if (Number.isNaN(screen)) return;
    const frame = requestAnimationFrame(() => {
      window.dispatchEvent(new Event(SKIP_ENVELOPE));
      const sections = document.querySelectorAll("main.invitation > section");
      sections[screen]?.scrollIntoView({ block: "start", behavior: "instant" });
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  // Leaving: remember the screen, unless the envelope is still closed.
  function remember() {
    if (!("opened" in document.documentElement.dataset)) return;
    const root = document.querySelector<HTMLElement>(".invitation");
    if (!root) return;
    // Every screen is exactly one viewport tall
    const screen = Math.round(root.scrollTop / root.clientHeight);
    try {
      sessionStorage.setItem(KEY, String(screen));
    } catch {
      // Not remembered: the guest lands on the envelope instead.
    }
  }

  return (
    <a href={href} hrefLang={lang} lang={lang} className={styles.switch} aria-label={title} title={title} onClick={remember}>
      {label}
    </a>
  );
}
