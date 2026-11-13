import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { daysUntil, formatDate } from "@/lib/format";
import { getInvitationBySecret } from "@/lib/getInvitation";
import { getReplies } from "@/lib/getReplies";
import { initials } from "@/lib/initials";
import { GuestList, type Row } from "./GuestList";
import styles from "./dashboard.module.css";

// The couple's private dashboard: who is coming, who declined, who has not
// replied yet, and the notes guests left. Reached only by its secret link.
// Attendance is never shown on the guests' pages.

// The couple opens it straight from their link, never through in-app navigation.
export const instant = false;

// Private: never listed by search engines.
export const metadata: Metadata = {
  title: "Guest replies",
  robots: { index: false, follow: false },
};

const short = (iso: string) => formatDate(iso, "en", { day: "numeric", month: "short" });

export default async function Dashboard({ params }: { params: Promise<{ secret: string }> }) {
  // Rendered on every visit, never at build time: the replies change all the
  // time (once the database is connected), and so does "days to go".
  await connection();
  const { secret } = await params;
  const inv = getInvitationBySecret(secret);
  if (!inv) notFound();

  const { invited, replies } = await getReplies(inv);

  // One row per invited guest (replied or not), then the shared-link replies
  const byToken = new Map(replies.filter((r) => r.token).map((r) => [r.token, r]));
  const rows: Row[] = [
    ...invited.map((g): Row => {
      const r = byToken.get(g.token);
      return {
        key: g.token,
        name: g.name,
        seats: g.seats,
        status: r ? r.answer : "waiting",
        count: r?.count ?? 0,
        message: r?.message ?? "",
        repliedOn: r ? short(r.repliedAt) : "",
        link: `/i/${inv.slug}/${g.token}`,
      };
    }),
    ...replies
      .filter((r) => !r.token)
      .map(
        (r, i): Row => ({
          key: `shared-${i}`,
          name: r.name,
          seats: 0,
          status: r.answer,
          count: r.count,
          message: r.message,
          repliedOn: short(r.repliedAt),
          shared: true,
        }),
      ),
  ];

  // The numbers
  const people = rows.reduce((sum, r) => sum + r.count, 0);
  const coming = rows.filter((r) => r.status === "yes").length;
  const declined = rows.filter((r) => r.status === "no").length;
  const waiting = rows.filter((r) => r.status === "waiting").length;
  const seats = invited.reduce((sum, g) => sum + g.seats, 0);
  const answered = invited.filter((g) => byToken.has(g.token)).length;
  const share = invited.length ? answered / invited.length : 0;
  const notes = rows.filter((r) => r.message);

  const names = `${inv.couple.groom.en} & ${inv.couple.bride.en}`;
  const replyBy = formatDate(inv.rsvpBy, "en", { day: "numeric", month: "long" });
  const days = daysUntil(inv.date);

  // The progress ring: a circle whose stroke is drawn up to `share`
  const R = 34;
  const C = 2 * Math.PI * R;

  return (
    <main className={styles.page}>
      <header className={styles.top}>
        <span className={styles.mono}>{inv.couple.monogram}</span>
        <div>
          <p className={styles.names}>{names}</p>
          <p className={styles.kicker}>Guest list · private</p>
        </div>
        <p className={styles.days}>
          <b>{days}</b> days to go
        </p>
      </header>

      <div className={styles.layout}>
        <aside className={styles.side}>
          {/* The headline: how many people are coming, and how many answered */}
          <section className={styles.hero} aria-label="Summary">
            <div>
              <p className={styles.heroLabel}>Guests coming</p>
              <p className={styles.heroNumber}>{people}</p>
              <p className={styles.heroSub}>
                from {coming} {coming === 1 ? "reply" : "replies"} · {seats} seats reserved
              </p>
            </div>
            <svg className={styles.ring} viewBox="0 0 80 80" role="img" aria-label={`${Math.round(share * 100)}% answered`}>
              <circle cx="40" cy="40" r={R} className={styles.ringTrack} />
              <circle
                cx="40"
                cy="40"
                r={R}
                className={styles.ringValue}
                strokeDasharray={`${C * share} ${C}`}
                transform="rotate(-90 40 40)"
              />
              <text x="40" y="41" className={styles.ringText}>
                {Math.round(share * 100)}%
              </text>
              <text x="40" y="53" className={styles.ringSmall}>
                answered
              </text>
            </svg>
          </section>

          <section className={styles.tiles}>
            <div className={styles.tile}>
              <span className={`${styles.dot} ${styles.dotYes}`} />
              <b>{coming}</b>
              <span>Accepted</span>
            </div>
            <div className={styles.tile}>
              <span className={`${styles.dot} ${styles.dotNo}`} />
              <b>{declined}</b>
              <span>Declined</span>
            </div>
            <div className={styles.tile}>
              <span className={`${styles.dot} ${styles.dotWait}`} />
              <b>{waiting}</b>
              <span>Waiting</span>
            </div>
          </section>

          <p className={styles.deadline}>Replies close on {replyBy}</p>

          {/* The notes guests left with their reply */}
          {notes.length > 0 && (
            <section className={styles.notes} aria-label="Notes from your guests">
              <h2 className={styles.h2}>Notes from your guests</h2>
              {notes.map((r) => (
                <figure key={r.key} className={styles.note}>
                  <blockquote>{r.message}</blockquote>
                  <figcaption>
                    <span className={`${styles.noteAvatar} ${styles[r.status]}`} aria-hidden="true">
                      {initials(r.name)}
                    </span>
                    <span className={styles.noteWho}>
                      {r.name}
                      <small>
                        {r.status === "yes" ? `${r.count} coming` : "Declined"} · {r.repliedOn}
                      </small>
                    </span>
                  </figcaption>
                </figure>
              ))}
            </section>
          )}
        </aside>

        <GuestList rows={rows} />
      </div>

      <p className={styles.demo}>
        Demo data. Once the database is connected (step 5), replies appear here as guests send them.
      </p>
    </main>
  );
}
