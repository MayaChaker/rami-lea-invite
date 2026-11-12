import type { GiftMethod, NoteIcon } from "@/lib/types";
import { DressIcon, GiftIcon, RingsIcon, ToastIcon } from "@/components/icons";
import { delay } from "@/lib/motion";
import { CopyButton } from "./CopyButton";
import styles from "./Notes.module.css";

// Page 6: "Good to know". The couple's notes (dress code, children, gifts...),
// as many as the data file has, then optional ways to send a gift.
// Server Component; only the copy buttons run in the browser.
// Which drawing goes with each icon name in the data file.
const ICONS = { dress: DressIcon, adults: ToastIcon, gift: GiftIcon } satisfies Record<NoteIcon, unknown>;

type Props = {
  label: string; // "Good to know"
  notes: { title: string; text: string; icon?: NoteIcon }[];
  gifts?: {
    intro: string;
    copy: string;
    copied: string;
    methods: GiftMethod[];
  };
};

export function Notes({ label, notes, gifts }: Props) {
  return (
    <section className="paper">
      <RingsIcon className="icon" data-a="draw" />
      <p className="caps" data-a="up">
        {label}
      </p>
      <div className={styles.rows}>
        {notes.map((note, i) => {
          const Icon = note.icon && ICONS[note.icon];
          return (
            <div key={note.title} className={styles.row} data-a="up" style={delay(0.1 * (i + 1))}>
              {Icon && <Icon className={`icon ${styles.noteIcon}`} data-a="draw" style={delay(0.1 * (i + 1) + 0.2)} />}
              <p className="caps">{note.title}</p>
              <p className="body">{note.text}</p>
            </div>
          );
        })}
      </div>

      {gifts && gifts.methods.length > 0 && (
        <div className={styles.gifts} data-a="up" style={delay(0.1 * (notes.length + 1))}>
          <p className={`body it ${styles.intro}`}>{gifts.intro}</p>
          {gifts.methods.map((m) => (
            <div key={m.kind + m.value} className={styles.method}>
              <span className="caps">{m.name}</span>
              {/* Numbers and IBANs always read left to right, even in Arabic */}
              <span className={styles.value} dir="ltr">
                {m.value}
              </span>
              <CopyButton value={m.value} label={gifts.copy} done={gifts.copied} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
