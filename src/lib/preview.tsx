import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import sharp from "sharp";
import { formatDate } from "./format";
import type { Invitation } from "./types";

// The picture WhatsApp shows when an invitation link is shared (Open Graph
// image), drawn from the data file: the couple's photo, their names in
// Corinthia and the date. Used by every invitation link's opengraph-image.tsx.

export const previewSize = { width: 1200, height: 630 };
// JPEG, not PNG: a photo as PNG is over 1 MB, and WhatsApp may skip big
// previews. As JPEG it is a few hundred KB.
export const previewType = "image/jpeg";

// The image renderer needs the font files themselves (woff), not next/font.
const fonts = join(process.cwd(), "src/assets/og");

export async function renderPreview(inv: Invitation): Promise<Response> {
  const [script, serif, photo] = await Promise.all([
    readFile(join(fonts, "corinthia-400.woff")),
    readFile(join(fonts, "eb-garamond-500.woff")),
    readFile(join(process.cwd(), "public", inv.media.ogPhoto)),
  ]);

  // The preview is always in Latin letters: the image renderer cannot shape
  // Arabic script reliably. The page title and description stay per language.
  const names = `${inv.couple.groom.en} & ${inv.couple.bride.en}`;
  const when = `${formatDate(inv.date, "en", { day: "numeric", month: "long", year: "numeric" })} · ${inv.city.en}`;

  const png = new ImageResponse(
    (
      <div style={{ position: "relative", display: "flex", width: "100%", height: "100%" }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- rendered to a PNG, not a page */}
        <img
          src={`data:image/jpeg;base64,${photo.toString("base64")}`}
          width={1200}
          height={630}
          style={{ position: "absolute", inset: 0, objectFit: "cover" }}
          alt=""
        />
        {/* Soft dark wash so the white text reads on the field */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to bottom, rgba(36,32,25,.35), rgba(36,32,25,.55))",
          }}
        />
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            color: "#fff",
            textAlign: "center",
          }}
        >
          <div style={{ fontFamily: "Garamond", fontSize: 26, letterSpacing: 9, textTransform: "uppercase" }}>
            We’re getting married
          </div>
          <div style={{ fontFamily: "Corinthia", fontSize: 170, lineHeight: 1.1, marginTop: 10 }}>{names}</div>
          <div
            style={{
              fontFamily: "Garamond",
              fontSize: 28,
              letterSpacing: 8,
              textTransform: "uppercase",
              marginTop: 18,
            }}
          >
            {when}
          </div>
        </div>
      </div>
    ),
    {
      ...previewSize,
      fonts: [
        { name: "Corinthia", data: script, weight: 400, style: "normal" },
        { name: "Garamond", data: serif, weight: 500, style: "normal" },
      ],
    },
  );

  // ImageResponse only makes PNG, so convert it.
  const jpeg = await sharp(Buffer.from(await png.arrayBuffer()))
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer();
  return new Response(new Uint8Array(jpeg), { headers: { "Content-Type": previewType } });
}
