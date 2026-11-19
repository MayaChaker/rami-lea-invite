import type { Metadata } from "next";
import { InvitationPage } from "@/components/InvitationPage";
import { getHomeInvitation } from "@/lib/getInvitation";
import { invitationMetadata } from "@/lib/metadata";

// The shared link in English, from the language button (/en).
export const instant = false;

export function generateMetadata(): Metadata {
  return invitationMetadata(getHomeInvitation(), "en");
}

export default function SharedInEnglish() {
  return <InvitationPage inv={getHomeInvitation()} guest={null} lang="en" />;
}
