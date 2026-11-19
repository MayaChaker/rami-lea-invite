import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InvitationPage } from "@/components/InvitationPage";
import { allGuestPaths, getGuest, getInvitation } from "@/lib/getInvitation";
import { invitationMetadata } from "@/lib/metadata";
import type { Lang } from "@/lib/types";

// A guest's link in the language they chose with the language button:
// /i/rami-lea/haddad-7x2k/ar. Pre-built for every guest in both languages,
// so it is as fast as their own link.
export const instant = false;

const LANGS: Lang[] = ["en", "ar"];
const isLang = (value: string): value is Lang => (LANGS as string[]).includes(value);

export function generateStaticParams() {
  return allGuestPaths().flatMap((path) => LANGS.map((lang) => ({ ...path, lang })));
}

type Params = { params: Promise<{ slug: string; token: string; lang: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug, token, lang } = await params;
  const inv = getInvitation(slug);
  const guest = inv && getGuest(inv, token);
  if (!inv || !guest || !isLang(lang)) return {};
  return invitationMetadata(inv, lang);
}

export default async function GuestInvitationInLanguage({ params }: Params) {
  const { slug, token, lang } = await params;
  const inv = getInvitation(slug);
  const guest = inv && getGuest(inv, token);
  if (!inv || !guest || !isLang(lang)) notFound();

  return <InvitationPage inv={inv} guest={guest} lang={lang} />;
}
