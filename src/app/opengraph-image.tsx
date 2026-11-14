import { getHomeInvitation } from "@/lib/getInvitation";
import { previewSize, previewType, renderPreview } from "@/lib/preview";

// The WhatsApp preview of the shared link (the home page).
export const alt = "Wedding invitation";
export const size = previewSize;
export const contentType = previewType;

export default function Image() {
  return renderPreview(getHomeInvitation());
}
