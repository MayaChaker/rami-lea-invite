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

export function HandIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path d="M9 11V5.5a1.5 1.5 0 0 1 3 0V11m0-1.5a1.5 1.5 0 0 1 3 0V12m0-1a1.5 1.5 0 0 1 3 0v4.5a6 6 0 0 1-6 6h-1a6 6 0 0 1-5-2.7L4 15a1.5 1.5 0 0 1 2.4-1.8L9 15" />
    </svg>
  );
}
