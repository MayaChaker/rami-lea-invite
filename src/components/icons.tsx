import type { SVGProps } from "react";

// Line icons from the prototype, drawn as strokes so they can "draw themselves".

export function BowIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 100 60" aria-hidden="true" {...props}>
      <path d="M50 22 C38 8 22 10 26 22 C29 31 44 26 50 22 C56 26 71 31 74 22 C78 10 62 8 50 22 Z" />
      <path d="M50 22 C46 34 40 44 34 54 M50 22 C54 34 60 44 66 54" />
      <path d="M30 44 C26 40 20 42 22 47 C24 52 30 56 30 56 C30 56 36 52 38 47 C40 42 34 40 30 44 Z" />
      <path d="M70 40 C66 36 60 38 62 43 C64 48 70 52 70 52 C70 52 76 48 78 43 C80 38 74 36 70 40 Z" />
    </svg>
  );
}

export function RingsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 100 60" aria-hidden="true" {...props}>
      <circle cx="40" cy="36" r="17" />
      <circle cx="60" cy="36" r="17" />
      <path d="M36 18 L40 12 L44 18 Z" />
      <path d="M40 12 L40 9" />
    </svg>
  );
}

// ---------- small icons for the "Good to know" notes (48×48) ----------

/** Dress code: a gown on a hanger */
export function DressIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" {...props}>
      <path d="M21.5 9.5a2.5 2.5 0 1 1 2.5 2.5v2.5" />
      <path d="M24 14.5 L9 22 H39 Z" />
      <path d="M19 22 C19 26 20.5 28 21 29 L14 42 H34 L27 29 C27.5 28 29 26 29 22" />
    </svg>
  );
}

/** Adults only: two champagne flutes raised in a toast */
export function ToastIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" {...props}>
      <path d="M11 11 L20 13 L18 24 A4 4 0 0 1 10.5 22.4 Z" />
      <path d="M14.2 25 L11.5 37 M7.5 36 L15.5 38" />
      <path d="M37 11 L28 13 L30 24 A4 4 0 0 0 37.5 22.4 Z" />
      <path d="M33.8 25 L36.5 37 M32.5 38 L40.5 36" />
      <path d="M24 4 V8 M20.5 6 L22 8 M27.5 6 L26 8" />
    </svg>
  );
}

/** Gifts: a wrapped box with a bow */
export function GiftIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" {...props}>
      <path d="M8 17 H40 V23 H8 Z" />
      <path d="M11 23 H37 V41 H11 Z" />
      <path d="M24 17 V41" />
      <path d="M24 17 C21 9 13 10 15.5 15 C16.5 17 20 17 24 17 Z" />
      <path d="M24 17 C27 9 35 10 32.5 15 C31.5 17 28 17 24 17 Z" />
    </svg>
  );
}

// ---------- icons for the events (48×48) ----------

/** The zaffé: a tabl (drum) with its two sticks */
export function DrumIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" {...props}>
      <ellipse cx="22" cy="20" rx="14" ry="5" />
      <path d="M8 20 V33 C8 36 14.5 38.5 22 38.5 S36 36 36 33 V20" />
      <path d="M8 27 L14 35 M14 25 L22 38 M22 25 L30 37 M30 25 L36 32" />
      <path d="M31 13 L42 6 M34 16 L45 11" />
    </svg>
  );
}

/** The ceremony: two wedding rings */
export function TwoRingsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" {...props}>
      <circle cx="19" cy="29" r="10" />
      <circle cx="29" cy="29" r="10" />
      <path d="M15.5 19 L19 13.5 L22.5 19 Z" />
    </svg>
  );
}

/** The reception: two glasses */
export function GlassesIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" {...props}>
      <path d="M11 8 H21 L20 20 A4.5 4.5 0 0 1 12 20 Z M16 24.5 V39 M11 40 H21" />
      <path d="M27 8 H37 L36 20 A4.5 4.5 0 0 1 28 20 Z M32 24.5 V39 M27 40 H37" />
      <path d="M12 13 H20 M28 13 H36" />
    </svg>
  );
}

export function HandIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path d="M9 11V5.5a1.5 1.5 0 0 1 3 0V11m0-1.5a1.5 1.5 0 0 1 3 0V12m0-1a1.5 1.5 0 0 1 3 0v4.5a6 6 0 0 1-6 6h-1a6 6 0 0 1-5-2.7L4 15a1.5 1.5 0 0 1 2.4-1.8L9 15" />
    </svg>
  );
}
