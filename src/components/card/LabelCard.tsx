import type { ReactNode } from "react";
import styles from "./LabelCard.module.css";

// An ivory card shaped like a stationery label: scooped corners, a fine inner
// line that follows them, and a small arch on top. Used by "The details" and
// the RSVP, over a full-page photo. Pure CSS, so it is a Server Component.
type Props = {
  children: ReactNode;
  className?: string;
};

export function LabelCard({ children, className = "" }: Props) {
  return (
    <div className={`${styles.card} ${className}`}>
      <span className={styles.flourish} aria-hidden="true" />
      {children}
    </div>
  );
}
