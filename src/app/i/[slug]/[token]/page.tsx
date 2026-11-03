import { notFound } from "next/navigation";
import { CountdownBand } from "@/components/countdown/CountdownBand";
import { DetailsScene } from "@/components/details/DetailsScene";
import { Envelope } from "@/components/envelope/Envelope";
import { Hero } from "@/components/hero/Hero";
import { FramedScene } from "@/components/framed/FramedScene";
import { LaceTextures } from "@/components/lace/LaceTextures";
import { Letter } from "@/components/letter/Letter";
import { PageMotion } from "@/components/motion/PageMotion";
import { Notes } from "@/components/notes/Notes";
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
  const when = `${day} · ${inv.city[L]}`;

  return (
    <main className="invitation" lang={L} dir={L === "ar" ? "rtl" : "ltr"}>
      <Envelope
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
        families={t.families(inv.couple.families.groom[L], inv.couple.families.bride[L])}
        honour={t.honour}
        letter={inv.letter[L]}
        signature={names}
      />

      <FramedScene
        background={inv.media.landscape}
        photo={inv.media.framed}
        photoAlt={names}
        monogram={inv.couple.monogram}
        title={t.married}
        when={`${weekday} · ${day}`}
      />

      <CountdownBand
        label={`${weekday} · ${day}`}
        title={t.countdown}
        target={inv.date}
        units={t.units}
      />

      {/* TODO: the prototype uses hero.webp here; land.webp until it is added. */}
      <DetailsScene
        background={inv.media.landscape}
        card={{
          title: t.details,
          tapOpen: t.tapOpen,
          tapClose: t.tapClose,
          mapLabel: t.map,
          openLabel: t.openDetails,
          closeLabel: t.closeDetails,
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
        notes={inv.notes.map((n) => ({ title: n.title[L], text: n.text[L] }))}
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
        background={inv.media.landscape}
        storageKey={`rsvp:${inv.slug}:${guest.token}`}
        guestName={guest.name[L]}
        seats={guest.seats}
        replyBy={t.replyBy(formatDate(inv.rsvpBy, L, { day: "numeric", month: "long", year: "numeric" }))}
        seatsText={t.seats(guest.seats)}
        t={{
          title: t.rsvpTitle,
          tapReply: t.tapReply,
          openLabel: t.openReply,
          accept: t.accept,
          decline: t.decline,
          howMany: t.howMany,
          less: t.less,
          more: t.more,
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
          close: t.close,
        }}
      />
      <LaceTextures />
      <PageMotion />
    </main>
  );
}
