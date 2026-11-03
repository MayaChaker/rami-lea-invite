"use client";

import { useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { BowIcon, HandIcon } from "@/components/icons";
import { DoilyFrame } from "@/components/lace/DoilyFrame";
import styles from "./Rsvp.module.css";

// The RSVP: a lace card on the page, and a bottom sheet with the reply form.
//
// The sheet is a native <dialog>. showModal() puts it above everything
// (the "top layer"), keeps keyboard focus inside it, closes on Escape,
// and makes the page behind it inert. No library needed.
//
// For now the reply is saved in this guest's browser only (localStorage).
// Step 5 replaces save() with a Server Action that writes to Supabase.

type Answer = "yes" | "no";
type Reply = { answer: Answer; count: number; message: string };

export type RsvpText = {
  title: string; // "Kindly reply"
  tapReply: string;
  openLabel: string; // for screen readers
  accept: string;
  decline: string;
  howMany: string;
  less: string;
  more: string;
  note: string; // "A note for Rami & Lea"
  optional: string;
  send: string;
  chooseFirst: string;
  merci: string;
  thanksYesOne: string;
  thanksYesMany: string;
  thanksNo: string;
  attending: string; // "attending" (after the number)
  declined: string; // "Regretfully declined"
  change: string;
  close: string;
};

type Props = {
  storageKey: string; // one saved reply per invitation and guest
  guestName: string;
  seats: number; // the most people this guest can bring
  replyBy: string; // "Please reply before 19 May 2027"
  seatsText: string; // "Two seats have been reserved in your honour."
  t: RsvpText;
};

export function Rsvp({ storageKey, guestName, seats, replyBy, seatsText, t }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const noteId = useId();
  const [seen, setSeen] = useState(false);
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [count, setCount] = useState(seats);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [sent, setSent] = useState<Reply | null>(null);

  // A reply this guest already sent from this phone (browser only, so in an effect).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;
      const saved = JSON.parse(raw) as Reply;
      setSent(saved);
      setAnswer(saved.answer);
      setCount(saved.count || seats);
      setMessage(saved.message);
    } catch {
      // Private mode or a bad value: start fresh.
    }
  }, [storageKey, seats]);

  function openSheet() {
    setSeen(true);
    dialog.current?.showModal();
  }

  function closeSheet() {
    dialog.current?.close();
  }

  function onCardKey(e: KeyboardEvent) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openSheet();
    }
  }

  function choose(a: Answer) {
    setAnswer(a);
    setError(false);
  }

  function save(reply: Reply) {
    try {
      localStorage.setItem(storageKey, JSON.stringify(reply));
    } catch {
      // Not saved on this phone; the thank-you still shows.
    }
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!answer) {
      setError(true);
      return;
    }
    const reply = { answer, count: answer === "yes" ? count : 0, message: message.trim() };
    save(reply);
    setSent(reply);
  }

  const thanks =
    sent?.answer === "yes" ? (sent.count === 1 ? t.thanksYesOne : t.thanksYesMany) : t.thanksNo;

  return (
    <>
      {/* The card on the page */}
      <div
        className={styles.card}
        role="button"
        tabIndex={0}
        aria-haspopup="dialog"
        aria-label={t.openLabel}
        onClick={openSheet}
        onKeyDown={onCardKey}
      >
        <DoilyFrame className={styles.face}>
          <p className={`scr ${styles.cardTitle}`}>{t.title}</p>
          <BowIcon className={`icon ${styles.bow}`} />
          <p className={`caps ${styles.hint}`}>{replyBy}</p>
          <p className={`body it ${styles.seats}`}>{seatsText}</p>
          {!seen && (
            <span className={styles.ripple} aria-hidden="true">
              <HandIcon />
            </span>
          )}
          <p className={`caps ${styles.hint}`}>{t.tapReply}</p>
        </DoilyFrame>
      </div>

      {/* The bottom sheet. A click on the dark backdrop (the dialog itself) closes it. */}
      <dialog
        ref={dialog}
        className={styles.sheet}
        aria-label={t.title}
        onClick={(e) => {
          if (e.target === e.currentTarget) closeSheet();
        }}
      >
        <div className={styles.inner}>
          <span className={styles.lace} aria-hidden="true" />
          <button type="button" className={styles.close} onClick={closeSheet} aria-label={t.close}>
            ×
          </button>
          {/* Only one script title at a time: "Kindly reply" or "Merci" */}
          {!sent && <p className={`scr ${styles.sheetTitle}`}>{t.title}</p>}

          {sent ? (
            <div className={styles.thanks}>
              <BowIcon className={`icon ${styles.thanksBow}`} />
              <p className={`scr ${styles.merci}`}>{t.merci}</p>
              {/* What was sent, so the guest knows the reply went through */}
              <p className={`caps ${styles.summary}`}>
                {guestName} · {sent.answer === "yes" ? `${sent.count} ${t.attending}` : t.declined}
              </p>
              <p className="body it">{thanks}</p>
              <span className={styles.rule} aria-hidden="true" />
              <button type="button" className={styles.change} onClick={() => setSent(null)}>
                {t.change}
              </button>
            </div>
          ) : (
            <form className={styles.box} onSubmit={submit} noValidate>
              <span className={styles.who}>{guestName}</span>

              <div className={styles.choice} role="group" aria-label={t.title}>
                <button type="button" className="pill" aria-pressed={answer === "yes"} onClick={() => choose("yes")}>
                  {t.accept}
                </button>
                <button type="button" className="pill" aria-pressed={answer === "no"} onClick={() => choose("no")}>
                  {t.decline}
                </button>
              </div>

              {answer === "yes" && seats > 1 && (
                <div className={styles.count}>
                  <span>{t.howMany}</span>
                  <div className={styles.stepper}>
                    <button
                      type="button"
                      aria-label={t.less}
                      disabled={count <= 1}
                      onClick={() => setCount((c) => Math.max(1, c - 1))}
                    >
                      −
                    </button>
                    <output aria-live="polite">{count}</output>
                    <button
                      type="button"
                      aria-label={t.more}
                      disabled={count >= seats}
                      onClick={() => setCount((c) => Math.min(seats, c + 1))}
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              <div className={styles.field}>
                <label htmlFor={noteId}>{t.note}</label>
                <textarea
                  id={noteId}
                  rows={2}
                  placeholder={t.optional}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>

              {error && (
                <p className={styles.error} role="alert">
                  {t.chooseFirst}
                </p>
              )}

              <button type="submit" className={`pill solid ${styles.send}`}>
                {t.send}
              </button>
            </form>
          )}
        </div>
      </dialog>
    </>
  );
}
