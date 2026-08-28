"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  FileText,
  Rocket,
  ShieldAlert,
  Gauge,
  Lightbulb,
  SendHorizontal,
  type LucideIcon,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";
import { getExecutiveDigest, getDigestDateRange } from "@/lib/mock/digest";

const SECTION_ICONS: Record<string, LucideIcon> = {
  "This Week in Engineering": Rocket,
  "Incidents & Resolution": ShieldAlert,
  "Model Performance": Gauge,
  "Looking Ahead": Lightbulb,
};

export default function ExecutiveDigestPage() {
  const seeded = useAppStore((s) => s.seeded);
  const [question, setQuestion] = useState("");

  function handleAsk(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim()) return;
    toast.success("Question sent to EnsembleAI", {
      description: "It's still reading through this week's runs — check back shortly for an answer.",
    });
    setQuestion("");
  }

  if (!seeded) {
    return (
      <div>
        <PageHeader
          title="Executive Digest"
          description="A written weekly briefing on engineering health — for a five-minute read, not a dashboard deep-dive."
        />
        <EmptyState
          icon={FileText}
          title="No digest yet"
          description="Turn on demo data in Settings to see this week's digest."
        />
      </div>
    );
  }

  const sections = getExecutiveDigest();

  return (
    <div>
      <PageHeader
        title="Executive Digest"
        description={`Week of ${getDigestDateRange()} — what happened across engineering, written for a five-minute read.`}
      />

      <Tabs defaultValue="briefing">
        <TabsList variant="line">
          <TabsTrigger value="briefing">Full briefing</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
        </TabsList>

        <TabsContent value="briefing" className="mt-4">
          <Card className="mx-auto max-w-3xl">
            <CardContent className="flex flex-col gap-7">
              {sections.map((section) => (
                <section key={section.heading}>
                  <h2 className="font-heading text-base font-semibold text-ink-em">{section.heading}</h2>
                  <div className="mt-2.5 flex flex-col gap-3">
                    {section.paragraphs.map((paragraph, i) => (
                      <p key={i} className="text-sm leading-relaxed text-ink-muted">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </section>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="summary" className="mt-4">
          <div className="mx-auto grid max-w-3xl grid-cols-2 gap-4">
            {sections.map((section) => {
              const Icon = SECTION_ICONS[section.heading] ?? FileText;
              return (
                <Card key={section.heading}>
                  <CardContent className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <div className="flex size-6 shrink-0 items-center justify-center rounded-md border border-border bg-surface-hover text-brand-400">
                        <Icon className="size-3.5" strokeWidth={1.75} />
                      </div>
                      <h3 className="font-heading text-sm font-semibold text-ink-em">{section.heading}</h3>
                    </div>
                    <p className="text-sm leading-relaxed text-ink-muted">{section.summary}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      <Card className="mx-auto mt-4 max-w-3xl">
        <CardContent>
          <form onSubmit={handleAsk} className="flex items-center gap-2">
            <Input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask EnsembleAI about this week's digest…"
              className="flex-1"
            />
            <Button type="submit" size="icon" disabled={!question.trim()} aria-label="Ask">
              <SendHorizontal className="size-3.5" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
