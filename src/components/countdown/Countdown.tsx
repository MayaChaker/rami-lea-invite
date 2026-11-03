"use client";

import { useEffect, useState } from "react";
import styles from "./Countdown.module.css";

// Days, hours, minutes and seconds left until the wedding.
//
// The page is built ahead of time, so the server cannot know "now". It renders
// dashes, and the real numbers start in the browser. That way the server HTML
// and the first browser render always match (no hydration warning).
type Props = {
  target: string; // ISO date of the ceremony
  units: string[]; // ["days", "hours", "min", "sec"]
};

function timeLeft(end: number) {
  const s = Math.max(0, Math.floor((end - Date.now()) / 1000));
  return [Math.floor(s / 86400), Math.floor((s % 86400) / 3600), Math.floor((s % 3600) / 60), s % 60];
}

export function Countdown({ target, units }: Props) {
  const [left, setLeft] = useState<number[] | null>(null);

  useEffect(() => {
    const end = new Date(target).getTime();
    const tick = () => setLeft(timeLeft(end));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [target]);

  return (
    <div className={styles.count} role="timer">
      {units.map((unit, i) => {
        // Days as they are; hours, minutes and seconds always two digits.
        const value = left ? (i ? String(left[i]).padStart(2, "0") : String(left[i])) : "–";
        return (
          <div key={unit} className={styles.unit}>
            <b className={styles.number}>
              {/* A new key on every change restarts the slide-in animation. */}
              <i key={value} className={styles.digit}>
                {value}
              </i>
            </b>
            <span className={styles.label}>{unit}</span>
          </div>
        );
      })}
    </div>
  );
}
