import { HERO_VIDEO_ID } from "@/lib/ids";
import { delay } from "@/lib/motion";
import styles from "./Hero.module.css";

// The first page after the envelope: the couple's video with their names.
// A Server Component: no JavaScript. The envelope starts the video and sets
// <html data-opened>, and the CSS below reveals the text when it sees it.

type Props = {
  kicker: string; // "We're getting married"
  groom: string;
  amp: string; // "&" or "و"
  bride: string;
  when: string; // "19 June 2027 · Jounieh, Lebanon"
  scrollLabel: string;
  video: string;
  poster: string;
  videoLabel: string;
};

export function Hero(p: Props) {
  return (
    <section className={styles.hero}>
      <div className={styles.zoom}>
        <video
          id={HERO_VIDEO_ID}
          className={styles.video}
          src={p.video}
          poster={p.poster}
          muted
          playsInline
          loop
          preload="none" /* the envelope starts the download once the page has settled */
          aria-label={p.videoLabel}
        />
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
