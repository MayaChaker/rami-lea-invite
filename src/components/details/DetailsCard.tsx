"use client";

import { useState, type KeyboardEvent, type MouseEvent } from "react";
import { DoilyFrame } from "@/components/lace/DoilyFrame";
import { HandIcon } from "@/components/icons";
import styles from "./DetailsCard.module.css";

// "The details": a lace card that flips over on tap to show the events.
export type DetailItem = {
  id: string;
  label: string; // "The ceremony"
  time: string; // "five o'clock"
  place: string; // "Saint Elie Church, Jounieh"
  mapsQuery: string;
};

type Props = {
  title: string;
  tapOpen: string;
  tapClose: string;
  mapLabel: string;
  openLabel: string; // for screen readers
  closeLabel: string;
  items: DetailItem[];
};

export function DetailsCard(p: Props) {
  const [open, setOpen] = useState(false);
  // Once the guest has tapped once, the "tap here" hint is no longer needed.
  const [seen, setSeen] = useState(false);

  function toggle() {
    setOpen((o) => !o);
    setSeen(true);
  }

  function onClick(e: MouseEvent) {
    // A tap on Map or Waze opens the link; it should not flip the card.
    if ((e.target as HTMLElement).closest("a")) return;
    toggle();
  }

  function onKeyDown(e: KeyboardEvent) {
    if (e.target !== e.currentTarget) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggle();
    }
  }

  return (
    <div
      className={`${styles.card} ${open ? styles.open : ""}`}
      role="button"
      tabIndex={0}
      aria-expanded={open}
      aria-label={open ? p.closeLabel : p.openLabel}
      onClick={onClick}
      onKeyDown={onKeyDown}
    >
      <div className={styles.inner}>
        {/* Front. `inert` takes the hidden face out of tab order and screen readers. */}
        <DoilyFrame className={`${styles.face} ${styles.front}`} inert={open}>
          <p className={`scr ${styles.title}`}>{p.title}</p>
          <p className={`caps ${styles.hint}`}>{p.tapOpen}</p>
          {!seen && (
            <span className={styles.ripple} aria-hidden="true">
              <HandIcon />
            </span>
          )}
        </DoilyFrame>

        {/* Back */}
        <DoilyFrame className={`${styles.face} ${styles.back}`} inert={!open}>
          {p.items.map((item) => {
            const q = encodeURIComponent(item.mapsQuery);
            return (
              <div key={item.id} className={styles.item}>
                <p className={`caps ${styles.hint}`}>{item.label}</p>
                <span className={styles.time}>{item.time}</span>
                <span className={styles.place}>{item.place}</span>
                <div className="pills">
                  <a className={`pill ${styles.small}`} href={`https://maps.google.com/?q=${q}`} target="_blank" rel="noopener">
                    {p.mapLabel}
                  </a>
                  <a className={`pill ${styles.small}`} href={`https://waze.com/ul?q=${q}`} target="_blank" rel="noopener">
                    Waze
                  </a>
                </div>
              </div>
            );
          })}
          <p className={`caps ${styles.hint} ${styles.backHint}`}>{p.tapClose}</p>
        </DoilyFrame>
      </div>
    </div>
  );
}
