import Image from "next/image";
import { DoilyFrame } from "@/components/lace/DoilyFrame";
import { delay } from "@/lib/motion";
import styles from "./FramedScene.module.css";

// Page 3: a field photo behind (with parallax), the monogram in a ring,
// and a photo in a floating lace frame. Server Component.
type Props = {
  background: string;
  photo: string;
  photoAlt: string;
  monogram: string;
  title: string; // "are getting married"
  when: string; // "Saturday · 19 June 2027"
};

export function FramedScene({ background, photo, photoAlt, monogram, title, when }: Props) {
  return (
    <section className="scene">
      <div className="bgx" data-p="0.25">
        <Image src={background} alt="" fill sizes="100vw" className="bgx-img" />
      </div>

      <div className={styles.crest} data-a="up">
        <span>{monogram}</span>
      </div>

      <div className="float">
        <DoilyFrame className={styles.framed} data-a="zoom" style={delay(0.15)}>
          <Image
            src={photo}
            alt={photoAlt}
            width={720}
            height={720}
            sizes="60vw"
            className={styles.photo}
          />
        </DoilyFrame>
      </div>

      <p className="scr" data-a="soft" style={delay(0.4)}>
        {title}
      </p>
      <p className="caps" data-a="up" style={delay(0.6)}>
        {when}
      </p>
    </section>
  );
}
