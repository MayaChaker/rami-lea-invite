// Canvas drawing shared by the envelope, the lace frames and the sheets:
// cotton paper, lace strips and lace rosettes. Ported from docs/prototype.html.
// Pure functions: they only draw on what they are given.

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
  x.fillStyle = "rgba(250,247,240,.3)"; // lighter tulle, so the lace reads white, not grey
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

/** A round lace rosette (for the corners of lace frames), `size` CSS px wide. */
export function rosette(size: number, dpr: number): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = c.height = size * dpr;
  const x = c.getContext("2d")!;
  x.scale(dpr, dpr);
  x.lineCap = "round";
  const m = size / 2;

  const cord = (path: Path2D, width: number) => {
    x.save();
    x.translate(0.4, 0.5);
    x.strokeStyle = "rgba(118,106,88,.22)";
    x.lineWidth = width + 0.35;
    x.stroke(path);
    x.restore();
    x.strokeStyle = "#FDFBF6";
    x.lineWidth = width;
    x.stroke(path);
  };

  // Scalloped outer edge
  const N = 14;
  const outer = new Path2D();
  for (let i = 0; i <= N; i++) {
    const a = (i / N) * TAU;
    const a2 = ((i + 0.5) / N) * TAU;
    const R = m * 0.86;
    const R2 = m * 0.98;
    if (!i) outer.moveTo(m + Math.cos(a) * R, m + Math.sin(a) * R);
    outer.quadraticCurveTo(
      m + Math.cos(a2) * R2 * 1.06,
      m + Math.sin(a2) * R2 * 1.06,
      m + Math.cos(a + TAU / N) * R,
      m + Math.sin(a + TAU / N) * R,
    );
  }
  x.fillStyle = "rgba(250,247,241,.9)";
  x.fill(outer);
  cord(outer, 0.8);

  // Tulle net inside
  x.save();
  x.clip(outer);
  x.strokeStyle = "rgba(170,158,138,.3)";
  x.lineWidth = 0.3;
  for (let k = -size; k < size * 2; k += 2.2) {
    x.beginPath();
    x.moveTo(k, 0);
    x.lineTo(k + size, size);
    x.stroke();
    x.beginPath();
    x.moveTo(k + size, 0);
    x.lineTo(k, size);
    x.stroke();
  }
  x.restore();

  // Ring, eight petals and a centre
  const ring = new Path2D();
  ring.arc(m, m, m * 0.66, 0, TAU);
  cord(ring, 0.6);
  const petals = new Path2D();
  for (let j = 0; j < 8; j++) {
    const a = (j * Math.PI) / 4;
    petals.moveTo(m + Math.cos(a) * m * 0.5 + m * 0.14, m + Math.sin(a) * m * 0.5);
    petals.ellipse(m + Math.cos(a) * m * 0.42, m + Math.sin(a) * m * 0.42, m * 0.2, m * 0.1, a, 0, TAU);
  }
  x.fillStyle = "rgba(253,251,247,.96)";
  x.fill(petals);
  cord(petals, 0.65);
  const centre = new Path2D();
  centre.arc(m, m, m * 0.17, 0, TAU);
  x.fillStyle = "#F3EEE4";
  x.fill(centre);
  cord(centre, 0.6);

  // Picots around the edge
  for (let j = 0; j < N; j++) {
    const a = ((j + 0.5) / N) * TAU;
    const dot = new Path2D();
    dot.arc(m + Math.cos(a) * m * 0.78, m + Math.sin(a) * m * 0.78, 0.9, 0, TAU);
    cord(dot, 0.4);
  }
  return c;
}

/**
 * A lace ring around an oval: tulle, small daisies and a scalloped outer edge
 * with picots. `W`×`H` is the whole image (CSS px); the ring is `band` wide and
 * its inner edge hugs an oval of (W − 2·band)×(H − 2·band).
 */
