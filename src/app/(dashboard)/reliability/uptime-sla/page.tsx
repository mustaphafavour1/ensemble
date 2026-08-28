"use client";

import { Activity } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { EmptyState } from "@/components/empty-state";
import { DataTable, type DataTableColumn } from "@/components/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UptimeTrendChart } from "@/components/reliability/uptime-trend-chart";
import { useAppStore } from "@/lib/store";
import { getModelById } from "@/lib/mock/models";
import { SLA_RECORDS, SLA_TARGET, UPTIME_TREND, type SlaRecord } from "@/lib/mock/sla";
import { formatDuration } from "@/lib/mock/time";
import { cn } from "@/lib/utils";

export default function UptimeSlaPage() {
  const seeded = useAppStore((s) => s.seeded);

  const avgUptime = SLA_RECORDS.reduce((s, r) => s + r.uptimePct30d, 0) / SLA_RECORDS.length;
  const meeting = SLA_RECORDS.filter((r) => r.uptimePct30d >= r.slaTargetPct).length;
  const totalIncidents = SLA_RECORDS.reduce((s, r) => s + r.incidentsThisMonth, 0);

  const bySla = SLA_RECORDS.slice().sort((a, b) => b.uptimePct30d - a.uptimePct30d);
  const best = bySla[0];
  const worst = bySla[bySla.length - 1];
  const downtimeMs = UPTIME_TREND.reduce((s, d) => s + ((100 - d.uptimePct) / 100) * 86_400_000, 0);
  const longestStreak = UPTIME_TREND.reduce(
    (acc, d) => {
      const clean = d.uptimePct >= 99.99;
      const current = clean ? acc.current + 1 : 0;
      return { current, best: Math.max(acc.best, current) };
    },
    { current: 0, best: 0 },
  ).best;

  const columns: DataTableColumn<SlaRecord>[] = [
    {
      key: "model",
      label: "Model",
      className: "text-[14px] text-ink-em",
      render: (r) => getModelById(r.modelId)?.name ?? r.modelId,
    },
    {
      key: "uptime",
      label: "30-day uptime",
      align: "right",
      className: "text-right text-xs tabular-nums",
      render: (r) => (
        <span className={r.uptimePct30d >= r.slaTargetPct ? "text-success-300" : "text-danger-300"}>
          {r.uptimePct30d.toFixed(3)}%
        </span>
      ),
    },
    {
      key: "target",
      label: "SLA target",
      align: "right",
      className: "text-right text-2xs text-ink-faint tabular-nums",
      render: (r) => `${r.slaTargetPct}%`,
    },
    {
      key: "delta",
      label: "Delta",
      align: "right",
      className: "text-right text-xs tabular-nums",
      render: (r) => {
        const delta = Math.round((r.uptimePct30d - r.slaTargetPct) * 1000) / 1000;
        return (
          <span className={delta >= 0 ? "text-success-300" : "text-danger-300"}>
            {delta >= 0 ? "+" : ""}
            {delta.toFixed(3)}
          </span>
        );
      },
    },
    {
      key: "incidents",
      label: "Incidents this month",
      align: "right",
      className: cn("text-right text-xs tabular-nums"),
      render: (r) => (r.incidentsThisMonth > 0 ? r.incidentsThisMonth : "—"),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Uptime & SLA Tracking"
        description="Uptime against SLA target, per model, and the platform-wide trend over the last 90 days."
      />

      {!seeded ? (
        <EmptyState
          icon={Activity}
          title="No uptime data yet"
          description="Turn on demo data in Settings to see SLA tracking."
        />
      ) : (
        <>
          <div className="mb-6 grid grid-cols-6 gap-4">
            <StatCard label="Average uptime (30d)" value={`${avgUptime.toFixed(3)}%`} hint={`target ${SLA_TARGET}%`} />
            <StatCard label="Meeting SLA" value={`${meeting} / ${SLA_RECORDS.length}`} hint="production models" />
            <StatCard label="Incidents this month" value={totalIncidents} />
            <StatCard
              label="Best performer"
              value={`${best.uptimePct30d.toFixed(3)}%`}
              hint={getModelById(best.modelId)?.name ?? best.modelId}
            />
            <StatCard
              label="Worst performer"
              value={`${worst.uptimePct30d.toFixed(3)}%`}
              hint={getModelById(worst.modelId)?.name ?? worst.modelId}
            />
            <StatCard label="Downtime (90d)" value={formatDuration(downtimeMs)} hint={`longest clean streak: ${longestStreak}d`} />
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Platform-wide uptime</CardTitle>
              <p className="text-2xs text-ink-muted">Daily, last 90 days</p>
            </CardHeader>
            <CardContent className="h-[280px]">
              <UptimeTrendChart />
            </CardContent>
          </Card>

          <DataTable columns={columns} data={SLA_RECORDS} getRowKey={(r) => r.modelId} />
        </>
      )}
    </div>
  );
}
