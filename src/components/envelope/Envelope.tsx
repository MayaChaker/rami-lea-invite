"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import { drawEnvelope, type FlapName } from "./draw";
import styles from "./Envelope.module.css";
import Image from "next/image";
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
  tapLabel: string; // e.g. "Tap to open"
  skipLabel: string; // e.g. "Skip"
  photo: string; // the couple's cameo, in a lace oval, where a wax seal would be
  photoAlt: string;
};

export function Envelope({ tapLabel, skipLabel, photo, photoAlt }: Props) {
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
    const observer = new ResizeObserver(() => {
      drawEnvelope(el, inner, flapRefs.current);
      // The CSS shows plain sage flaps until now, then fades the paper and lace in.
      el.dataset.drawn = "";
    });
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

  // Download the hero video only after the page has settled, so it does not
  // compete with the page itself on a slow connection. The guest is looking at
  // the envelope meanwhile, so it is usually ready by the time they tap.
  useEffect(() => {
    const video = document.getElementById(HERO_VIDEO_ID);
    if (!(video instanceof HTMLVideoElement)) return;
    const start = () => {
      video.preload = "auto";
      video.load();
    };
    const idle = window.requestIdleCallback ?? ((fn: () => void) => window.setTimeout(fn, 1200));
    const id = idle(start);
    return () => (window.cancelIdleCallback ?? window.clearTimeout)(id);
  }, []);

  // Once the envelope starts fading, tell the page it is open:
  // the hero text reveals itself and scrolling is unlocked (both in CSS).
  useEffect(() => {
    if (stage === "fading") document.documentElement.dataset.opened = "";
  }, [stage]);

  // Start the video inside the tap itself: phones in low-power mode only
  // allow playback that a user action started.
  function playVideo() {
    const video = document.getElementById(HERO_VIDEO_ID);
    if (video instanceof HTMLVideoElement) video.play().catch(() => {});
  }

  // Straight to the invitation, no animation: the Skip button, and guests
  // whose phone asks for less motion.
  function skip() {
    timers.current.forEach(clearTimeout);
    timers.current.length = 0;
    playVideo();
    document.documentElement.dataset.opened = "";
    setStage("gone");
  }

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) skip();
    // Runs once on mount; skip() only uses refs and setters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function open() {
    if (stage !== "closed") return;
    playVideo();
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
        {/* The "seal": the couple's photo in a lace oval, as on the letter page */}
        <button type="button" className={styles.seal} aria-label={tapLabel}>
          <span className={styles.cameo}>
            <Image src={photo} alt={photoAlt} fill sizes="35vw" priority className={styles.cameoPhoto} />
          </span>
        </button>
      </div>

      <button
        type="button"
        className={styles.skip}
        onClick={(e) => {
          e.stopPropagation(); // do not also start the opening animation
          skip();
        }}
      >
        {skipLabel}
      </button>

      <p className={styles.tap} aria-hidden="true">
        {tapLabel}
      </p>
    </div>
  );
}
