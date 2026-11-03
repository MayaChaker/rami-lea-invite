// Champagne-gold wax seal pressed with the couple's monogram.
// <SealDefs /> defines the shape once; the envelope shows it twice, one half each.

import { seeded } from "@/lib/canvas/lace";

// An uneven poured-wax outline: an oval whose radius wobbles a little,
// joined with smooth curves (Catmull-Rom turned into cubic Béziers).
function waxOutline(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  n: number,
  wobble: number,
  seed: number,
) {
  const r = seeded(seed);
  const pts = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    const k = 1 + (r() - 0.5) * wobble;
    return [cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k];
  });
  const f = (v: number) => v.toFixed(1);
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${f(c1[0])} ${f(c1[1])} ${f(c2[0])} ${f(c2[1])} ${f(p2[0])} ${f(p2[1])}`;
  }
  return d + "Z";
}

// Many points and a small wobble: organic, but calm and tidy.
const RIM = waxOutline(60, 48, 54, 43, 28, 0.04, 7);

export function SealDefs({ monogram }: { monogram: string }) {
  const script = { fontFamily: "var(--font-script)" };

  return (
    <svg width="0" height="0" className="absolute" aria-hidden="true" focusable="false">
      <defs>
        {/* Gold wax: bright where the light hits, deep amber at the edge. */}
        <radialGradient id="seal-gold" cx="35%" cy="30%" r="80%">
          <stop offset="0" stopColor="#F6E9C4" />
          <stop offset=".35" stopColor="#E2C98F" />
          <stop offset=".7" stopColor="#C2A066" />
          <stop offset="1" stopColor="#8E6B37" />
        </radialGradient>

        {/* Pressed centre: dark at the top-left, light at the bottom-right, so it reads as sunk in. */}
        <linearGradient id="seal-press" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#B08C52" />
          <stop offset="1" stopColor="#E9D49F" />
        </linearGradient>

        {/* A soft diagonal shine across the wax. */}
        <linearGradient id="seal-sheen" x1="0" y1="0" x2="1" y2="1">
          <stop offset=".3" stopColor="#fff" stopOpacity="0" />
          <stop offset=".46" stopColor="#fff" stopOpacity=".25" />
          <stop offset=".62" stopColor="#fff" stopOpacity="0" />
        </linearGradient>

        {/* Emboss: a warm light from the top-left catches every raised edge. */}
        <filter id="seal-emboss" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="1.2" result="b" />
          <feSpecularLighting
            in="b"
            surfaceScale="3.5"
            specularConstant=".9"
            specularExponent="22"
            lightingColor="#FFF6DC"
            result="s"
          >
            <fePointLight x="-60" y="-80" z="140" />
          </feSpecularLighting>
          <feComposite in="s" in2="SourceAlpha" operator="in" result="s2" />
          <feComposite in="SourceGraphic" in2="s2" operator="arithmetic" k1="0" k2="1" k3=".6" k4="0" />
        </filter>

        <symbol id="seal-wax" viewBox="0 0 120 96">
          {/* Wax body: only the rim and the pressed centre get the emboss. */}
          <g filter="url(#seal-emboss)">
            <path d={RIM} fill="url(#seal-gold)" />
            <ellipse cx="60" cy="48" rx="38" ry="29" fill="url(#seal-press)" />
          </g>
          <path d={RIM} fill="url(#seal-sheen)" />

          {/* One fine ring, drawn crisp (outside the filter) */}
          <ellipse cx="60" cy="48" rx="38" ry="29" fill="none" stroke="#8E6B37" strokeWidth=".8" opacity=".5" />
          <ellipse cx="60" cy="48" rx="34" ry="25.5" fill="none" stroke="#7E5E2E" strokeWidth=".5" opacity=".45" />

          {/* Engraved monogram, crisp: a light edge under a dark cut */}
          <text x="60" y="58.7" textAnchor="middle" fontSize="28" fill="#F7E9C2" opacity=".7" style={script}>
            {monogram}
          </text>
          <text x="60" y="58" textAnchor="middle" fontSize="28" fill="#6F5226" style={script}>
            {monogram}
          </text>
        </symbol>
      </defs>
    </svg>
  );
}
