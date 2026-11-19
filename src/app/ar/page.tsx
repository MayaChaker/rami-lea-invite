import type { Metadata } from "next";
import { InvitationPage } from "@/components/InvitationPage";
import { getHomeInvitation } from "@/lib/getInvitation";
import { invitationMetadata } from "@/lib/metadata";

// The shared link in Arabic, from the language button (/ar).
export const instant = false;

export function generateMetadata(): Metadata {
  return invitationMetadata(getHomeInvitation(), "ar");
}

export default function SharedInArabic() {
  return <InvitationPage inv={getHomeInvitation()} guest={null} lang="ar" />;
}
