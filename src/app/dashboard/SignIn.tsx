"use client";

import Image from "next/image";
import { useActionState } from "react";
import { signIn } from "./actions";
import styles from "./dashboard.module.css";

// The password screen, shown until the couple signs in: a card in the middle
// of the screen, over one of the invitation's photos, blurred.
// The photo is decoration only, never the dashboard itself: until the password
// is right, the server sends nothing about the guests (a blur is only CSS,
// and anyone could read what is under it in the page source).
type Props = { names: string; monogram: string; background: string };

export function SignIn({ names, monogram, background }: Props) {
  const [state, action, pending] = useActionState(signIn, { error: false });

  return (
    <main className={styles.signIn}>
      <Image src={background} alt="" fill sizes="100vw" priority className={styles.signInPhoto} />

      <section className={styles.signInCard} role="dialog" aria-modal="true" aria-labelledby="sign-in-title">
        <span className={styles.mono}>{monogram}</span>
        <h1 id="sign-in-title" className={styles.names}>
          {names}
        </h1>
        <p className={styles.kicker}>Guest list · private</p>

        <form action={action} className={styles.signInForm}>
          <label htmlFor="password" className={styles.kicker}>
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            autoFocus
            aria-invalid={state.error}
            className={styles.password}
          />
          {state.error && (
            <p className={styles.wrong} role="alert">
              {state.tooMany
                ? "Too many attempts. Please wait 15 minutes and try again."
                : "Wrong password, please try again."}
            </p>
          )}
          <button type="submit" className={styles.enter} disabled={pending}>
            {pending ? "…" : "Open"}
          </button>
        </form>
      </section>
    </main>
  );
}
