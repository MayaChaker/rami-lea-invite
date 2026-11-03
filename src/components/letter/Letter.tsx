import Image from "next/image";
import { BowIcon } from "@/components/icons";
import { delay } from "@/lib/motion";
import styles from "./Letter.module.css";

// Page 2: a cameo photo in an oval frame, the couple's letter and their signature.
type Props = {
  photo: string;
  photoAlt: string;
  letter: string;
  signature: string; // "Rami & Lea"
};

export function Letter({ photo, photoAlt, letter, signature }: Props) {
  return (
    <section className="paper">
      <div className={styles.oval} data-a="up">
        <Image src={photo} alt={photoAlt} fill sizes="50vw" className={styles.photo} />
      </div>
      <p className="body it" data-a="up" style={delay(0.15)}>
        {letter}
      </p>
      <p className={`scr ${styles.sign}`} data-a="soft" style={delay(0.3)}>
        {signature}
      </p>
      <BowIcon className="icon" data-a="draw" style={delay(0.5)} />
    </section>
  );
}
