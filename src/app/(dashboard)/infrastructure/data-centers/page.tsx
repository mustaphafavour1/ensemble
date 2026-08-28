"use client";

import { Globe } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { EmptyState } from "@/components/empty-state";
import { StatusBadge, type Tone } from "@/components/status-badge";
import { DataTable, type DataTableColumn } from "@/components/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataCenterMap } from "@/components/infrastructure/data-center-map";
import { useAppStore } from "@/lib/store";
import { DATA_CENTERS, type DataCenter, type DcStatus } from "@/lib/mock/datacenters";

const STATUS_META: Record<DcStatus, { tone: Tone; label: string }> = {
  healthy: { tone: "success", label: "Healthy" },
  degraded: { tone: "warning", label: "Degraded" },
  critical: { tone: "danger", label: "Critical" },
};

export default function DataCenterMapPage() {
  const seeded = useAppStore((s) => s.seeded);

  const totalCapacity = DATA_CENTERS.reduce((s, dc) => s + dc.capacityAccelerators, 0);
  const totalPower = DATA_CENTERS.reduce((s, dc) => s + dc.powerMw, 0);
  const avgLoad = Math.round(DATA_CENTERS.reduce((s, dc) => s + dc.loadPct, 0) / DATA_CENTERS.length);
  const atRisk = DATA_CENTERS.filter((dc) => dc.status !== "healthy").length;

  const columns: DataTableColumn<DataCenter>[] = [
    {
      key: "status",
      label: "Status",
      render: (dc) => <StatusBadge tone={STATUS_META[dc.status].tone} label={STATUS_META[dc.status].label} />,
    },
    {
      key: "name",
      label: "Data center",
      render: (dc) => (
        <div>
          <p className="text-xs text-ink-em">{dc.name}</p>
          <p className="mt-0.5 text-2xs text-ink-faint">{dc.country}</p>
        </div>
      ),
    },
    { key: "region", label: "Region", className: "text-2xs text-ink-muted", render: (dc) => dc.region },
    {
      key: "load",
      label: "Load",
      align: "right",
      className: "text-right text-xs text-ink-em tabular-nums",
      render: (dc) => `${dc.loadPct}%`,
    },
    {
      key: "capacity",
      label: "Accelerators",
      align: "right",
      className: "text-right text-xs text-ink-muted tabular-nums",
      render: (dc) => dc.capacityAccelerators.toLocaleString(),
    },
    {
      key: "power",
      label: "Power",
      align: "right",
      className: "text-right text-2xs text-ink-faint tabular-nums",
      render: (dc) => `${dc.powerMw} MW`,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Data Center Map"
        description="Every data center in the fleet, live status and load, plotted worldwide."
      />

      {!seeded ? (
        <EmptyState
          icon={Globe}
          title="No infrastructure data yet"
          description="Turn on demo data in Settings to see the data center map."
        />
      ) : (
        <>
          <div className="mb-6 grid grid-cols-4 gap-4">
            <StatCard label="Data centers online" value={DATA_CENTERS.length} hint={`${atRisk} degraded or critical`} />
            <StatCard label="Total accelerators" value={totalCapacity.toLocaleString()} />
            <StatCard label="Average load" value={`${avgLoad}%`} />
            <StatCard label="Total power draw" value={`${totalPower} MW`} />
          </div>

          <Card className="mb-6">
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Global footprint</CardTitle>
                <p className="mt-1 text-2xs text-ink-muted">Scroll to zoom into any region.</p>
              </div>
              <div className="flex items-center gap-3 text-2xs text-ink-muted">
                <span className="flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-brand-500" />
                  Healthy
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-warning-500" />
                  Degraded
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-danger-500" />
                  Critical
                </span>
              </div>
            </CardHeader>
            <CardContent className="h-[440px] pt-2">
              <DataCenterMap />
            </CardContent>
          </Card>

          <DataTable columns={columns} data={DATA_CENTERS} getRowKey={(dc) => dc.id} />
        </>
      )}
    </div>
  );
}
