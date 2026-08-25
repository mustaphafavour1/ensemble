"use client";

import { BarChart3 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EnsembleAINote } from "@/components/ensemble-ai";
import { EmptyState } from "@/components/empty-state";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useAppStore } from "@/lib/store";
import { getCostAnomaly } from "@/lib/mock/analytics";
import { AiAdoptionChart } from "@/components/analytics/ai-adoption-chart";
import { SuccessFailureChart } from "@/components/analytics/success-failure-chart";
import { CostTrendChart } from "@/components/analytics/cost-trend-chart";
import { TokenChart } from "@/components/analytics/token-chart";
import { DeploymentFrequencyChart } from "@/components/analytics/deployment-frequency-chart";
import { LanguageBreakdownChart } from "@/components/analytics/language-breakdown-chart";

export default function AnalyticsPage() {
  const seeded = useAppStore((s) => s.seeded);
  const anomaly = seeded ? getCostAnomaly() : null;

  return (
    <div>
      <PageHeader
        title="Analytics"
        description="Adoption, reliability, and spend trends across the whole fleet."
      />

      {!seeded ? (
        <EmptyState
          icon={BarChart3}
          title="No analytics yet"
          description="Turn on demo data in Settings to see trends across the fleet."
        />
      ) : (
        <>
          {anomaly && (
            <div className="mb-5">
              <EnsembleAINote label="EnsembleAI — Cost Anomaly Highlight">
                <span className="font-medium">{anomaly.agentName}</span> spent $
                {anomaly.thisWeekCost.toFixed(2)} this week on{" "}
                <span className="font-mono">{anomaly.repoName}</span> —{" "}
                {anomaly.ratio}× its recent weekly average of $
                {anomaly.avgWeekCost.toFixed(2)}. Worth a look before it compounds.
              </EnsembleAINote>
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle>AI-authored vs. human-authored code</CardTitle>
              <p className="text-2xs text-ink-300">
                Share of all commits written by an agent, last 90 days — the
                remainder is human-authored
              </p>
            </CardHeader>
            <CardContent className="h-[280px]">
              <AiAdoptionChart />
            </CardContent>
          </Card>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Run success / failure</CardTitle>
                <p className="text-2xs text-ink-300">Merged vs. failed, by week</p>
              </CardHeader>
              <CardContent className="h-[240px]">
                <SuccessFailureChart />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Deployment frequency</CardTitle>
                <p className="text-2xs text-ink-300">Successful deploys, by week</p>
              </CardHeader>
              <CardContent className="h-[240px]">
                <DeploymentFrequencyChart />
              </CardContent>
            </Card>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Compute cost</CardTitle>
                <p className="text-2xs text-ink-300">Daily spend, last 30 days</p>
              </CardHeader>
              <CardContent className="h-[220px]">
                <CostTrendChart />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Token usage</CardTitle>
                <p className="text-2xs text-ink-300">Daily tokens, last 30 days</p>
              </CardHeader>
              <CardContent className="h-[220px]">
                <TokenChart />
              </CardContent>
            </Card>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-4">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Language breakdown</CardTitle>
                <p className="text-2xs text-ink-300">Runs by language, org-wide</p>
              </CardHeader>
              <CardContent className="h-[320px]">
                <LanguageBreakdownChart />
              </CardContent>
            </Card>
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>What this means</CardTitle>
                <p className="text-2xs text-ink-300">Reading the fleet&apos;s shape</p>
              </CardHeader>
              <CardContent className="flex h-[320px] flex-col justify-center gap-3 text-xs leading-relaxed text-ink-300">
                <p>
                  TypeScript and Python carry the largest share of agent runs,
                  reflecting where the org&apos;s product and ML surfaces live. Go
                  and Rust workloads skew toward infrastructure-critical
                  services where Ensemble&apos;s stricter review gates apply.
                </p>
                <p>
                  Stack breadth is deliberate: the same fleet of agents
                  operates across every one of these languages without a
                  separate integration per stack.
                </p>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
