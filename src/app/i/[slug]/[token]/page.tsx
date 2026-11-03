import { notFound } from "next/navigation";
import { Envelope } from "@/components/envelope/Envelope";
import { Hero } from "@/components/hero/Hero";
import { Letter } from "@/components/letter/Letter";
import { RevealObserver } from "@/components/motion/RevealObserver";
import { copy } from "@/lib/copy";
import { formatDate } from "@/lib/format";
import { getInvitation, getGuest, allGuestPaths } from "@/lib/getInvitation";
import "./invitation.css";

// Guests open this page directly from WhatsApp, never through in-app navigation.
export const instant = false;

export function generateStaticParams() {
  return allGuestPaths();
}

export default async function GuestInvitation({
  params,
}: {
  params: Promise<{ slug: string; token: string }>;
}) {
  const { slug, token } = await params;
  const inv = getInvitation(slug);
  const guest = inv && getGuest(inv, token);
  if (!inv || !guest) notFound();

  const L = guest.lang;
  const t = copy[L];
  const myEvents = inv.events.filter((e) => guest.events.includes(e.id));

  const names = `${inv.couple.groom[L]}${t.and}${inv.couple.bride[L]}`;
  const when = `${formatDate(inv.date, L, { day: "numeric", month: "long", year: "numeric" })} · ${inv.city[L]}`;

  return (
    <main className="invitation" lang={L} dir={L === "ar" ? "rtl" : "ltr"}>
      <Envelope
        families={t.families(inv.couple.families.groom[L], inv.couple.families.bride[L])}
        honour={t.honour}
        tapLabel={t.tapSeal}
        monogram={inv.couple.monogram}
      />

      <Hero
        kicker={t.getting}
        groom={inv.couple.groom[L]}
        amp={t.amp}
        bride={inv.couple.bride[L]}
        when={when}
        scrollLabel={t.scroll}
        video={inv.media.heroVideo}
        poster={inv.media.heroPoster}
        videoLabel={inv.media.heroAlt[L]}
      />

      <Letter
        photo={inv.media.cameo}
        photoAlt={names}
        letter={inv.letter[L]}
        signature={names}
      />

      {/* Temporary: guest data, until the next sections are built */}
      <section style={{ display: "grid", placeContent: "center", gap: 8, padding: 32, textAlign: "center" }}>
        <p>{guest.name[L]}</p>
        <p>{guest.seats} seats</p>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {myEvents.map((e) => (
            <li key={e.id}>
              {e.label[L]} · {e.time[L]} · {e.place[L]}
            </li>
          ))}
        </ul>
      </section>
      <RevealObserver />
    </main>
  );
}
