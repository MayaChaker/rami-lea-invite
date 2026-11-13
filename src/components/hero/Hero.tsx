import Image from "next/image";
import { delay } from "@/lib/motion";
import styles from "./Hero.module.css";

// The first page after the envelope: the couple's photo on top, and below it
// a sheet of ivory paper with a torn edge that carries their names.
// A Server Component: no JavaScript. The envelope sets <html data-opened>,
// and the CSS reveals the text and starts the slow zoom when it sees it.

type Props = {
  kicker: string; // "The wedding of"
  groom: string;
  amp: string; // "&" or "و"
  bride: string;
  invited: string; // "You are cordially invited to celebrate our wedding"
  when: string; // "Saturday · 19 June 2027 · Jounieh"
  photo: string;
  photoAlt: string;
};

// The torn top edge of the paper, as a clip-path. Seeded, so the tear has the
// same shape on every load (and on the server and in the browser).
function tornEdge(points = 160, seed = 7) {
  let s = seed;
  const random = () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
  const edge: string[] = [];
  for (let i = 0; i <= points; i++) {
    const x = (i / points) * 100;
    // Two slow waves (the shape of the tear) plus tiny fibres
    const y = 55 + Math.sin(i / 11) * 16 + Math.sin(i / 3.7) * 6 + (random() - 0.5) * 12;
    edge.push(`${x.toFixed(2)}% ${y.toFixed(1)}%`);
  }
  return `polygon(0 100%, ${edge.join(", ")}, 100% 100%)`;
}

const TORN = tornEdge();

export function Hero(p: Props) {
  return (
    <section className={styles.hero}>
      <div className={styles.frame}>
        <div className={styles.zoom}>
          {/* The page's main image: `priority` loads it first, so it is ready
              behind the envelope before the guest taps. */}
          <Image src={p.photo} alt={p.photoAlt} fill priority sizes="100vw" className={styles.photo} />
        </div>
      </div>

      <div className={styles.sheet}>
        <span className={styles.tear} style={{ clipPath: TORN }} aria-hidden="true" />
        <p className={`${styles.caps} ${styles.reveal}`} style={delay(0.2)}>
          {p.kicker}
        </p>
        <h1 className={`${styles.names} ${styles.reveal}`} style={delay(0.35)}>
          {p.groom} <span className={styles.amp}>{p.amp}</span> {p.bride}
        </h1>
        <p className={`${styles.caps} ${styles.invited} ${styles.reveal}`} style={delay(0.55)}>
          {p.invited}
        </p>
        <span className={`${styles.divider} ${styles.reveal}`} style={delay(0.65)} aria-hidden="true" />
        <p className={`${styles.caps} ${styles.reveal}`} style={delay(0.7)}>
          {p.when}
        </p>
      </div>
    </section>
  );
}
