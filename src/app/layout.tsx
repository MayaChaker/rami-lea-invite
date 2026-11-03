import type { Metadata } from "next";
import { corinthia, garamond, arefRuqaa, amiri } from "./fonts";
import "./globals.css";

// Links in the preview (og:image) must be absolute. On Vercel this is the
// production domain; on the laptop it is the dev server.
const site = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3001";

export const metadata: Metadata = {
  metadataBase: new URL(site),
  title: "Wedding invitation",
  description: "You are invited.",
};

const fontVariables = [corinthia, garamond, arefRuqaa, amiri]
  .map((font) => font.variable)
  .join(" ");

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${fontVariables} antialiased`}>
      <body>{children}</body>
    </html>
  );
}
