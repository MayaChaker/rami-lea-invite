import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { notFound } from "next/navigation";
import { ImageResponse } from "next/og";
import sharp from "sharp";
import { formatDate } from "@/lib/format";
import { allGuestPaths, getInvitation } from "@/lib/getInvitation";

// The picture WhatsApp shows when the link is shared (Open Graph image).
// Next.js draws it from this code at build time, one per invitation, from the
// data file: the couple's photo, their names in Corinthia and the date.
// No design tool, no AI: a new couple gets their own preview automatically.

export const alt = "Wedding invitation";
export const size = { width: 1200, height: 630 };
// JPEG, not PNG: a photo as PNG is over 1 MB, and WhatsApp may skip big
// previews. As JPEG it is a few hundred KB.
export const contentType = "image/jpeg";

export function generateStaticParams() {
  return allGuestPaths();
}

// The image renderer needs the font files themselves (woff), not next/font.
const fonts = join(process.cwd(), "src/assets/og");

export default async function Image({ params }: { params: Promise<{ slug: string; token: string }> }) {
  const { slug } = await params;
  const inv = getInvitation(slug);
  if (!inv) notFound();

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
            background: "linear-gradient(to bottom, rgba(28,31,24,.35), rgba(28,31,24,.55))",
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
      ...size,
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
  return new Response(new Uint8Array(jpeg), { headers: { "Content-Type": contentType } });
}
