import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InvitationPage } from "@/components/InvitationPage";
import { allGuestPaths, getGuest, getInvitation } from "@/lib/getInvitation";
import { invitationMetadata } from "@/lib/metadata";

// A guest's personal link: /i/rami-lea/haddad-7x2k.
// Guests open it directly from WhatsApp, never through in-app navigation.
export const instant = false;

export function generateStaticParams() {
  return allGuestPaths();
}

type Params = { params: Promise<{ slug: string; token: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug, token } = await params;
  const inv = getInvitation(slug);
  const guest = inv && getGuest(inv, token);
  if (!inv || !guest) return {};
  return invitationMetadata(inv, guest.lang);
}

export default async function GuestInvitation({ params }: Params) {
  const { slug, token } = await params;
  const inv = getInvitation(slug);
  const guest = inv && getGuest(inv, token);
  if (!inv || !guest) notFound();

  return <InvitationPage inv={inv} guest={guest} />;
}
