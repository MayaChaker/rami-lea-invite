"use client";

import { useEffect, useState } from "react";
import styles from "./PageDots.module.css";

// Small dots on the side: one per page, the current one larger.
// Light on photos and the sage band, dark on the ivory paper pages.
export function PageDots() {
  const [count, setCount] = useState(0);
  const [current, setCurrent] = useState(0);
  const [onPaper, setOnPaper] = useState(false);

  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".invitation");
    if (!root) return;
    const pages = [...root.querySelectorAll<HTMLElement>(":scope > section")];
    // Set on the next frame, not while React is still running this effect
    const frame = requestAnimationFrame(() => setCount(pages.length));

    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.intersectionRatio < 0.55) continue;
          setCurrent(pages.indexOf(e.target as HTMLElement));
          setOnPaper(e.target.classList.contains("paper"));
        }
      },
      { root, threshold: [0.55] },
    );
    pages.forEach((p) => observer.observe(p));
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);

  if (!count) return null;
  return (
    <div className={`${styles.dots} ${onPaper ? styles.ink : ""}`} aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <i key={i} className={i === current ? styles.on : undefined} />
      ))}
    </div>
  );
}
