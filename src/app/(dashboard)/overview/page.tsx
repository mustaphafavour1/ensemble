"use client";

import Link from "next/link";
import { Activity, Rocket, Bot, Cpu, Network } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { EnsembleAINote } from "@/components/ensemble-ai";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { ActivityFeed } from "@/components/overview/activity-feed";
import { SystemStatusMeters } from "@/components/overview/system-status-meters";
import { UsageMap } from "@/components/overview/usage-map";
import { useAppStore } from "@/lib/store";
import { getOverviewKpis, getDailyDigest } from "@/lib/mock/analytics";
import { getActivityFeed } from "@/lib/mock/activity";
import { GLOBAL_SCALE, MODEL_VERSIONS, getTotalDailyRequestsB } from "@/lib/mock/models";

export default function OverviewPage() {
  const role = useAppStore((s) => s.role);
  const seeded = useAppStore((s) => s.seeded);

  const kpis = getOverviewKpis();
  const digest = getDailyDigest();
  const feed = seeded ? getActivityFeed(9) : [];

  const productionModels = MODEL_VERSIONS.filter((m) => m.status === "production").length;
  const stagedModels = MODEL_VERSIONS.filter((m) => m.status === "staged").length;

  const globalCards = [
    {
      key: "requests",
      label: "Daily requests, worldwide",
      value: `${getTotalDailyRequestsB()}B`,
      hint: "across every production model",
    },
    {
      key: "mau",
      label: "Monthly active users",
      value: `${GLOBAL_SCALE.totalMauM}M`,
      hint: `${GLOBAL_SCALE.countries} countries`,
    },
    {
      key: "datacenters",
      label: "Data centers online",
      value: GLOBAL_SCALE.dataCenters,
      hint: `${GLOBAL_SCALE.acceleratorsTotal.toLocaleString()} accelerators`,
    },
    {
      key: "models",
      label: "Models in production",
      value: productionModels,
      hint: `${stagedModels} in staged testing`,
    },
  ];

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
      value: `$${GLOBAL_SCALE.computeSpendThisMonthM}M`,
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
        title="Global Snapshot"
        description={
          role === "product-admin"
            ? "Global scale, spend, and delivery health across every model and team."
            : "What's running right now — across models, infrastructure, and the agent fleet."
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
            {globalCards.map((c) => (
              <StatCard key={c.key} label={c.label} value={c.value} hint={c.hint} />
            ))}
          </div>

          <div className="mt-4 grid grid-cols-4 gap-4">
            {ordered.map((c) => (
              <StatCard
                key={c.key}
                label={c.label}
                value={c.value}
                hint={c.hint}
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
                  <CardTitle>Worldwide usage</CardTitle>
                  <p className="mt-1 text-2xs text-ink-muted">
                    Where traffic is coming from right now, and where it&apos;s running hot.
                  </p>
                </div>
                <div className="flex items-center gap-3 text-2xs text-ink-muted">
                  <span className="flex items-center gap-1.5">
                    <span className="size-1.5 rounded-full bg-brand-500" />
                    Normal
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="size-1.5 rounded-full bg-warning-500" />
                    Elevated
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="size-1.5 rounded-full bg-danger-500" />
                    Degraded
                  </span>
                </div>
              </CardHeader>
              <CardContent className="h-[420px] pt-2">
                <UsageMap />
              </CardContent>
            </Card>

            <div className="col-span-1 flex flex-col gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Model uptime</CardTitle>
                </CardHeader>
                <CardContent>
                  <SystemStatusMeters />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex-row items-center justify-between space-y-0">
                  <CardTitle>Live activity</CardTitle>
                  <Link
                    href="/overview/activity"
                    className="text-2xs font-medium text-brand-400 hover:underline"
                  >
                    View all
                  </Link>
                </CardHeader>
                <CardContent className="h-[190px] overflow-y-auto">
                  <ActivityFeed items={feed} />
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
