import Image from "next/image";
import { DetailsCard, type DetailItem } from "./DetailsCard";

// "The celebration": a garden photo, and the label card with the guest's
// events floating on top. Server Component: no JavaScript at all.
type Props = {
  background: string;
  card: {
    title: string;
    when: string;
    mapLabel: string;
    items: DetailItem[];
  };
};

export function DetailsScene({ background, card }: Props) {
  return (
    <section className="scene clear">
      <div className="bgx" data-p="0.25">
        <Image src={background} alt="" fill sizes="100vw" className="bgx-img" />
      </div>
      <div className="float">
        <div data-a="rise">
          <DetailsCard {...card} />
        </div>
      </div>
    </section>
  );
}
