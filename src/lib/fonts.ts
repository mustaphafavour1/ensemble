import { Inter } from "next/font/google";
import localFont from "next/font/local";

export const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

/** Also exposed for contexts (canvas/SVG) that need a literal font-family string. */
export const departureMono = localFont({
  src: "../fonts/DepartureMono-Regular.woff2",
  variable: "--font-mono",
  display: "swap",
  weight: "400",
});
