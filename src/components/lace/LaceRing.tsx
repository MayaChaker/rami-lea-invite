"use client";

import { useEffect, useRef } from "react";
import { laceRect } from "@/lib/canvas/lace";
import styles from "./DoilyFrame.module.css";

// The lace around a card: the same lace as the Letter's oval ring, drawn on a
// canvas that CSS places just outside the card (see .ring). The canvas is drawn
// at the size CSS gives it, and again if that size changes. Renders a canvas.
export function LaceRing() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const card = canvas?.parentElement;
    if (!canvas || !card) return;

    function draw() {
      const W = canvas!.clientWidth;
      const H = canvas!.clientHeight;
      // The canvas is wider than the card by one band on each side
      const band = (W - card!.clientWidth) / 2;
      if (!W || !H || band <= 0) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 3);
      const lace = laceRect(W, H, band, dpr);
      canvas!.width = lace.width;
      canvas!.height = lace.height;
      canvas!.getContext("2d")!.drawImage(lace, 0, 0);
    }

    draw();
    const resize = new ResizeObserver(draw);
    resize.observe(canvas);
    return () => resize.disconnect();
  }, []);

  return <canvas ref={ref} className={styles.ring} aria-hidden="true" />;
}
