import type { Lang } from "./types";

// Template text: the same for every invitation that uses this template.
// Text specific to one couple lives in src/data/invitations/.
const en = {
  getting: "We’re getting married",
  families: (groom: string, bride: string) => `The ${groom} & ${bride} families`,
  honour: "have the honour of inviting you",
  tapSeal: "Tap the seal to open",
  skip: "Skip",
  and: " & ",
  amp: "&",
  scroll: "Scroll",
  married: "are getting married",
  countdown: "The countdown to forever",
  units: ["days", "hours", "min", "sec"],
  details: "The details",
  tapOpen: "Tap to open",
  tapClose: "Tap to close",
  map: "Map",
  openDetails: "Open the details",
  closeDetails: "Close the details",
  goodToKnow: "Good to know",
};

const ar: typeof en = {
  getting: "نحتفل بزفافنا",
  families: (groom: string, bride: string) => `عائلتا ${groom} و${bride}`,
  honour: "تتشرّفان بدعوتكم",
  tapSeal: "اضغطوا على الختم",
  skip: "تخطّي",
  and: " و",
  amp: "و",
  scroll: "مرّروا للأسفل",
  married: "يحتفلان بزفافهما",
  countdown: "العدّ إلى الأبد",
  units: ["يوم", "ساعة", "دقيقة", "ثانية"],
  details: "التفاصيل",
  tapOpen: "اضغطوا للفتح",
  tapClose: "اضغطوا للإغلاق",
  map: "الخريطة",
  openDetails: "افتحوا التفاصيل",
  closeDetails: "أغلقوا التفاصيل",
  goodToKnow: "معلومات تهمّكم",
};

export const copy: Record<Lang, typeof en> = { en, ar };
