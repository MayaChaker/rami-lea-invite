export type Lang = "en" | "ar";
export type Localized = Record<Lang, string>;

export type EventId = "zaffe" | "ceremony" | "reception";

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

export interface Invitation {
  slug: string;
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
  media: {
    heroVideo: string;
    heroPoster: string;
    heroAlt: Localized; // describes the hero video for screen readers
    landscape: string;
    cameo: string;
    framed: string;
  };
  letter: Localized;
  notes: { title: Localized; text: Localized }[];
  gifts?: GiftMethod[]; // leave out to show no gift options
  events: EventItem[];
  guests: Guest[];
}
