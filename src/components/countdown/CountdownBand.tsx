import { delay } from "@/lib/motion";
import { Countdown } from "./Countdown";

// The countdown: the same sage linen as the lace pages, without a card. Server Component; only the numbers are client-side.
type Props = {
  label: string; // "Saturday · 19 June 2027"
  title: string; // "The countdown to forever"
  target: string;
  units: string[];
};

export function CountdownBand({ label, title, target, units }: Props) {
  return (
    <section className="band linen">
      <p className="caps" style={{ opacity: 0.75 }} data-a="up">
        {label}
      </p>
      <p className="scr" style={{ fontSize: "12.5cqw", ...delay(0.15) }} data-a="soft">
        {title}
      </p>
      <div data-a="up" style={delay(0.3)}>
        <Countdown target={target} units={units} />
      </div>
    </section>
  );
}
