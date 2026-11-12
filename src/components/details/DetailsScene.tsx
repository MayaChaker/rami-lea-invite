import { DetailsCard, type DetailItem } from "./DetailsCard";

// "The details": the floating lace card on sage linen.
// Server Component; only the card itself runs in the browser.
type Props = {
  card: {
    title: string;
    when: string; // "Saturday · 19 June 2027"
    summary: string; // "The zaffé, the ceremony and the reception"
    tapOpen: string;
    tapClose: string;
    mapLabel: string;
    openLabel: string;
    closeLabel: string;
    items: DetailItem[];
  };
};

export function DetailsScene({ card }: Props) {
  return (
    <section className="scene linen">
      <div className="float">
        <div data-a="rise">
          <DetailsCard {...card} />
        </div>
      </div>
    </section>
  );
}
