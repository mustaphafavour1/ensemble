"use client";

import { Activity, Rocket, Bot, Cpu, Network } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { EnsembleAINote } from "@/components/ensemble-ai";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { AgentGraph } from "@/components/overview/agent-graph";
import { ActivityFeed } from "@/components/overview/activity-feed";
import { useAppStore } from "@/lib/store";
import { getOverviewKpis, getDailyDigest } from "@/lib/mock/analytics";
import { getActivityFeed } from "@/lib/mock/activity";

export default function OverviewPage() {
  const role = useAppStore((s) => s.role);
  const seeded = useAppStore((s) => s.seeded);

  const kpis = getOverviewKpis();
  const digest = getDailyDigest();
  const feed = seeded ? getActivityFeed(9) : [];

  const cards = [
    {
      key: "active",
      label: "Active runs right now",
      value: kpis.activeRunsNow,
      hint: "queued + running",
      icon: Activity,
    },
    {
      key: "deploys",
      label: "Deployments today",
      value: kpis.deploymentsToday,
      hint: "across all environments",
      icon: Rocket,
    },
    {
      key: "ratio",
      label: "AI-authored code this week",
      value: `${kpis.aiAuthoredPctThisWeek}%`,
      hint: "share of all commits",
      icon: Bot,
    },
    {
      key: "spend",
      label: "AI compute spend this month",
      value: `$${Math.round(kpis.computeSpendThisMonth).toLocaleString()}`,
      hint: "org-wide",
      icon: Cpu,
    },
  ];

  const ordered =
    role === "product-admin"
      ? [cards[3], cards[2], cards[1], cards[0]]
      : [cards[0], cards[1], cards[2], cards[3]];

  return (
    <div>
      <PageHeader
        title="Overview"
        description={
          role === "product-admin"
            ? "Org-wide spend, adoption, and delivery health across every team."
            : "What every agent is doing right now, across every repo."
        }
      />

      {!seeded ? (
        <EmptyState
          icon={Network}
          title="No activity yet"
          description="Turn on demo data in Settings to see Ensemble populated with a live fleet of agents, runs, and deployments."
        />
      ) : (
        <>
          <div className="grid grid-cols-4 gap-4">
            {ordered.map((c) => (
              <StatCard
                key={c.key}
                label={c.label}
                value={c.value}
                hint={c.hint}
                icon={c.icon}
              />
            ))}
          </div>

          <div className="mt-4">
            <EnsembleAINote label="EnsembleAI — Daily Run Digest">
              {digest}
            </EnsembleAINote>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-4">
            <Card className="col-span-2">
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle>Fleet activity map</CardTitle>
                  <p className="mt-1 text-2xs text-ink-300">
                    Which agents are touching which repos, right now.
                  </p>
                </div>
                <div className="flex items-center gap-3 text-2xs text-ink-300">
                  <span className="flex items-center gap-1.5">
                    <span className="size-1.5 rounded-full bg-agent-500" />
                    Agent
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="size-1.5 rounded-full bg-brand-500" />
                    Repository
                  </span>
                </div>
              </CardHeader>
              <CardContent className="h-[420px] pt-2">
                <AgentGraph />
              </CardContent>
            </Card>

            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Live activity</CardTitle>
              </CardHeader>
              <CardContent className="h-[420px] overflow-y-auto">
                <ActivityFeed items={feed} />
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
