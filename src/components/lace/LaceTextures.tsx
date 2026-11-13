"use client";

import { useEffect } from "react";
import { laceStrip } from "@/lib/canvas/lace";

// Draws the lace strip once, in the browser, and hands it to CSS as an image:
//   --lace-h   a horizontal strip, along the top edge of the RSVP sheet
// (Lace cards draw their own ring with <LaceRing />; the oval cameo's ring,
// --lace-oval, is a static image set in globals.css.) Renders nothing.
export function LaceTextures() {
  useEffect(() => {
    const dpr = 3;
    const w = 48;
    const h = laceStrip(w * 0.7 * 8, w, dpr);

    const s = document.documentElement.style;
    s.setProperty("--lace-h", `url(${h.toDataURL()})`);
  }, []);

  return null;
}
