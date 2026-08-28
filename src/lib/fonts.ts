import { Inter, Epunda_Sans } from "next/font/google";

export const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

/** In-page headings (page titles, card titles, section headers). */
export const epundaSans = Epunda_Sans({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});
