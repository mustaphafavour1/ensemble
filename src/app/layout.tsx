import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { inter, departureMono } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ensemble — Orchestrate AI-agent development",
  description:
    "Ensemble is the control plane for orchestrating, reviewing, and shipping AI-agent-driven development at organization scale.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`dark ${inter.variable} ${departureMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-canvas text-ink-100 font-sans text-xs">
        <TooltipProvider delay={200}>
          {children}
          <Toaster />
        </TooltipProvider>
      </body>
    </html>
  );
}
