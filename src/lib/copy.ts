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
};

export const copy: Record<Lang, typeof en> = { en, ar };
