import type { ComponentType, SVGProps } from "react";
import { LabelCard } from "@/components/card/LabelCard";
import { DrumIcon, GlassesIcon, TwoRingsIcon } from "@/components/icons";
import type { EventId } from "@/lib/types";
import styles from "./DetailsCard.module.css";

// "The celebration": the guest's events on a label card, each with a line
// icon, its time and place, and a link to the map. Server Component.
export type DetailItem = {
  id: EventId;
  label: string; // "The ceremony"
  time: string; // "five o'clock"
  place: string; // "Saint Elie Church, Jounieh"
  mapsQuery: string;
};

type Props = {
  title: string; // "The celebration"
  when: string; // "Saturday · 19 June 2027"
  mapLabel: string; // "Map"
  items: DetailItem[];
};

// One icon per kind of event. `satisfies` makes TypeScript complain if a new
// event id is added without an icon.
const ICONS = {
  zaffe: DrumIcon,
  ceremony: TwoRingsIcon,
  reception: GlassesIcon,
} satisfies Record<EventId, ComponentType<SVGProps<SVGSVGElement>>>;

export function DetailsCard({ title, when, mapLabel, items }: Props) {
  return (
    <LabelCard>
      <h2 className={`title ${styles.title}`}>{title}</h2>
      <p className={`caps ${styles.when}`}>{when}</p>
      <span className="divider" aria-hidden="true">
        <i />
      </span>

      <ul className={styles.list}>
        {items.map((item) => {
          const Icon = ICONS[item.id];
          const q = encodeURIComponent(item.mapsQuery);
          return (
            <li key={item.id} className={styles.item}>
              <Icon className={styles.icon} />
              <div>
                <p className={styles.label}>{item.label}</p>
                <p className={styles.time}>{item.time}</p>
                <p className={styles.place}>{item.place}</p>
                <p className={styles.links}>
                  <a href={`https://maps.google.com/?q=${q}`} target="_blank" rel="noopener">
                    {mapLabel}
                  </a>
                  <span aria-hidden="true"> · </span>
                  <a href={`https://waze.com/ul?q=${q}`} target="_blank" rel="noopener">
                    Waze
                  </a>
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </LabelCard>
  );
}
