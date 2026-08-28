"use client";

import { FileText } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { useAppStore } from "@/lib/store";
import { getExecutiveDigest, getDigestDateRange } from "@/lib/mock/digest";

export default function ExecutiveDigestPage() {
  const seeded = useAppStore((s) => s.seeded);

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

      <Card className="mx-auto max-w-3xl">
        <CardContent className="flex flex-col gap-6">
          {sections.map((section) => (
            <section key={section.heading}>
              <h2 className="font-heading text-sm font-semibold text-ink-em">{section.heading}</h2>
              <div className="mt-2 flex flex-col gap-3">
                {section.paragraphs.map((paragraph, i) => (
                  <p key={i} className="text-xs leading-relaxed text-ink-muted">
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
