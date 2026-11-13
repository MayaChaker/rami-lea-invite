import Image from "next/image";
import { Rsvp, type RsvpText } from "./Rsvp";

// The RSVP: a candle-lit table photo, and the reply form on a label card.
// Server Component; only the form runs in the browser.
type Props = {
  background: string;
  storageKey: string;
  guestName: string;
  seats: number;
  max: number;
  replyBy: string;
  seatsText: string;
  t: RsvpText;
};

export function RsvpScene({ background, ...rsvp }: Props) {
  return (
    <section className="scene clear" id="rsvp">
      <div className="bgx" data-p="0.25">
        <Image src={background} alt="" fill sizes="100vw" className="bgx-img" />
      </div>
      <div data-a="rise">
        <Rsvp {...rsvp} />
      </div>
    </section>
  );
}
