import { CountdownBand } from "@/components/countdown/CountdownBand";
import { DetailsScene } from "@/components/details/DetailsScene";
import { PageDots } from "@/components/dots/PageDots";
import { Envelope } from "@/components/envelope/Envelope";
import { Hero } from "@/components/hero/Hero";
import { Letter } from "@/components/letter/Letter";
import { PageMotion } from "@/components/motion/PageMotion";
import { Notes } from "@/components/notes/Notes";
import { PhotosQr } from "@/components/photos/PhotosQr";
import { RsvpScene } from "@/components/rsvp/RsvpScene";
import { copy } from "@/lib/copy";
import { formatDate } from "@/lib/format";
import type { Guest, Invitation } from "@/lib/types";
import "@/app/i/[slug]/[token]/invitation.css";

// The whole invitation, one screen per page. Used by two links:
// - a personal link (/i/rami-lea/haddad-7x2k): `guest` is known, so the
//   envelope shows their name, only their events are listed, and the RSVP
//   already knows who is replying;
// - the shared link (the home page): `guest` is null, every event is listed,
//   and the RSVP asks for the guest's name. Its language is set by the couple.

type Props = {
  inv: Invitation;
  guest: Guest | null;
};

export function InvitationPage({ inv, guest }: Props) {
  const L = guest?.lang ?? inv.sharedLang;
  const t = copy[L];
  const myEvents = guest ? inv.events.filter((e) => guest.events.includes(e.id)) : inv.events;

  const names = `${inv.couple.groom[L]}${t.and}${inv.couple.bride[L]}`;
  const day = formatDate(inv.date, L, { day: "numeric", month: "long", year: "numeric" });
  const weekday = formatDate(inv.date, L, { weekday: "long" });

  return (
    <main className="invitation" lang={L} dir={L === "ar" ? "rtl" : "ltr"}>
      <Envelope
        envelope={inv.media.envelope}
        ribbon={inv.media.ribbon}
        guestName={guest ? guest.name[L] : t.dearGuests}
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
        slug={inv.slug}
        token={guest?.token}
        storageKey={`rsvp:${inv.slug}:${guest?.token ?? "shared"}`}
        guestName={guest?.name[L]}
        seats={guest?.seats ?? 1}
        max={inv.rsvpMax}
        replyBy={t.replyBy(formatDate(inv.rsvpBy, L, { day: "numeric", month: "long", year: "numeric" }))}
        t={{
          title: t.rsvpTitle,
          yourName: t.yourName,
          nameFirst: t.nameFirst,
          question: t.question,
          accept: t.accept,
          decline: t.decline,
          howMany: t.howMany,
          note: t.noteFor(names),
          optional: t.optional,
          send: t.send,
          chooseFirst: t.chooseFirst,
          sendFailed: t.sendFailed,
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
      <PageMotion />
    </main>
  );
}
