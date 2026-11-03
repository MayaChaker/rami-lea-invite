// Canvas drawing for the envelope: cotton paper and lace.
// Ported from docs/prototype.html. Pure functions: they only draw on what they are given.

const TAU = Math.PI * 2;

/** Seeded random numbers, so the lace looks the same on every load. */
export function seeded(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

/** Mixes a hex colour toward white (amount > 0) or black (amount < 0). */
export function tint(hex: string, amount: number): string {
  const n = parseInt(hex.trim().slice(1), 16);
  const target = amount > 0 ? 255 : 0;
  const t = Math.abs(amount);
  const ch = (shift: number) =>
    Math.round(((n >> shift) & 255) * (1 - t) + target * t);
  return `rgb(${ch(16)}, ${ch(8)}, ${ch(0)})`;
}

// A small tile of random grain, made once and reused.
let noiseTile: HTMLCanvasElement | null = null;
function noise(): HTMLCanvasElement {
  if (noiseTile) return noiseTile;
  const c = document.createElement("canvas");
  c.width = c.height = 160;
  const x = c.getContext("2d")!;
  const d = x.createImageData(160, 160);
  for (let i = 0; i < d.data.length; i += 4) {
    const v = Math.random() * 255;
    d.data[i] = d.data[i + 1] = d.data[i + 2] = v;
    d.data[i + 3] = Math.random() < 0.5 ? 10 : 4;
  }
  x.putImageData(d, 0, 0);
  noiseTile = c;
  return c;
}

export type PaperTone = { from: string; to: string; light: number };

/** Fills W×H with cotton paper: soft gradient, a light spot, grain and tiny fibres. */
export function paper(
  x: CanvasRenderingContext2D,
  W: number,
  H: number,
  tone: PaperTone,
) {
  const g = x.createLinearGradient(0, 0, W * 0.7, H);
  g.addColorStop(0, tone.from);
  g.addColorStop(1, tone.to);
  x.fillStyle = g;
  x.fillRect(0, 0, W, H);

  const light = x.createRadialGradient(W * 0.25, H * 0.15, 0, W * 0.25, H * 0.15, H * 0.9);
  light.addColorStop(0, `rgba(255,255,255,${tone.light})`);
  light.addColorStop(1, "rgba(255,255,255,0)");
  x.fillStyle = light;
  x.fillRect(0, 0, W, H);

  x.fillStyle = x.createPattern(noise(), "repeat")!;
  x.fillRect(0, 0, W, H);

  const r = seeded(11);
  x.lineWidth = 0.5;
  for (let i = 0; i < (W * H) / 650; i++) {
    const px = r() * W;
    const py = r() * H;
    const a = r() * Math.PI;
    const l = 2 + r() * 6;
    x.strokeStyle = r() < 0.5 ? "rgba(120,110,98,.05)" : "rgba(255,255,255,.35)";
    x.beginPath();
    x.moveTo(px, py);
    x.lineTo(px + Math.cos(a) * l, py + Math.sin(a) * l);
    x.stroke();
  }
}

/**
 * One horizontal lace strip, `len` long and `w` high (CSS px), drawn at `dpr` resolution.
 * Top edge is straight (sewn to the flap), bottom edge is scalloped with picots.
 */
export function laceStrip(len: number, w: number, dpr: number): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = Math.ceil(len * dpr);
  c.height = Math.ceil(w * 1.12 * dpr);
  const x = c.getContext("2d")!;
  x.scale(dpr, dpr);
  x.lineCap = "round";
  x.lineJoin = "round";

  const p = w * 0.7; // width of one scallop (one motif)
  const base = w * 0.78; // where the scallops start
  const dep = w * 0.17; // scallop depth
  const r = seeded(5);

  // A cotton thread: soft shadow, ivory thread, small highlight.
  const cord = (path: Path2D, width: number, alpha = 1) => {
    x.save();
    x.translate(0.45, 0.6);
    x.strokeStyle = `rgba(118,106,88,${0.2 * alpha})`;
    x.lineWidth = width + 0.35;
    x.stroke(path);
    x.restore();
    x.strokeStyle = "#FDFBF6";
    x.lineWidth = width;
    x.stroke(path);
    x.save();
    x.translate(-0.25, -0.3);
    x.strokeStyle = "rgba(255,255,255,.9)";
    x.lineWidth = width * 0.4;
    x.stroke(path);
    x.restore();
  };

  const scallops = (offset: number) => {
    const s = new Path2D();
    s.moveTo(0, base + offset);
    for (let i = 0; i < len + p; i += p) {
      s.quadraticCurveTo(i + p / 2, base + offset + dep * 2, i + p, base + offset);
    }
    return s;
  };

  // The outline of the whole strip, used as a clip.
  const area = new Path2D();
  area.moveTo(0, 0);
  area.lineTo(len, 0);
  area.lineTo(len, base);
  for (let i = len; i > -p; i -= p) {
    area.quadraticCurveTo(i - p / 2, base + dep * 2, i - p, base);
  }
  area.closePath();

  x.save();
  x.clip(area);

  // 1. Tulle net
  x.fillStyle = "rgba(247,243,235,.42)";
  x.fillRect(0, 0, len, w * 1.2);
  x.strokeStyle = "rgba(170,158,138,.3)";
  x.lineWidth = 0.3;
  for (let k = -w * 2; k < len + w * 2; k += 2.2) {
    x.beginPath();
    x.moveTo(k, 0);
    x.lineTo(k + w * 1.15, w * 1.15);
    x.stroke();
    x.beginPath();
    x.moveTo(k + w * 1.15, 0);
    x.lineTo(k, w * 1.15);
    x.stroke();
  }

  // 2. Row of eyelets along the top
  for (let k = 1.5; k < len; k += 4.2) {
    const eyelet = new Path2D();
    eyelet.ellipse(k, w * 0.09, 1.15, 0.75, 0, 0, TAU);
    cord(eyelet, 0.45, 0.8);
  }

  // 3. Flowers (rose, daisy, rose...) with a leaf spray between them
  for (let i = 0, k = 0; i < len + p; i += p, k++) {
    const cx = i + p * 0.5;
    const cy = w * 0.44;

    if (k % 2 === 0) {
      const R = w * 0.15;
      const rose = new Path2D();
      for (let j = 0; j < 6; j++) {
        const a = (j * Math.PI) / 3 + 0.3;
        rose.moveTo(cx + Math.cos(a) * R * 1.05 + R * 0.5, cy + Math.sin(a) * R * 1.05);
        rose.ellipse(cx + Math.cos(a) * R * 0.95, cy + Math.sin(a) * R * 0.95, R * 0.55, R * 0.36, a, 0, TAU);
      }
      x.fillStyle = "rgba(253,251,247,.95)";
      x.fill(rose);
      cord(rose, 0.75);

      const spiral = new Path2D();
      spiral.arc(cx, cy, R * 0.48, 0.2, 5.6);
      spiral.moveTo(cx + R * 0.22, cy);
      spiral.arc(cx, cy, R * 0.22, 0, 4.6);
      x.fillStyle = "#F4EFE5";
      x.beginPath();
      x.arc(cx, cy, R * 0.55, 0, TAU);
      x.fill();
      cord(spiral, 0.6);
    } else {
      const R = w * 0.1;
      const rays = new Path2D();
      for (let j = 0; j < 8; j++) {
        const a = (j * Math.PI) / 4;
        rays.moveTo(cx, cy);
        rays.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R);
      }
      const disc = new Path2D();
      disc.arc(cx, cy, R * 0.95, 0, TAU);
      x.fillStyle = "rgba(253,251,247,.9)";
      x.fill(disc);
      cord(disc, 0.55);
      cord(rays, 0.45);

      const heart = new Path2D();
      heart.arc(cx, cy, R * 0.3, 0, TAU);
      x.fillStyle = "#F2ECE1";
      x.fill(heart);
      cord(heart, 0.45);
    }

    // Leaf spray between two flowers
    const sx = cx + p * 0.5;
    const stem = new Path2D();
    stem.moveTo(sx - p * 0.28, w * 0.6);
    stem.bezierCurveTo(sx - p * 0.1, w * 0.34, sx + p * 0.1, w * 0.5, sx + p * 0.26, w * 0.24);
    cord(stem, 0.5);
    for (let j = 0; j < 4; j++) {
      const t = 0.15 + j * 0.22;
      const lx = sx - p * 0.28 + t * p * 0.54;
      const ly = w * 0.6 - t * w * 0.36 + (r() - 0.5) * 2;
      const ang = (j % 2 ? -0.9 : 0.9) + (r() - 0.5) * 0.3;
      const leaf = new Path2D();
      leaf.ellipse(
        lx + Math.cos(ang - 1.57) * w * 0.05,
        ly + Math.sin(ang - 1.57) * w * 0.05,
        w * 0.055,
        w * 0.022,
        ang,
        0,
        TAU,
      );
      x.fillStyle = "rgba(252,250,245,.92)";
      x.fill(leaf);
      cord(leaf, 0.45);
    }
  }

  // 4. Denser band just above the scallops
  x.fillStyle = "rgba(250,247,240,.55)";
  x.beginPath();
  x.moveTo(0, base - w * 0.06);
  for (let i = 0; i < len + p; i += p) {
    x.quadraticCurveTo(i + p / 2, base - w * 0.06 + dep * 2, i + p, base - w * 0.06);
  }
  x.lineTo(len + p, base + dep * 3);
  x.lineTo(0, base + dep * 3);
  x.fill();
  x.restore();

  // 5. Double scalloped edge with picots, and the straight top edge
  cord(scallops(-w * 0.06), 0.55, 0.8);
  cord(scallops(0), 0.95);
  for (let i = 0; i < len + p; i += p) {
    for (let j = 1; j < 6; j++) {
      const t = j / 6;
      const picot = new Path2D();
      picot.arc(i + t * p, base + 4 * dep * t * (1 - t) + 1.4, 0.9, 0, TAU);
      cord(picot, 0.45);
    }
  }
  const top = new Path2D();
  top.moveTo(0, 0.8);
  top.lineTo(len, 0.8);
  cord(top, 0.8);

  return c;
}

