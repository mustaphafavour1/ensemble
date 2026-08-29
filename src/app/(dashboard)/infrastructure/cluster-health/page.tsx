"use client";

import { useMemo, useState } from "react";
import { Cpu } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { TableCount } from "@/components/table-count";
import { Pagination } from "@/components/pagination";
import { EmptyState } from "@/components/empty-state";
import { StatusBadge, type Tone } from "@/components/status-badge";
import { DataTable, type DataTableColumn } from "@/components/data-table";
import { Progress } from "@/components/ui/progress";
import { useAppStore } from "@/lib/store";
import { usePagination } from "@/lib/use-pagination";
import { COMPUTE_CLUSTERS, type ComputeCluster, type AcceleratorType } from "@/lib/mock/clusters";
import type { DcStatus } from "@/lib/mock/datacenters";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 15;

const STATUS_META: Record<DcStatus, { tone: Tone; label: string }> = {
  healthy: { tone: "success", label: "Healthy" },
  degraded: { tone: "warning", label: "Degraded" },
  critical: { tone: "danger", label: "Critical" },
};

const FILTERS: { value: AcceleratorType | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "GPU", label: "GPU" },
  { value: "TPU", label: "TPU" },
];

export default function ComputeClusterHealthPage() {
  const seeded = useAppStore((s) => s.seeded);
  const [filter, setFilter] = useState<AcceleratorType | "all">("all");

  const filtered = useMemo(() => {
    if (!seeded) return [];
    return filter === "all" ? COMPUTE_CLUSTERS : COMPUTE_CLUSTERS.filter((c) => c.acceleratorType === filter);
  }, [filter, seeded]);

  const { page, setPage, pageSize, setPageSize, pageCount, pageItems } = usePagination(filtered, PAGE_SIZE);

  const columns: DataTableColumn<ComputeCluster>[] = [
    {
      key: "status",
      label: "Status",
      render: (c) => <StatusBadge tone={STATUS_META[c.status].tone} label={STATUS_META[c.status].label} />,
    },
    { key: "name", label: "Cluster", className: "text-[13px] text-ink-em", render: (c) => c.name },
    {
      key: "dc",
      label: "Data center",
      className: "text-xs text-ink-muted",
      render: (c) => c.dcName,
    },
    { key: "type", label: "Accelerator", className: "text-xs text-ink-muted", render: (c) => c.acceleratorType },
    {
      key: "nodes",
      label: "Nodes",
      align: "right",
      className: "text-right text-xs text-ink-muted tabular-nums",
      render: (c) => c.nodeCount.toLocaleString(),
    },
    {
      key: "utilization",
      label: "Utilization",
      className: "w-40",
      render: (c) => (
        <div className="flex items-center gap-2">
          <Progress value={c.utilizationPct} className="h-1 w-20" />
          <span className="text-2xs text-ink-muted tabular-nums">{c.utilizationPct}%</span>
        </div>
      ),
    },
    {
      key: "temp",
      label: "Temp",
      align: "right",
      className: cn("text-right text-xs tabular-nums"),
      render: (c) => (
        <span className={c.tempC > 65 ? "text-warning-300" : "text-ink-muted"}>{c.tempC}°C</span>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Compute Cluster Health"
        description="Utilization, temperature, and health for every accelerator cluster across the fleet."
      />

      {!seeded ? (
        <EmptyState
          icon={Cpu}
          title="No cluster data yet"
          description="Turn on demo data in Settings to see cluster health."
        />
      ) : (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-1.5">
            {FILTERS.map((f) => {
              const count =
                f.value === "all" ? COMPUTE_CLUSTERS.length : COMPUTE_CLUSTERS.filter((c) => c.acceleratorType === f.value).length;
              const active = filter === f.value;
              return (
                <button
                  key={f.value}
                  onClick={() => {
                    setFilter(f.value);
                    setPage(1);
                  }}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-2xs font-medium transition-colors",
                    active
                      ? "border-brand-500/30 bg-brand-500/10 text-brand-400"
                      : "border-border text-ink-muted hover:border-neutral-700 hover:text-ink-em",
                  )}
                >
                  {f.label}
                  <span className="tabular-nums opacity-70">{count}</span>
                </button>
              );
            })}
          </div>

          <TableCount count={filtered.length} label="clusters" />

          <DataTable columns={columns} data={pageItems} getRowKey={(c) => c.id} />

          <Pagination
            page={page}
            pageCount={pageCount}
            total={filtered.length}
            pageSize={pageSize}
            noun="clusters"
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        </>
      )}
    </div>
  );
}
