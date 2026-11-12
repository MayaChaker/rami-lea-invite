import Image from "next/image";
import { delay } from "@/lib/motion";
import styles from "./Hero.module.css";

// The first page after the envelope: the couple's photo with their names.
// A Server Component: no JavaScript. The envelope sets <html data-opened>,
// and the CSS below reveals the text and starts the slow zoom when it sees it.

type Props = {
  kicker: string; // "We're getting married"
  groom: string;
  amp: string; // "&" or "و"
  bride: string;
  when: string; // "19 June 2027 · Jounieh, Lebanon"
  scrollLabel: string;
  photo: string;
  photoAlt: string;
};

export function Hero(p: Props) {
  return (
    <section className={styles.hero}>
      <div className={styles.zoom}>
        {/* The page's main image: `priority` loads it first, so it is ready
            behind the envelope before the guest taps. */}
        <Image src={p.photo} alt={p.photoAlt} fill priority sizes="100vw" className={styles.photo} />
      </div>

      <div className={styles.text}>
        <p className={`${styles.caps} ${styles.reveal}`} style={delay(0.1)}>
          {p.kicker}
        </p>
        <h1 className={`${styles.names} ${styles.reveal}`} style={delay(0.35)}>
          {p.groom} <span className={styles.amp}>{p.amp}</span> {p.bride}
        </h1>
        <p className={`${styles.caps} ${styles.reveal}`} style={delay(0.8)}>
          {p.when}
        </p>
      </div>

      <div className={`${styles.cue} ${styles.reveal}`} style={delay(1.4)} aria-hidden="true">
        <span className={styles.caps}>{p.scrollLabel}</span>
        <i />
      </div>
    </section>
  );
}
