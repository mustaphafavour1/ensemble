"use client";

import { Globe } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useAppStore } from "@/lib/store";
import { AiAdoptionChart } from "@/components/analytics/ai-adoption-chart";
import { LanguageBreakdownChart } from "@/components/analytics/language-breakdown-chart";
import { TaskWeightChart } from "@/components/analytics/task-weight-chart";

export default function GlobalUsagePatternsPage() {
  const seeded = useAppStore((s) => s.seeded);

  return (
    <div>
      <PageHeader
        title="Global Usage Patterns"
        description="How the engineering org actually works — language mix and the AI-vs-human split of what ships."
      />

      {!seeded ? (
        <EmptyState
          icon={Globe}
          title="No usage data yet"
          description="Turn on demo data in Settings to see patterns across the fleet."
        />
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>AI-authored vs. human-authored code</CardTitle>
              <p className="text-2xs text-ink-muted">
                Share of all commits written by an agent, last 90 days — the
                remainder is human-authored
              </p>
            </CardHeader>
            <CardContent className="h-[280px]">
              <AiAdoptionChart />
            </CardContent>
          </Card>

          <div className="mt-4 grid grid-cols-3 gap-4">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Task weight</CardTitle>
                <p className="text-2xs text-ink-muted">How heavy the coding tasks were, by lines touched</p>
              </CardHeader>
              <CardContent className="h-[320px]">
                <TaskWeightChart />
              </CardContent>
            </Card>
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Language breakdown</CardTitle>
                <p className="text-2xs text-ink-muted">Runs by language, org-wide</p>
              </CardHeader>
              <CardContent className="h-[320px]">
                <LanguageBreakdownChart />
              </CardContent>
            </Card>
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>What this means</CardTitle>
                <p className="text-2xs text-ink-muted">Reading the fleet&apos;s shape</p>
              </CardHeader>
              <CardContent className="flex h-[320px] flex-col justify-center gap-3 text-xs leading-relaxed text-ink-muted">
                <p>
                  TypeScript and Python carry the largest share of agent runs,
                  reflecting where the org&apos;s product and ML surfaces live. Go
                  and Rust workloads skew toward infrastructure-critical
                  services where Ensemble&apos;s stricter review gates apply.
                </p>
                <p>
                  Most tasks stay light or medium — the fleet is mainly doing
                  well-scoped, bounded work, with heavier multi-file changes
                  still routed through the stricter review gates.
                </p>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
