import { getHomeInvitation } from "@/lib/getInvitation";
import { renderIcon } from "@/lib/icon";

// The icon when a guest adds the invitation to their phone's home screen.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return renderIcon(getHomeInvitation(), size.width, false);
}
