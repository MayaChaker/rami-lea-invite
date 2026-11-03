"use client";

import { useEffect } from "react";

// One small observer for the whole invitation: when an element with
// data-a="up" | "soft" | "draw" comes on screen it gets the class "in",
// and the CSS in invitation.css animates it. Renders nothing.
export function RevealObserver() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".invitation");
    if (!root) return;
    root.dataset.motion = "";

    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => e.target.classList.toggle("in", e.isIntersecting)),
      { root, threshold: 0.2 },
    );
    root.querySelectorAll("[data-a]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return null;
}
