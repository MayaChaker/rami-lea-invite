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
    landscape: string;
    cameo: string;
    framed: string;
  };
  letter: Localized;
  notes: { title: Localized; text: Localized }[];
  events: EventItem[];
  guests: Guest[];
}
