import Image from "next/image";
import { DetailsCard, type DetailItem } from "./DetailsCard";

// Page 5: a photo behind, and the floating "The details" card on top.
// Server Component; only the card itself runs in the browser.
type Props = {
  background: string;
  card: {
    title: string;
    tapOpen: string;
    tapClose: string;
    mapLabel: string;
    openLabel: string;
    closeLabel: string;
    items: DetailItem[];
  };
};

export function DetailsScene({ background, card }: Props) {
  return (
    <section className="scene">
      <div className="bgx" data-p="0.25">
        <Image
          src={background}
          alt=""
          fill
          sizes="100vw"
          className="bgx-img"
          style={{ objectPosition: "center 85%" }}
        />
      </div>
      <div className="float">
        <div data-a="rise">
          <DetailsCard {...card} />
        </div>
      </div>
    </section>
  );
}
