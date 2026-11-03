import type { CSSProperties, ReactNode } from "react";
import styles from "./DoilyFrame.module.css";

// An ivory card with lace along all four edges and a lace rosette in each corner.
// Reused for the framed photo, "The details" card and the RSVP card.
// The lace images come from <LaceTextures /> (CSS variables).
type Props = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
} & Record<`data-${string}`, string>;

export function DoilyFrame({ children, className = "", ...rest }: Props) {
  return (
    <div className={`${styles.doily} ${className}`} {...rest}>
      <span className={`${styles.lace} ${styles.top}`} aria-hidden="true" />
      <span className={`${styles.lace} ${styles.bottom}`} aria-hidden="true" />
      <span className={`${styles.lace} ${styles.left}`} aria-hidden="true" />
      <span className={`${styles.lace} ${styles.right}`} aria-hidden="true" />
      <span className={`${styles.rosette} ${styles.tl}`} aria-hidden="true" />
      <span className={`${styles.rosette} ${styles.tr}`} aria-hidden="true" />
      <span className={`${styles.rosette} ${styles.bl}`} aria-hidden="true" />
      <span className={`${styles.rosette} ${styles.br}`} aria-hidden="true" />
      {children}
    </div>
  );
}
