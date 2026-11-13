import Image from "next/image";
import { delay } from "@/lib/motion";
import styles from "./Letter.module.css";

// The Letter: the couple's photo in an oval, the families' invitation line,
// the couple's names (the largest line) and their letter. Ivory paper with
// watercolour flowers in two corners.
type Props = {
  photo: string;
  photoAlt: string;
  families: string; // "The Nassar & Khalil families"
  honour: string; // "have the honour of inviting you to the marriage of their children"
  letter: string;
  signature: string; // "Rami & Lea"
};

export function Letter({ photo, photoAlt, families, honour, letter, signature }: Props) {
  return (
    <section className="paper">
      <span className="deco sprig tl" style={{ width: "62cqw" }} aria-hidden="true" />
      <span className="deco roses br flip" style={{ width: "62cqw" }} aria-hidden="true" />

      {/* The oval photo, with two fine lines around it */}
      <div className={styles.cameo} data-a="up">
        <div className={styles.oval}>
          <Image src={photo} alt={photoAlt} fill sizes="45vw" className={styles.photo} />
        </div>
      </div>

      {/* The families' traditional invitation line, then the couple's own words */}
      <div className={styles.families} data-a="up" style={delay(0.1)}>
        <p className="caps">{families}</p>
        <p className={`body it ${styles.honour}`}>{honour}</p>
      </div>
      <p className={`scr ${styles.sign}`} data-a="soft" style={delay(0.25)}>
        {signature}
      </p>
      <span className="divider" data-a="up" style={delay(0.35)} aria-hidden="true">
        <i />
      </span>
      <p className="body it" data-a="up" style={delay(0.45)}>
        {letter}
      </p>
    </section>
  );
}
