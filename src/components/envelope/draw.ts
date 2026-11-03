// Canvas drawing for the envelope's inside and its four flaps.
import { laceStrip, paper, tint, type PaperTone } from "@/lib/canvas/lace";

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
