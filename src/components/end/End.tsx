import Image from "next/image";
import { delay } from "@/lib/motion";
import styles from "./End.module.css";

// The last page: a photo, the couple's signature and the date. Server Component.
type Props = {
  background: string;
  signature: string; // "Rami & Lea"
  date: string; // "19 · 06 · 2027"
};

export function End({ background, signature, date }: Props) {
  return (
    <section className={`scene ${styles.end}`}>
      <div className="bgx" data-p="0.25">
        <Image
          src={background}
          alt=""
          fill
          sizes="100vw"
          className="bgx-img"
          style={{ objectPosition: "center 30%" }}
        />
      </div>
      <p className={`scr ${styles.sign}`} data-a="soft">
        {signature}
      </p>
      {/* Digits and dots read the same in every language */}
      <p className="caps" data-a="up" style={delay(0.3)} dir="ltr">
        {date}
      </p>
    </section>
  );
}
