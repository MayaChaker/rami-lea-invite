import type { Metadata } from "next";
import { InvitationPage } from "@/components/InvitationPage";
import { getHomeInvitation } from "@/lib/getInvitation";
import { invitationMetadata } from "@/lib/metadata";

// The shared link: the site's home page (rami-lea.vercel.app). The couple
// sends it to a WhatsApp group; every guest sees the invitation and writes
// their own name in the RSVP. Language: chosen by the couple (sharedLang).
export const instant = false;

export function generateMetadata(): Metadata {
  const inv = getHomeInvitation();
  return invitationMetadata(inv, inv.sharedLang);
}

export default function Home() {
  return <InvitationPage inv={getHomeInvitation()} guest={null} />;
}
