import { notFound } from "next/navigation";
import { allGuestPaths, getInvitation } from "@/lib/getInvitation";
import { previewSize, previewType, renderPreview } from "@/lib/preview";

// The WhatsApp preview of a personal link.
export const alt = "Wedding invitation";
export const size = previewSize;
export const contentType = previewType;

export function generateStaticParams() {
  return allGuestPaths();
}

export default async function Image({ params }: { params: Promise<{ slug: string; token: string }> }) {
  const { slug } = await params;
  const inv = getInvitation(slug);
  if (!inv) notFound();
  return renderPreview(inv);
}
