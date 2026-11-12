"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { preload } from "react-dom";
import styles from "./Envelope.module.css";

type FlapName = "top" | "bottom" | "left" | "right";

// Opening sequence, in order. Each stage starts at `at` ms after the tap,
// and every stage reached stays on, so the CSS can build on it.
//   untie   the bow is pulled, its loops close, the ribbon falls away
//   opened  the four flaps open in 3D
//   fading  the envelope fades, the hero shows through
//   gone    the envelope is removed from the page
const STAGES = [
  { name: "untie", at: 0 },
  { name: "opened", at: 850 },
  { name: "fading", at: 2000 },
  { name: "gone", at: 2700 },
] as const;

type Stage = "closed" | (typeof STAGES)[number]["name"];

// Drawing order: the top flap comes last, so it sits above the others.
const FLAPS: FlapName[] = ["left", "right", "bottom", "top"];

type Props = {
  envelope: string; // photo of the closed envelope, flaps meeting in the centre
  ribbon: string; // the ribbon and its bow, on a transparent background
  guestName: string; // "The Haddad Family"
  tapLabel: string; // "Open the invitation"
  skipLabel: string; // "Skip"
};

export function Envelope({ envelope, ribbon, guestName, tapLabel, skipLabel }: Props) {
  const [stage, setStage] = useState<Stage>("closed");
  const timers = useRef<number[]>([]);

  // Clear pending timers if the component is removed mid-animation.
  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  // Once the envelope starts fading, tell the page it is open:
  // the hero text reveals itself and scrolling is unlocked (both in CSS).
  useEffect(() => {
    if (stage === "fading") document.documentElement.dataset.opened = "";
  }, [stage]);

  // Straight to the invitation, no animation: the Skip button, and guests
  // whose phone asks for less motion.
  function skip() {
    timers.current.forEach(clearTimeout);
    timers.current.length = 0;
    document.documentElement.dataset.opened = "";
    setStage("gone");
  }

  // Runs once on mount. skip() waits for the next frame, so the state does
  // not change while React is still running the effect.
  useEffect(() => {
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const frame = requestAnimationFrame(() => {
      document.documentElement.dataset.opened = "";
      setStage("gone");
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  function open() {
    if (stage !== "closed") return;
    for (const { name, at } of STAGES) {
      timers.current.push(window.setTimeout(() => setStage(name), at));
    }
  }

  // Ask for both images at the top of the HTML, so the envelope is complete
  // on its first frame.
  preload(envelope, { as: "image", fetchPriority: "high" });
  preload(ribbon, { as: "image", fetchPriority: "high" });

  if (stage === "gone") return null;

  const reached = STAGES.slice(0, STAGES.findIndex((s) => s.name === stage) + 1);
  const className = [styles.envelope, ...reached.map((s) => styles[s.name])].join(" ");

  // The images come from the invitation's data, so CSS gets them as variables.
  const images = {
    "--envelope": `url(${envelope})`,
    "--ribbon": `url(${ribbon})`,
  } as CSSProperties;

  return (
    <div className={className} style={images} onClick={open}>
      <div className={styles.box}>
        {FLAPS.map((name) => (
          <div key={name} className={`${styles.flap} ${styles[name]}`} aria-hidden="true" />
        ))}
        <div className={styles.ribbon} aria-hidden="true" />
      </div>
      <div className={styles.light} aria-hidden="true" />

      <button type="button" className={styles.label}>
        <span className={styles.guest}>{guestName}</span>
        <span className={styles.tap}>{tapLabel}</span>
        <span className={styles.chevron} aria-hidden="true" />
      </button>

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
    </div>
  );
}
