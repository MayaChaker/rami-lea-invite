export type Lang = "en" | "ar";
export type Localized = Record<Lang, string>;

export type EventId = "zaffe" | "ceremony" | "reception";

// A small line icon above a "Good to know" note, so its meaning is clear at a glance.
export type NoteIcon = "dress" | "adults" | "gift";

export interface EventItem {
  id: EventId;
  label: Localized;
  time: Localized;
  startsAt: string;
  place: Localized;
  mapsQuery: string;
}

export interface Guest {
  token: string;
  name: Localized;
  seats: number;
  lang: Lang;
  events: EventId[];
}

// A way guests can send a money gift. Optional: many couples prefer not to.
export interface GiftMethod {
  kind: "whish" | "omt" | "iban";
  name: string; // shown as is, e.g. "Whish Money"
  value: string; // phone number or IBAN, copied by the guest
}

// One guest's answer, as the couple sees it on their dashboard. From a personal
// link it carries the guest's token; from a shared link only the typed name.
export interface RsvpReply {
  token?: string;
  name: string;
  answer: "yes" | "no";
  count: number; // people attending (0 when declined)
  message: string; // the private note for the couple, may be empty
  repliedAt: string; // ISO date
}

export interface Invitation {
  slug: string;
  dashboardSecret: string; // the couple's private dashboard is /dashboard/<this>
  couple: {
    groom: Localized;
    bride: Localized;
    monogram: string;
    // Family names, for the line "The ... & ... families have the honour of inviting you"
    families: { groom: Localized; bride: Localized };
  };
  date: string;
  city: Localized;
  rsvpBy: string;
  rsvpMax: number; // the most people one reply can bring (the guest picks 1 to this)
  media: {
    hero: string; // the couple's photo on the first page
    heroAlt: Localized; // describes the hero photo for screen readers
    ogPhoto: string; // JPEG behind the WhatsApp preview, 1200×630
    envelope: string; // the closed envelope, full screen, flaps meeting in the centre (941×1672)
    ribbon: string; // the satin ribbon and bow tied across it, transparent (1536×1024)
    cameo: string; // the oval photo on the letter page (4:5)
    detailsBackground: string; // full-page photo behind "The celebration" card (no people)
    rsvpBackground: string; // full-page photo behind the RSVP card (no people)
  };
  letter: Localized;
  notes: { title: Localized; text: Localized; icon?: NoteIcon }[];
  gifts?: GiftMethod[]; // leave out to show no gift options
  albumUrl?: string; // shared photo album for the QR page; leave out to hide it
  events: EventItem[];
  guests: Guest[];
}
