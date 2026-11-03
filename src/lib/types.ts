export type Lang = "en" | "ar";
export type  Localized = Rcord<Lang, sting> ;

export type EventId = "zaffe"| "ceremony"| "reception";

export interface EventItem{
    id: EventId ; 
    label:Localized;
    time: Localized;
    startAt:string;
    place:Localized;
    mapsQuery: string;
}

export interface Guest{
    token: striing;
    couple: {groom: Localized ; bride:Localized; monogram:string};
    date: string;
    city: Localized;
    rsvpBy: string;
    media: {
        heroVideo: string;
        heroPoster: string;
        lendscape: string;
        cameo: string; framed: string;
    };
    letter: Localized;
    notes:{title:Localized; text:Localized} [];
    events:EventItem[];
    guests:Guest[];
}