export function laceOval(W: number, H: number, band: number, dpr: number): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = Math.ceil(W * dpr);
  c.height = Math.ceil(H * dpr);
  const x = c.getContext("2d")!;
  x.scale(dpr, dpr);
  x.lineCap = "round";
  x.lineJoin = "round";

  const cx = W / 2;
  const cy = H / 2;
  const rx = W / 2 - band; // inner edge of the ring
  const ry = H / 2 - band;
  // A point at angle `a`, `k` px out from the inner edge.
  const at = (a: number, k: number) => [cx + Math.cos(a) * (rx + k), cy + Math.sin(a) * (ry + k)] as const;

  const cord = (path: Path2D, width: number, alpha = 1) => {
    x.save();
    x.translate(0.45, 0.6);
    x.strokeStyle = `rgba(118,106,88,${0.28 * alpha})`;
    x.lineWidth = width + 0.4;
    x.stroke(path);
    x.restore();
    x.strokeStyle = "#FDFBF6";
    x.lineWidth = width;
    x.stroke(path);
  };

  const N = 44; // scallops around the oval
  const step = TAU / N;
  const edge = band * 0.8; // where the scallops start

  // Outer scalloped edge
  const scallops = new Path2D();
  for (let i = 0; i <= N; i++) {
    const a = i * step;
    const [px, py] = at(a, edge);
    if (i === 0) scallops.moveTo(px, py);
    else {
      const [qx, qy] = at(a - step / 2, edge + band * 0.32);
      scallops.quadraticCurveTo(qx, qy, px, py);
    }
  }
  scallops.closePath();

  const inner = new Path2D();
  inner.ellipse(cx, cy, rx, ry, 0, 0, TAU);

  // The ring itself: inside the scallops, outside the inner oval
  const ring = new Path2D();
  ring.addPath(scallops);
  ring.addPath(inner);

  x.save();
  x.clip(ring, "evenodd");
  x.fillStyle = "rgba(250,247,240,.82)";
  x.fillRect(0, 0, W, H);
  x.strokeStyle = "rgba(170,158,138,.32)";
  x.lineWidth = 0.3;
  for (let k = -H; k < W + H; k += 2.2) {
    x.beginPath();
    x.moveTo(k, 0);
    x.lineTo(k + H, H);
    x.stroke();
    x.beginPath();
    x.moveTo(k + H, 0);
    x.lineTo(k, H);
    x.stroke();
  }
  x.restore();

  // Small daisies, one on every other scallop
  for (let i = 0; i < N; i += 2) {
    const [fx, fy] = at(i * step + step / 2, band * 0.42);
    const R = band * 0.2;
    const rays = new Path2D();
    for (let j = 0; j < 8; j++) {
      const a = (j * Math.PI) / 4;
      rays.moveTo(fx, fy);
      rays.lineTo(fx + Math.cos(a) * R, fy + Math.sin(a) * R);
    }
    const disc = new Path2D();
    disc.arc(fx, fy, R * 0.95, 0, TAU);
    x.fillStyle = "rgba(253,251,247,.95)";
    x.fill(disc);
    cord(disc, 0.5);
    cord(rays, 0.4);
    const heart = new Path2D();
    heart.arc(fx, fy, R * 0.3, 0, TAU);
    x.fillStyle = "#F2ECE1";
    x.fill(heart);
    cord(heart, 0.4);
  }

  // Threads: inner edge, scallops, and picots along the scallops
  cord(inner, 0.8);
  cord(scallops, 0.9);
  for (let i = 0; i < N; i++) {
    for (let j = 1; j < 4; j++) {
      const t = j / 4;
      const a = i * step + t * step;
      const [px, py] = at(a, edge + band * 0.32 * 4 * t * (1 - t) * 0.5 + 1.2);
      const dot = new Path2D();
      dot.arc(px, py, 0.8, 0, TAU);
      cord(dot, 0.4);
    }
  }

  return c;
}
