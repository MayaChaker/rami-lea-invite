import type { Invitation } from "@/lib/types";
const base = "/invitations/rami-lea";

export const ramiLea: Invitation = {
  slug: "rami-lea",
  couple: {
    groom: { en: "Rami", ar: "رامي" },
    bride: { en: "Lea", ar: "ليا" },
    monogram: "R&L",
    families: {
      groom: { en: "Nassar", ar: "نصّار" },
      bride: { en: "Khalil", ar: "خليل" },
    },
  },
  date: "2027-06-19T17:00:00+03:00",
  city: { en: "Jounieh, Lebanon", ar: "جونيه، لبنان" },
  rsvpBy: "2027-05-19",
  media: {
    heroVideo: `${base}/couple.mp4`,
    heroPoster: `${base}/couple-poster.webp`,
    landscape: `${base}/land.webp`,
    cameo: `${base}/cameo.webp`,
    framed: `${base}/arch.webp`,
  },
  letter: {
    en: "As we begin this new chapter together, we would be honoured to have you by our side.",
    ar: "ونحن نبدأ هذا الفصل الجديد معًا، يشرّفنا أن تكونوا إلى جانبنا.",
  },
  notes: [
    {
      title: { en: "Dress code", ar: "اللباس" },
      text: {
        en: "Black tie. Soft greens, ivory and neutral tones are welcome.",
        ar: "رسمي. الألوان الخضراء الهادئة والعاجية مرحّب بها.",
      },
    },
    {
      title: { en: "Adults only", ar: "للكبار فقط" },
      text: {
        en: "We love your little ones, but this evening is for adults only.",
        ar: "نحبّ أطفالكم، لكن هذه الأمسية للكبار فقط.",
      },
    },
    {
      title: { en: "Gifts", ar: "الهدايا" },
      text: { en: "Your presence is the best gift.", ar: "حضوركم أجمل هدية." },
    },
  ],
  events: [
    {
      id: "zaffe",
      label: { en: "The zaffé", ar: "الزفّة" },
      time: { en: "three o’clock", ar: "الساعة الثالثة" },
      startsAt: "2027-06-19T15:00:00+03:00",
      place: {
        en: "At the bride’s home, Achrafieh",
        ar: "من بيت العروس، الأشرفية",
      },
      mapsQuery: "Achrafieh",
    },
    {
      id: "ceremony",
      label: { en: "The ceremony", ar: "الإكليل" },
      time: { en: "five o’clock", ar: "الساعة الخامسة" },
      startsAt: "2027-06-19T17:00:00+03:00",
      place: { en: "Saint Elie Church, Jounieh", ar: "كنيسة مار الياس، جونيه" },
      mapsQuery: "Jounieh",
    },
    {
      id: "reception",
      label: { en: "The reception", ar: "حفل الاستقبال" },
      time: { en: "eight o’clock", ar: "الساعة الثامنة" },
      startsAt: "2027-06-19T20:00:00+03:00",
      place: { en: "Villa Sindiane, Faraya", ar: "فيلا السنديان، فاريا" },
      mapsQuery: "Faraya",
    },
  ],
  guests: [
    {
      token: "haddad-7x2k",
      name: { en: "The Haddad Family", ar: "عائلة حدّاد الكريمة" },
      seats: 2,
      lang: "en",
      events: ["zaffe", "ceremony", "reception"],
    },
    {
      token: "khoury-m4q9",
      name: { en: "The Khoury Family", ar: "عائلة خوري الكريمة" },
      seats: 4,
      lang: "ar",
      events: ["ceremony", "reception"],
    },
  ],
};
