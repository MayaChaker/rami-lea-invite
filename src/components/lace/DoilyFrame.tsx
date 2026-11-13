import type { CSSProperties, ReactNode } from "react";
import { LaceRing } from "./LaceRing";
import styles from "./DoilyFrame.module.css";

// An ivory card with a ring of lace around it, the same lace as the Letter's
// oval. Reused for the framed photo, "The details" card and the RSVP card.
type Props = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  inert?: boolean;
} & Record<`data-${string}`, string>;

export function DoilyFrame({ children, className = "", ...rest }: Props) {
  return (
    <div className={`${styles.doily} ${className}`} {...rest}>
      <LaceRing />
      {children}
    </div>
  );
}
