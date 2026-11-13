"use client";

import { useEffect, useId, useState, type FormEvent } from "react";
import { LabelCard } from "@/components/card/LabelCard";
import styles from "./Rsvp.module.css";

// The RSVP form, right on the page, on a label card. The guest's name and
// seats come from their link, so the form only asks: coming or not, how many,
// and an optional note for the couple.
//
// For now the reply is saved in this guest's browser only (localStorage).
// Step 5 replaces save() with a Server Action that writes to Supabase.

type Answer = "yes" | "no";
type Reply = { answer: Answer; count: number; message: string };

export type RsvpText = {
  title: string; // "RSVP"
  question: string; // "Will you be joining us?"
  accept: string;
  decline: string;
  howMany: string;
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
};

type Props = {
  storageKey: string; // one saved reply per invitation and guest
  guestName: string;
  seats: number; // seats reserved for this guest: the starting number
  max: number; // the guest picks from 1 to this
  replyBy: string; // "Kindly reply before 19 May 2027"
  t: RsvpText;
};

export function Rsvp({ storageKey, guestName, seats, max, replyBy, t }: Props) {
  const ids = { answer: useId(), count: useId(), note: useId() };
  const start = Math.min(Math.max(seats, 1), max);
  const [answer, setAnswer] = useState<Answer | "">("");
  const [count, setCount] = useState(start);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [sent, setSent] = useState<Reply | null>(null);

  // A reply this guest already sent from this phone. localStorage only exists
  // in the browser, so it is read after the first render, on the next frame.
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        const raw = localStorage.getItem(storageKey);
        if (!raw) return;
        const saved = JSON.parse(raw) as Reply;
        setSent(saved);
        setAnswer(saved.answer);
        setCount(saved.count || start);
        setMessage(saved.message);
      } catch {
        // Private mode or a bad value: start fresh.
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [storageKey, start]);

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
    <LabelCard className={styles.card}>
      <h2 className={`title ${styles.title}`}>{sent ? t.merci : t.title}</h2>
      {!sent && <p className={`caps ${styles.by}`}>{replyBy}</p>}
      <span className="divider" aria-hidden="true">
        <i />
      </span>

      {sent ? (
        <div className={styles.thanks} aria-live="polite">
          {/* What was sent, so the guest knows the reply went through */}
          <p className={`caps ${styles.summary}`}>
            {guestName} · {sent.answer === "yes" ? `${sent.count} ${t.attending}` : t.declined}
          </p>
          <p className="body it">{thanks}</p>
          <button type="button" className={styles.change} onClick={() => setSent(null)}>
            {t.change}
          </button>
        </div>
      ) : (
        <form className={styles.form} onSubmit={submit} noValidate>
          {/* Who: known from the link, shown, not asked */}
          <div className={`${styles.field} ${styles.who}`}>
            <PersonIcon />
            <span>{guestName}</span>
          </div>

          <label className={`${styles.field} ${error ? styles.invalid : ""}`} htmlFor={ids.answer}>
            <CheckIcon />
            <select
              id={ids.answer}
              value={answer}
              aria-invalid={error}
              onChange={(e) => {
                setAnswer(e.target.value as Answer);
                setError(false);
              }}
            >
              <option value="" disabled>
                {t.question}
              </option>
              <option value="yes">{t.accept}</option>
              <option value="no">{t.decline}</option>
            </select>
          </label>

          {/* How many: the guest picks 1 to max (7 by default in the data) */}
          {answer === "yes" && (
            <label className={`${styles.field} ${styles.count}`} htmlFor={ids.count}>
              <PeopleIcon />
              <span>{t.howMany}</span>
              <select id={ids.count} value={count} onChange={(e) => setCount(Number(e.target.value))}>
                {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
          )}

          <label className={`${styles.field} ${styles.note}`} htmlFor={ids.note}>
            <NoteIcon />
            <textarea
              id={ids.note}
              rows={2}
              placeholder={`${t.note} (${t.optional})`}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </label>

          {error && (
            <p className={styles.error} role="alert">
              {t.chooseFirst}
            </p>
          )}

          <button type="submit" className={styles.send}>
            {t.send}
          </button>
        </form>
      )}
    </LabelCard>
  );
}

// Small line icons for the fields (16×16)
function PersonIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <circle cx="8" cy="5" r="3" />
      <path d="M2 15c0-4 3-6 6-6s6 2 6 6" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="M3 8.5l3 3 7-7" />
    </svg>
  );
}

function PeopleIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <circle cx="5.5" cy="5" r="2.5" />
      <circle cx="11" cy="5.5" r="2" />
      <path d="M1 14c0-3 2-4.8 4.5-4.8S10 11 10 14M10 9.6c.4-.2.8-.3 1-.3 2.2 0 4 1.6 4 4.7" />
    </svg>
  );
}

function NoteIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="M2 3h12v8H7l-3 3v-3H2z" />
    </svg>
  );
}
