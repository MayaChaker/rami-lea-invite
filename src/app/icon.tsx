import { getHomeInvitation } from "@/lib/getInvitation";
import { renderIcon } from "@/lib/icon";

// The icon in the browser tab: the couple's monogram (see src/lib/icon.tsx).
export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return renderIcon(getHomeInvitation(), size.width, true);
}
