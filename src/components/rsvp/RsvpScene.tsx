import { Rsvp, type RsvpText } from "./Rsvp";

// "Kindly reply": the RSVP lace card floating on sage linen.
// Server Component; the card and its sheet run in the browser.
type Props = {
  storageKey: string;
  guestName: string;
  seats: number;
  replyBy: string;
  seatsText: string;
  t: RsvpText;
};

export function RsvpScene(rsvp: Props) {
  return (
    <section className="scene linen" id="rsvp">
      <div className="float">
        <div data-a="rise">
          <Rsvp {...rsvp} />
        </div>
      </div>
    </section>
  );
}
