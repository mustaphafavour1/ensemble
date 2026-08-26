import { Inter, Epunda_Sans } from "next/font/google";
import localFont from "next/font/local";

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

/**
 * Data, logs, code, IDs, and the sidebar wordmark — precision-reading
 * contexts, not general headings. Also exposed for contexts (canvas/SVG)
 * that need a literal font-family string.
 */
export const departureMono = localFont({
  src: "../fonts/DepartureMono-Regular.woff2",
  variable: "--font-mono",
  display: "swap",
  weight: "400",
});
