import { RingsIcon } from "@/components/icons";
import { delay } from "@/lib/motion";
import styles from "./Notes.module.css";

// Page 6: "Good to know". The couple's notes (dress code, children, gifts...),
// as many as the data file has. Server Component, no JavaScript.
type Props = {
  label: string; // "Good to know"
  notes: { title: string; text: string }[];
};

export function Notes({ label, notes }: Props) {
  return (
    <section className="paper alt">
      <RingsIcon className="icon" data-a="draw" />
      <p className="caps" data-a="up">
        {label}
      </p>
      <div className={styles.rows}>
        {notes.map((note, i) => (
          <div key={note.title} className={styles.row} data-a="up" style={delay(0.1 * (i + 1))}>
            <p className="caps">{note.title}</p>
            <p className="body">{note.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
