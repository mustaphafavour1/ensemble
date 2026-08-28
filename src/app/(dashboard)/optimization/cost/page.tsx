"use client";

import { BarChart3 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EnsembleAINote } from "@/components/ensemble-ai";
import { EmptyState } from "@/components/empty-state";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useAppStore } from "@/lib/store";
import { getCostAnomaly } from "@/lib/mock/analytics";
import { CostTrendChart } from "@/components/analytics/cost-trend-chart";
import { TokenChart } from "@/components/analytics/token-chart";
import { CostByAgentChart } from "@/components/analytics/cost-by-agent-chart";
import { CostByRepoChart } from "@/components/analytics/cost-by-repo-chart";

export default function CostOptimizationPage() {
  const seeded = useAppStore((s) => s.seeded);
  const anomaly = seeded ? getCostAnomaly() : null;

  return (
    <div>
      <PageHeader
        title="Cost Optimization"
        description="Compute spend and token usage across the fleet, and where it's drifting from baseline."
      />

      {!seeded ? (
        <EmptyState
          icon={BarChart3}
          title="No cost data yet"
          description="Turn on demo data in Settings to see spend trends across the fleet."
        />
      ) : (
        <>
          {anomaly && (
            <div className="mb-5">
              <EnsembleAINote label="EnsembleAI — Cost Anomaly Highlight">
                <span className="font-medium">{anomaly.agentName}</span> spent $
                {anomaly.thisWeekCost.toFixed(2)} this week on{" "}
                <span>{anomaly.repoName}</span> —{" "}
                {anomaly.ratio}× its recent weekly average of $
                {anomaly.avgWeekCost.toFixed(2)}. Worth a look before it compounds.
              </EnsembleAINote>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Compute cost</CardTitle>
                <p className="text-2xs text-ink-muted">Daily spend, last 30 days</p>
              </CardHeader>
              <CardContent className="h-[280px]">
                <CostTrendChart />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Token usage</CardTitle>
                <p className="text-2xs text-ink-muted">Daily tokens, last 30 days</p>
              </CardHeader>
              <CardContent className="h-[280px]">
                <TokenChart />
              </CardContent>
            </Card>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Cost by agent</CardTitle>
                <p className="text-2xs text-ink-muted">Last 30 days, ranked highest to lowest</p>
              </CardHeader>
              <CardContent className="h-[280px]">
                <CostByAgentChart />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Cost by repo</CardTitle>
                <p className="text-2xs text-ink-muted">Last 30 days, top 8 repos</p>
              </CardHeader>
              <CardContent className="h-[280px]">
                <CostByRepoChart />
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
