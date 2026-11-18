import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import type { Invitation } from "./types";

// The site's icon (browser tab, phone home screen), drawn from the data file:
// the couple's monogram in Corinthia, ivory on a sage circle, like the seal
// on the dashboard. A new invitation gets its own icon with no new image.

export async function renderIcon(inv: Invitation, size: number, round: boolean): Promise<ImageResponse> {
  const script = await readFile(join(process.cwd(), "src/assets/og/corinthia-400.woff"));

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          // The browser tab gets a circle; the phone home screen rounds the
          // corners itself, so it gets a full square.
          borderRadius: round ? "50%" : 0,
          background: "#7C7A5C", // sage
          color: "#F7F2EC", // ivory
          fontFamily: "Corinthia",
          fontSize: size * 0.56,
          lineHeight: 1,
          paddingTop: size * 0.06, // the script sits high: bring it to the centre
        }}
      >
        {inv.couple.monogram}
      </div>
    ),
    {
      width: size,
      height: size,
      fonts: [{ name: "Corinthia", data: script, weight: 400 }],
      // Drawn once, then served from the CDN for a day, not redrawn per visit
      headers: { "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800" },
    },
  );
}
