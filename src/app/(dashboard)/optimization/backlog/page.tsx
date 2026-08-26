"use client";

import { useMemo, useState } from "react";
import { ListChecks } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { TableCount } from "@/components/table-count";
import { EmptyState } from "@/components/empty-state";
import { StatusBadge, type Tone } from "@/components/status-badge";
import { AgentTag } from "@/components/agent-tag";
import { DataTable, type DataTableColumn } from "@/components/data-table";
import { useAppStore } from "@/lib/store";
import { OPTIMIZATION_BACKLOG, type OptimizationItem, type BacklogStatus } from "@/lib/mock/optimization";
import { formatRelative } from "@/lib/mock/time";
import { cn } from "@/lib/utils";

const STATUS_META: Record<BacklogStatus, { tone: Tone; label: string }> = {
  proposed: { tone: "neutral", label: "Proposed" },
  "in-progress": { tone: "brand", label: "In Progress" },
  shipped: { tone: "success", label: "Shipped" },
  "wont-fix": { tone: "danger", label: "Won't Fix" },
};

const FILTERS: { value: BacklogStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "proposed", label: "Proposed" },
  { value: "in-progress", label: "In Progress" },
  { value: "shipped", label: "Shipped" },
  { value: "wont-fix", label: "Won't Fix" },
];

export default function OptimizationBacklogPage() {
  const seeded = useAppStore((s) => s.seeded);
  const [filter, setFilter] = useState<BacklogStatus | "all">("all");

  const filtered = useMemo(() => {
    if (!seeded) return [];
    return filter === "all" ? OPTIMIZATION_BACKLOG : OPTIMIZATION_BACKLOG.filter((o) => o.status === filter);
  }, [filter, seeded]);

  const columns: DataTableColumn<OptimizationItem>[] = [
    {
      key: "status",
      label: "Status",
      render: (o) => (
        <StatusBadge tone={STATUS_META[o.status].tone} label={STATUS_META[o.status].label} pulse={o.status === "in-progress"} />
      ),
    },
    {
      key: "title",
      label: "Opportunity",
      render: (o) => (
        <div className="max-w-[360px]">
          <div className="flex items-center gap-2">
            <p className="text-xs text-ink-em">{o.title}</p>
            {o.flaggedByAi && <AgentTag name="EnsembleAI" className="text-2xs" />}
          </div>
          <p className="mt-0.5 truncate text-2xs text-ink-faint">{o.description}</p>
        </div>
      ),
    },
    { key: "category", label: "Category", className: "text-xs text-ink-muted", render: (o) => o.category },
    {
      key: "impact",
      label: "Estimated impact",
      className: "font-mono text-xs text-ink-em",
      render: (o) => o.estimatedImpact,
    },
    { key: "owner", label: "Owner", className: "text-xs text-ink-muted", render: (o) => o.owner },
    {
      key: "created",
      label: "Opened",
      align: "right",
      className: "text-right font-mono text-2xs text-ink-faint tabular-nums",
      render: (o) => formatRelative(o.createdAt),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Optimization Backlog"
        description="Every proposed latency, cost, efficiency, and capability improvement, tracked from idea to shipped."
      />

      {!seeded ? (
        <EmptyState
          icon={ListChecks}
          title="No backlog items yet"
          description="Turn on demo data in Settings to see the optimization backlog."
        />
      ) : (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-1.5">
            {FILTERS.map((f) => {
              const count =
                f.value === "all"
                  ? OPTIMIZATION_BACKLOG.length
                  : OPTIMIZATION_BACKLOG.filter((o) => o.status === f.value).length;
              const active = filter === f.value;
              return (
                <button
                  key={f.value}
                  onClick={() => setFilter(f.value)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-2xs font-medium transition-colors",
                    active
                      ? "border-brand-500/30 bg-brand-500/10 text-brand-400"
                      : "border-border text-ink-muted hover:border-neutral-700 hover:text-ink-em",
                  )}
                >
                  {f.label}
                  <span className="font-mono tabular-nums opacity-70">{count}</span>
                </button>
              );
            })}
          </div>

          <TableCount count={filtered.length} label="opportunities" />

          <DataTable columns={columns} data={filtered} getRowKey={(o) => o.id} />
        </>
      )}
    </div>
  );
}
