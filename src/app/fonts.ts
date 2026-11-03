import { Corinthia, EB_Garamond, Aref_Ruqaa, Amiri } from "next/font/google";

// Latin: names and titles
export const corinthia = Corinthia({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-corinthia",
});

// Latin: all other text
export const garamond = EB_Garamond({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-garamond",
});

// Arabic: names and titles
export const arefRuqaa = Aref_Ruqaa({
  weight: "400",
  subsets: ["arabic"],
  variable: "--font-aref-ruqaa",
  preload: false,
});

// Arabic: all other text
export const amiri = Amiri({
  weight: "400",
  subsets: ["arabic"],
  variable: "--font-amiri",
  preload: false,
});
