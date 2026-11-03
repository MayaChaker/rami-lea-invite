"use client";

import { useEffect } from "react";

// One small client component for all the motion on the invitation. Renders nothing.
//
// 1. Reveal: an element with data-a="up" | "soft" | "zoom" | "rise" | "draw"
//    gets the class "in" while it is on screen; invitation.css animates it.
// 2. Parallax: a background with data-p="0.25" moves at a quarter of the
//    scroll speed, so the photo seems further away than the page.
export function PageMotion() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".invitation");
    if (!root) return;
    root.dataset.motion = "";

    // 1. Reveal
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => e.target.classList.toggle("in", e.isIntersecting)),
      { root, threshold: 0.2 },
    );
    root.querySelectorAll("[data-a]").forEach((el) => observer.observe(el));

    // 2. Parallax (skipped for people who asked for less motion)
    const layers = [...root.querySelectorAll<HTMLElement>("[data-p]")];
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    const parallax = () => {
      frame = 0;
      const view = root.getBoundingClientRect();
      for (const layer of layers) {
        const page = layer.parentElement!.getBoundingClientRect();
        const offset = page.top - view.top + page.height / 2 - view.height / 2;
        layer.style.transform = `translate3d(0, ${(-offset * Number(layer.dataset.p)).toFixed(1)}px, 0)`;
      }
    };
    // At most once per frame, however fast the scroll events come.
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(parallax);
    };
    if (!still && layers.length) {
      parallax();
      root.addEventListener("scroll", onScroll, { passive: true });
    }

    return () => {
      observer.disconnect();
      root.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return null;
}
