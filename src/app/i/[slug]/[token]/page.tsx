import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CountdownBand } from "@/components/countdown/CountdownBand";
import { DetailsScene } from "@/components/details/DetailsScene";
import { PageDots } from "@/components/dots/PageDots";
import { Envelope } from "@/components/envelope/Envelope";
import { Hero } from "@/components/hero/Hero";
import { LaceTextures } from "@/components/lace/LaceTextures";
import { Letter } from "@/components/letter/Letter";
import { PageMotion } from "@/components/motion/PageMotion";
import { Notes } from "@/components/notes/Notes";
import { PhotosQr } from "@/components/photos/PhotosQr";
import { RsvpScene } from "@/components/rsvp/RsvpScene";
import { copy } from "@/lib/copy";
import { formatDate } from "@/lib/format";
import { getInvitation, getGuest, allGuestPaths } from "@/lib/getInvitation";
import "./invitation.css";

// Guests open this page directly from WhatsApp, never through in-app navigation.
export const instant = false;

export function generateStaticParams() {
  return allGuestPaths();
}

// What WhatsApp shows above the link: title, description (in the guest's
// language) and the picture from opengraph-image.tsx. Guest pages are private,
// so search engines are asked not to list them.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; token: string }>;
}): Promise<Metadata> {
  const { slug, token } = await params;
  const inv = getInvitation(slug);
  const guest = inv && getGuest(inv, token);
  if (!inv || !guest) return {};

  const L = guest.lang;
  const t = copy[L];
  const names = `${inv.couple.groom[L]}${t.and}${inv.couple.bride[L]}`;
  const title = `${names} · ${t.married}`;
  const description = `${formatDate(inv.date, L, { weekday: "long", day: "numeric", month: "long", year: "numeric" })} · ${inv.city[L]}`;

  return {
    title,
    description,
    openGraph: { title, description, type: "website", locale: L === "ar" ? "ar_LB" : "en_GB" },
    robots: { index: false, follow: false },
  };
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
  const day = formatDate(inv.date, L, { day: "numeric", month: "long", year: "numeric" });
  const weekday = formatDate(inv.date, L, { weekday: "long" });


  return (
    <main className="invitation" lang={L} dir={L === "ar" ? "rtl" : "ltr"}>
      <Envelope
        envelope={inv.media.envelope}
        ribbon={inv.media.ribbon}
        guestName={guest.name[L]}
        tapLabel={t.openInvitation}
        skipLabel={t.skip}
      />

      <Hero
        kicker={t.weddingOf}
        groom={inv.couple.groom[L]}
        amp={t.amp}
        bride={inv.couple.bride[L]}
        invited={t.invited}
        when={`${weekday} · ${day}`}
        photo={inv.media.hero}
        photoAlt={inv.media.heroAlt[L]}
      />

      <Letter
        photo={inv.media.cameo}
        photoAlt={names}
        families={t.families(inv.couple.families.groom[L], inv.couple.families.bride[L])}
        honour={t.honour}
        letter={inv.letter[L]}
        signature={names}
      />

      <CountdownBand
        label={`${weekday} · ${day}`}
        title={t.countdown}
        closing={t.untilForever}
        target={inv.date}
        units={t.units}
      />

      <DetailsScene
        background={inv.media.detailsBackground}
        card={{
          title: t.celebration,
          when: `${weekday} · ${day}`,
          mapLabel: t.map,
          // Only the events this guest is invited to
          items: myEvents.map((e) => ({
            id: e.id,
            label: e.label[L],
            time: e.time[L],
            place: e.place[L],
            mapsQuery: e.mapsQuery,
          })),
        }}
      />

      <Notes
        label={t.goodToKnow}
        notes={inv.notes.map((n) => ({ title: n.title[L], text: n.text[L], icon: n.icon }))}
        gifts={
          inv.gifts && {
            intro: t.giftIntro,
            copy: t.copy,
            copied: t.copied,
            methods: inv.gifts,
          }
        }
      />

      <RsvpScene
        background={inv.media.rsvpBackground}
        storageKey={`rsvp:${inv.slug}:${guest.token}`}
        guestName={guest.name[L]}
        seats={guest.seats}
        max={inv.rsvpMax}
        replyBy={t.replyBy(formatDate(inv.rsvpBy, L, { day: "numeric", month: "long", year: "numeric" }))}
        seatsText={t.seats(guest.seats)}
        t={{
          title: t.rsvpTitle,
          question: t.question,
          accept: t.accept,
          decline: t.decline,
          howMany: t.howMany,
          note: t.noteFor(names),
          optional: t.optional,
          send: t.send,
          chooseFirst: t.chooseFirst,
          merci: t.merci,
          thanksYesOne: t.thanksYesOne,
          thanksYesMany: t.thanksYesMany,
          thanksNo: t.thanksNo,
          attending: t.attending,
          declined: t.declined,
          change: t.change,
        }}
      />
      {inv.albumUrl && (
        <PhotosQr
          title={t.thankYou}
          label={t.partOfStory}
          text={t.scanText}
          url={inv.albumUrl}
          qrLabel={t.qrLabel}
        />
      )}

      <PageDots />
      <LaceTextures />
      <PageMotion />
    </main>
  );
}
