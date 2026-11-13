import { delay } from "@/lib/motion";
import { Countdown } from "./Countdown";

// The countdown: ivory paper with flowers in two corners, a title in spaced
// capitals, the four numbers, and "until forever" in script.
// Server Component; only the numbers run in the browser.
type Props = {
  label: string; // "Saturday · 19 June 2027"
  title: string; // "Counting down"
  closing: string; // "until forever"
  target: string;
  units: string[];
};

export function CountdownBand({ label, title, closing, target, units }: Props) {
  return (
    <section className="paper">
      <span className="deco sprig tl" style={{ width: "62cqw" }} aria-hidden="true" />
      <span className="deco roses br flip" style={{ width: "54cqw" }} aria-hidden="true" />

      <p className="caps" data-a="up">
        {label}
      </p>
      <h2 className="title" data-a="up" style={delay(0.1)}>
        {title}
      </h2>
      <span className="divider" data-a="up" style={delay(0.2)} aria-hidden="true">
        <i />
      </span>
      <div style={{ width: "100%", ...delay(0.3) }} data-a="up">
        <Countdown target={target} units={units} />
      </div>
      <p className="scr" style={{ fontSize: "11cqw", color: "var(--color-sage-dark)", marginTop: "3cqw", ...delay(0.5) }} data-a="soft">
        {closing}
      </p>
    </section>
  );
}
