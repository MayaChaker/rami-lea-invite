import Image from "next/image";
import { BowIcon } from "@/components/icons";
import { delay } from "@/lib/motion";
import styles from "./Letter.module.css";

// Page 2: a cameo photo in an oval frame, the couple's letter and their signature.
type Props = {
  photo: string;
  photoAlt: string;
  families: string; // "The Nassar & Khalil families"
  honour: string; // "have the honour of inviting you"
  letter: string;
  signature: string; // "Rami & Lea"
};

export function Letter({ photo, photoAlt, families, honour, letter, signature }: Props) {
  return (
    <section className="paper">
      {/* The oval photo, with a lace ring around it */}
      <div className={styles.cameo} data-a="up">
        <div className={styles.oval}>
          <Image src={photo} alt={photoAlt} fill sizes="50vw" className={styles.photo} />
        </div>
      </div>
      {/* The families' traditional invitation line, then the couple's own words */}
      <div className={styles.families} data-a="up" style={delay(0.1)}>
        <p className="caps">{families}</p>
        <p className={`body it ${styles.honour}`}>{honour}</p>
      </div>
      <p className="body it" data-a="up" style={delay(0.2)}>
        {letter}
      </p>
      <p className={`scr ${styles.sign}`} data-a="soft" style={delay(0.35)}>
        {signature}
      </p>
      <BowIcon className="icon" data-a="draw" style={delay(0.5)} />
    </section>
  );
}
