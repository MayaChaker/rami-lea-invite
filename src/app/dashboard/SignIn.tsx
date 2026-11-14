"use client";

import { useActionState } from "react";
import { signIn } from "./actions";
import styles from "./dashboard.module.css";

// The password screen, shown until the couple signs in.
export function SignIn({ names, monogram }: { names: string; monogram: string }) {
  const [state, action, pending] = useActionState(signIn, { error: false });

  return (
    <main className={styles.signIn}>
      <span className={styles.mono}>{monogram}</span>
      <p className={styles.names}>{names}</p>
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
            Wrong password, please try again.
          </p>
        )}
        <button type="submit" className={styles.enter} disabled={pending}>
          {pending ? "…" : "Open"}
        </button>
      </form>
    </main>
  );
}
