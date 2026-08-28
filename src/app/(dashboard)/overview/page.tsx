"use client";

import { Network, ShieldAlert } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { EmptyState } from "@/components/empty-state";
import { StatusBadge, type Tone } from "@/components/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ModelHealthStrip } from "@/components/overview/model-health-strip";
import { UsageMap } from "@/components/overview/usage-map";
import { useAppStore } from "@/lib/store";
import { INCIDENTS } from "@/lib/mock/incidents";
import { AGENTS } from "@/lib/mock/catalog";
import { RUNS } from "@/lib/mock/runs";
import { GLOBAL_SCALE, getTotalDailyRequestsB } from "@/lib/mock/models";
import { SLA_RECORDS } from "@/lib/mock/sla";
import { getRegionSummaries, type UsageStatus } from "@/lib/mock/global-usage";
import { formatRelative } from "@/lib/mock/time";

const REGION_STATUS_META: Record<UsageStatus, { tone: Tone; label: string }> = {
  normal: { tone: "success", label: "Normal" },
  elevated: { tone: "warning", label: "Elevated" },
  degraded: { tone: "danger", label: "Degraded" },
};

export default function OverviewPage() {
  const seeded = useAppStore((s) => s.seeded);

  if (!seeded) {
    return (
      <div>
        <PageHeader
          title="Global Snapshot"
          description="What's running right now — across models, infrastructure, and the agent fleet."
        />
        <EmptyState
          icon={Network}
          title="No activity yet"
          description="Turn on demo data in Settings to see Ensemble populated with a live fleet of agents, runs, and deployments."
        />
      </div>
    );
  }

  const activeAgentCount = new Set(
    RUNS.filter((r) => r.status === "running" || r.status === "queued").map((r) => r.agentId),
  ).size;
  const avgUptime = SLA_RECORDS.reduce((s, r) => s + r.uptimePct30d, 0) / SLA_RECORDS.length;
  const computeSpendTodayM = Math.round((GLOBAL_SCALE.computeSpendThisMonthM / 30) * 10) / 10;

  const criticalAlerts = INCIDENTS.filter((i) => i.severity === "critical" && i.status !== "resolved");
  const regions = getRegionSummaries();

  const kpis = [
    { key: "requests", label: "Requests today", value: `${getTotalDailyRequestsB()}B`, hint: "across every production model" },
    { key: "agents", label: "Active agents", value: activeAgentCount, hint: `of ${AGENTS.length} in the fleet` },
    { key: "uptime", label: "Overall platform uptime", value: `${avgUptime.toFixed(2)}%`, hint: "30-day average" },
    { key: "spend", label: "AI compute spend today", value: `$${computeSpendTodayM}M`, hint: "org-wide" },
  ];

  return (
    <div>
      <PageHeader
        title="Global Snapshot"
        description="Model health, usage, and the issues that need attention — everything running right now, in one view."
      />

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Model health</CardTitle>
          <p className="text-2xs text-ink-muted">
            Live status across every production and staged model — scroll for the full fleet.
          </p>
        </CardHeader>
        <CardContent>
          <ModelHealthStrip />
        </CardContent>
      </Card>

      <div className="grid grid-cols-4 gap-4">
        {kpis.map((k) => (
          <StatCard key={k.key} label={k.label} value={k.value} hint={k.hint} />
        ))}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4">
        <Card className="col-span-1">
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShieldAlert className="size-3.5 text-danger-400" />
              <CardTitle>Critical Alerts</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {criticalAlerts.length === 0 ? (
              <p className="py-3 text-xs text-ink-faint">No critical issues right now.</p>
            ) : (
              <ul className="flex flex-col divide-y divide-border">
                {criticalAlerts.map((i) => (
                  <li key={i.id} className="flex items-start justify-between gap-2 py-2.5 first:pt-0 last:pb-0">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="relative flex size-1.5 shrink-0">
                          <span className="absolute inline-flex size-full animate-ping rounded-full bg-danger-500/60" />
                          <span className="relative inline-flex size-1.5 rounded-full bg-danger-500" />
                        </span>
                        <span className="text-2xs font-medium text-danger-300">Critical</span>
                      </div>
                      <p className="mt-1 truncate text-xs text-ink-em">{i.title}</p>
                      <p className="mt-0.5 truncate text-2xs text-ink-faint">{i.affectedSystems.join(", ")}</p>
                    </div>
                    <span className="shrink-0 text-2xs text-ink-faint">{formatRelative(i.startedAt)}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Regional Breakdown</CardTitle>
            <p className="mt-1 text-2xs text-ink-muted">
              Usage, latency, and error rate by region — scroll to zoom into the map.
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <UsageMap />
            </div>
            <ul className="mt-3 flex flex-col divide-y divide-border border-t border-border">
              {regions.map((r) => (
                <li key={r.region} className="flex items-center justify-between gap-3 py-2 text-xs first:pt-2 last:pb-0">
                  <span className="text-ink-em">{r.region}</span>
                  <div className="flex items-center gap-4 text-2xs text-ink-muted tabular-nums">
                    <span>{r.activeUsersM}M users</span>
                    <span>{r.avgLatencyMs}ms</span>
                    <span>{r.errorRatePct}% errors</span>
                    <StatusBadge tone={REGION_STATUS_META[r.status].tone} label={REGION_STATUS_META[r.status].label} />
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
