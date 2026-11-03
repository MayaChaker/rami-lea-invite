"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import { drawEnvelope, type FlapName } from "./draw";
import styles from "./Envelope.module.css";
import { SealDefs } from "./Seal";
import { HERO_VIDEO_ID } from "@/lib/ids";

// Opening sequence, in order. Each stage starts at `at` ms after the tap.
const STAGES = [
  { name: "cracked", at: 0 },
  { name: "opened", at: 650 },
  { name: "fading", at: 1500 },
  { name: "gone", at: 2200 },
] as const;

type Stage = "closed" | (typeof STAGES)[number]["name"];

// Drawing order: the top flap comes last, so it sits above the others.
const FLAPS: FlapName[] = ["right", "left", "bottom", "top"];

type Props = {
  tapLabel: string; // e.g. "Tap the seal to open"
  monogram: string; // pressed into the wax seal, e.g. "R&L"
};

export function Envelope({ tapLabel, monogram }: Props) {
  const [stage, setStage] = useState<Stage>("closed");
  const timers = useRef<number[]>([]);
  const stageRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLCanvasElement>(null);
  const flapRefs = useRef<Record<FlapName, HTMLCanvasElement | null>>({
    top: null,
    bottom: null,
    left: null,
    right: null,
  });
  // Pointer position, from -0.5 to 0.5 on each axis. A ref, so moving the mouse never re-renders.
  const pointer = useRef({ x: 0, y: 0 });

  // Clear pending timers if the component is removed mid-animation.
  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  // Paint the paper and lace now, and again whenever the screen size changes.
  useEffect(() => {
    const el = stageRef.current;
    const inner = innerRef.current;
    if (!el || !inner) return;
    const observer = new ResizeObserver(() =>
      drawEnvelope(el, inner, flapRefs.current),
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Idle motion while closed: a slow tilt, nudged by the pointer, and a light that follows it.
  useEffect(() => {
    const el = stageRef.current;
    if (!el || stage !== "closed") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const t0 = performance.now();
    let raf = 0;
    const frame = (now: number) => {
      const t = (now - t0) / 1000;
      const rx = Math.cos(t * 0.8) * 1.1 + pointer.current.y * 2.4;
      const ry = Math.sin(t * 0.6) * 1.4 + pointer.current.x * 2.8;
      el.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
      el.style.setProperty("--lx", `${40 + ry * 14}%`);
      el.style.setProperty("--ly", `${30 + rx * 14}%`);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      el.style.transform = ""; // settle flat; the CSS transition eases it back
    };
  }, [stage]);

  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    pointer.current = {
      x: (e.clientX - r.left) / r.width - 0.5,
      y: (e.clientY - r.top) / r.height - 0.5,
    };
  }

  // Once the envelope starts fading, tell the page it is open:
  // the hero text reveals itself and scrolling is unlocked (both in CSS).
  useEffect(() => {
    if (stage === "fading") document.documentElement.dataset.opened = "";
  }, [stage]);

  function open() {
    if (stage !== "closed") return;
    // Start the video inside the tap itself: phones in low-power mode only
    // allow playback that a user action started.
    const video = document.getElementById(HERO_VIDEO_ID);
    if (video instanceof HTMLVideoElement) video.play().catch(() => {});
    for (const { name, at } of STAGES) {
      timers.current.push(window.setTimeout(() => setStage(name), at));
    }
  }

  if (stage === "gone") return null;

  // Every stage reached so far stays on, so the CSS can build on it.
  const reached = STAGES.slice(
    0,
    STAGES.findIndex((s) => s.name === stage) + 1,
  );
  const className = [
    styles.envelope,
    ...reached.map((s) => styles[s.name]),
  ].join(" ");

  return (
    <div className={className} onClick={open} onPointerMove={onPointerMove}>
      <SealDefs monogram={monogram} />

      <div ref={stageRef} className={styles.stage}>
        <canvas ref={innerRef} aria-hidden="true" />


        {FLAPS.map((name) => (
          <div key={name} className={`${styles.flap} ${styles[name]}`}>
            <canvas
              ref={(el) => {
                flapRefs.current[name] = el;
              }}
              aria-hidden="true"
            />
          </div>
        ))}

        <div className={styles.sheen} aria-hidden="true" />
        <button type="button" className={styles.seal} aria-label={tapLabel}>
          <span className={`${styles.half} ${styles.halfA}`}>
            <svg viewBox="0 0 120 96" aria-hidden="true">
              <use href="#seal-wax" />
            </svg>
          </span>
          <span className={`${styles.half} ${styles.halfB}`}>
            <svg viewBox="0 0 120 96" aria-hidden="true">
              <use href="#seal-wax" />
            </svg>
          </span>
        </button>
      </div>

      <p className={styles.tap} aria-hidden="true">
        {tapLabel}
      </p>
    </div>
  );
}
