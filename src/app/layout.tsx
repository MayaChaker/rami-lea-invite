import type { Metadata } from "next";
import { corinthia, garamond, arefRuqaa, amiri } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
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
