"use client";

import { Users2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { TableCount } from "@/components/table-count";
import { EmptyState } from "@/components/empty-state";
import { DataTable, type DataTableColumn } from "@/components/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TeamRequestsChart } from "@/components/teams/team-requests-chart";
import { useAppStore } from "@/lib/store";
import { getTeamUsage, type TeamUsage } from "@/lib/mock/teams";

export default function TeamUsageBreakdownPage() {
  const seeded = useAppStore((s) => s.seeded);
  const usage = seeded ? getTeamUsage() : [];

  const totalRequests = usage.reduce((s, u) => s + u.requests30d, 0);
  const totalCost = Math.round(usage.reduce((s, u) => s + u.costUsd30d, 0) * 100) / 100;
  const totalMembers = usage.reduce((s, u) => s + u.memberCount, 0);

  const columns: DataTableColumn<TeamUsage>[] = [
    {
      key: "team",
      label: "Team",
      render: (u) => (
        <div>
          <p className="text-[13px] text-ink-em">{u.team.name}</p>
          <p className="mt-0.5 truncate text-2xs text-ink-faint">{u.team.focus}</p>
        </div>
      ),
    },
    {
      key: "members",
      label: "Members",
      className: "text-xs text-ink-muted tabular-nums",
      render: (u) => u.memberCount,
    },
    {
      key: "requests",
      label: "Runs (30d)",
      align: "right",
      className: "text-right text-xs text-ink-em tabular-nums",
      render: (u) => u.requests30d.toLocaleString(),
    },
    {
      key: "cost",
      label: "Cost (30d)",
      align: "right",
      className: "text-right text-xs text-ink-muted tabular-nums",
      render: (u) => `$${u.costUsd30d.toLocaleString()}`,
    },
    { key: "agent", label: "Top agent", className: "text-xs text-ink-muted", render: (u) => u.topAgent },
    { key: "language", label: "Top language", className: "text-xs text-ink-muted", render: (u) => u.topLanguage },
    {
      key: "trend",
      label: "Trend (30d)",
      align: "right",
      className: "text-right text-xs tabular-nums",
      render: (u) => (
        <span className={u.trendPct >= 0 ? "text-success-300" : "text-danger-300"}>
          {u.trendPct >= 0 ? "+" : ""}
          {u.trendPct}%
        </span>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Usage Breakdown"
        description="How each internal team is putting the agent fleet to work — runs, cost, and the agents and languages they lean on most."
      />

      {!seeded ? (
        <EmptyState
          icon={Users2}
          title="No usage data yet"
          description="Turn on demo data in Settings to see team usage."
        />
      ) : (
        <>
          <div className="mb-4 grid grid-cols-3 gap-4">
            <StatCard label="Teams tracked" value={usage.length} />
            <StatCard label="Runs (30d)" value={totalRequests.toLocaleString()} hint="across all teams" />
            <StatCard label="Compute spend (30d)" value={`$${totalCost.toLocaleString()}`} hint={`${totalMembers} engineers`} />
          </div>

          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Runs by team, last 30 days</CardTitle>
            </CardHeader>
            <CardContent className="h-[240px]">
              <TeamRequestsChart usage={usage} />
            </CardContent>
          </Card>

          <TableCount count={usage.length} label="teams" />
          <DataTable columns={columns} data={usage} getRowKey={(u) => u.team.id} />
        </>
      )}
    </div>
  );
}
