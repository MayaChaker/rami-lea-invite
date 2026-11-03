import type { CSSProperties } from "react";

// Stagger: each line starts its animation a little after the one before.
export const delay = (seconds: number) => ({ "--d": `${seconds}s` }) as CSSProperties;