export type FlapName = "top" | "bottom" | "left" | "right";
type Point = { x: number; y: number };

/**
 * Paints the inside of the envelope and its four flaps.
 * Every canvas covers the same W×H area; each flap only paints its own shape.
 */
export function drawEnvelope(
  stage: HTMLElement,
  inner: HTMLCanvasElement,
  flaps: Record<FlapName, HTMLCanvasElement | null>,
) {
  const W = stage.clientWidth;
  const H = stage.clientHeight;
  if (!W || !H) return;

  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const C = { x: W / 2, y: H / 2 }; // centre, where the four tips meet
  const lw = W * 0.13; // lace width
  const o = W * 0.035; // how far the tips reach past the centre
  const sage =
    getComputedStyle(stage).getPropertyValue("--color-sage").trim() || "#6E7B5F";

  // Sizes a canvas for this screen and returns a context that draws in CSS pixels.
  const setup = (cv: HTMLCanvasElement) => {
    cv.width = Math.round(W * dpr);
    cv.height = Math.round(H * dpr);
    const x = cv.getContext("2d")!;
    x.setTransform(dpr, 0, 0, dpr, 0, 0);
    return x;
  };

  // Inside of the envelope: ivory paper, a little darker toward the edges.
  const z = setup(inner);
  paper(z, W, H, { from: "#F4F1E8", to: "#E4E0D3", light: 0.5 });
  const shade = z.createRadialGradient(C.x, C.y, W * 0.1, C.x, C.y, H * 0.7);
  shade.addColorStop(0, "rgba(0,0,0,0)");
  shade.addColorStop(1, "rgba(60,55,45,.18)");
  z.fillStyle = shade;
  z.fillRect(0, 0, W, H);

  // Each flap catches the light a little differently.
  const tones: Record<FlapName, PaperTone> = {
    top: { from: tint(sage, 0.2), to: tint(sage, 0.04), light: 0.24 },
    bottom: { from: tint(sage, 0.15), to: tint(sage, 0.01), light: 0.18 },
    left: { from: tint(sage, 0.12), to: tint(sage, -0.04), light: 0.16 },
    right: { from: tint(sage, 0.09), to: tint(sage, -0.06), light: 0.14 },
  };

  // Flap outlines: from the outer edge to a softly rounded tip at the centre.
  const shapes: Record<FlapName, (p: Path2D) => void> = {
    top: (p) => {
      p.moveTo(-1, -1);
      p.lineTo(W + 1, -1);
      p.lineTo(C.x + o, C.y - o * 0.6);
      p.quadraticCurveTo(C.x, C.y + o * 0.5, C.x - o, C.y - o * 0.6);
    },
    bottom: (p) => {
      p.moveTo(-1, H + 1);
      p.lineTo(W + 1, H + 1);
      p.lineTo(C.x + o, C.y + o * 0.6);
      p.quadraticCurveTo(C.x, C.y - o * 0.5, C.x - o, C.y + o * 0.6);
    },
    left: (p) => {
      p.moveTo(-1, -1);
      p.lineTo(-1, H + 1);
      p.lineTo(C.x + o * 0.8, C.y + o);
      p.quadraticCurveTo(C.x + o * 1.6, C.y, C.x + o * 0.8, C.y - o);
    },
    right: (p) => {
      p.moveTo(W + 1, -1);
      p.lineTo(W + 1, H + 1);
      p.lineTo(C.x - o * 0.8, C.y + o);
      p.quadraticCurveTo(C.x - o * 1.6, C.y, C.x - o * 0.8, C.y - o);
    },
  };

  // One lace strip, long enough for a corner-to-centre edge, laid along a line.
  const strip = laceStrip(Math.hypot(C.x, C.y) + lw, lw, dpr);
  const lace = (x: CanvasRenderingContext2D, from: Point, to: Point) => {
    // Use exactly the edge's length of the strip, so every lace ends at the tip.
    const edge = Math.hypot(to.x - from.x, to.y - from.y);
    x.save();
    x.translate(from.x, from.y);
    x.rotate(Math.atan2(to.y - from.y, to.x - from.x));
    x.drawImage(strip, 0, 0, edge * dpr, strip.height, 0, -1, edge, strip.height / dpr);
    x.restore();
  };

  for (const k of ["right", "left", "bottom", "top"] as const) {
    const cv = flaps[k];
    if (!cv) continue;
    const x = setup(cv);

    const outline = new Path2D();
    shapes[k](outline);
    outline.closePath();

    x.save();
    x.clip(outline);
    paper(x, W, H, tones[k]);
    x.restore();
    x.strokeStyle = "rgba(40,46,34,.35)";
    x.lineWidth = 0.8;
    x.stroke(outline);

    // Lace along the two inner edges of the top and bottom flaps.
    if (k === "top") {
      lace(x, { x: 0, y: 0 }, { x: C.x - o, y: C.y - o * 0.6 });
      lace(x, { x: C.x + o, y: C.y - o * 0.6 }, { x: W, y: 0 });
    }
    if (k === "bottom") {
      lace(x, { x: C.x - o, y: C.y + o * 0.6 }, { x: 0, y: H });
      lace(x, { x: W, y: H }, { x: C.x + o, y: C.y + o * 0.6 });
    }
  }
}
