import type { Metadata } from "next";
import { copy } from "./copy";
import { formatDate } from "./format";
import type { Invitation, Lang } from "./types";

// What WhatsApp shows above an invitation link: title and description in the
// guest's language (the picture comes from opengraph-image.tsx). Invitation
// pages are private, so search engines are asked not to list them.
export function invitationMetadata(inv: Invitation, L: Lang): Metadata {
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
