import Image from "next/image";
import { Rsvp, type RsvpText } from "./Rsvp";

// Page 7: a field photo behind, and the RSVP card floating on top.
// Server Component; the card and its sheet run in the browser.
type Props = {
  background: string;
  storageKey: string;
  guestName: string;
  seats: number;
  replyBy: string;
  seatsText: string;
  t: RsvpText;
};

export function RsvpScene({ background, ...rsvp }: Props) {
  return (
    <section className="scene" id="rsvp">
      <div className="bgx" data-p="0.25">
        <Image
          src={background}
          alt=""
          fill
          sizes="100vw"
          className="bgx-img"
          style={{ objectPosition: "center 70%" }}
        />
      </div>
      <div className="float">
        <div data-a="rise">
          <Rsvp {...rsvp} />
        </div>
      </div>
    </section>
  );
}
