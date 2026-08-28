import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { inter, epundaSans } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ensemble — Frontier Engineering Operations",
  description:
    "Ensemble is the internal engineering console for a frontier AI lab — training, evaluation, optimization, infrastructure, reliability, and the fleet of agents doing routine work, tiered by stakes.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`dark ${inter.variable} ${epundaSans.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-canvas text-ink-em font-sans text-xs">
        <TooltipProvider delay={200}>
          {children}
          <Toaster />
        </TooltipProvider>
      </body>
    </html>
  );
}
