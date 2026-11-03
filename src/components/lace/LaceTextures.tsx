"use client";

import { useEffect } from "react";
import { laceOval, laceStrip, rosette } from "@/lib/canvas/lace";

// Draws the lace once, in the browser, and hands it to CSS as images:
//   --lace-h   a horizontal strip (top and bottom edges of a frame)
//   --lace-v   the same strip turned upright (left and right edges)
//   --rosette  a round lace motif (the four corners)
//   --lace-oval  a lace ring for the oval cameo on the letter page
// Every <DoilyFrame> on the page uses these. Renders nothing.
export function LaceTextures() {
  useEffect(() => {
    const dpr = 3;
    const w = 48;
    const h = laceStrip(w * 0.7 * 8, w, dpr);

    const v = document.createElement("canvas");
    v.width = h.height;
    v.height = h.width;
    const x = v.getContext("2d")!;
    x.translate(v.width, 0);
    x.rotate(Math.PI / 2);
    x.drawImage(h, 0, 0);

    const s = document.documentElement.style;
    s.setProperty("--lace-h", `url(${h.toDataURL()})`);
    s.setProperty("--lace-v", `url(${v.toDataURL()})`);
    s.setProperty("--rosette", `url(${rosette(80, dpr).toDataURL()})`);
    // Oval 200×250 with a 26 px ring, so 252×302 in all (matches Letter.module.css)
    s.setProperty("--lace-oval", `url(${laceOval(252, 302, 26, dpr).toDataURL()})`);
  }, []);

  return null;
}
