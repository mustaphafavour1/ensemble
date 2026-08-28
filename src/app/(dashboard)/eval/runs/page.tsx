"use client";

import { useMemo, useState } from "react";
import { ClipboardCheck } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { TableCount } from "@/components/table-count";
import { Pagination } from "@/components/pagination";
import { EmptyState } from "@/components/empty-state";
import { StatusBadge, type Tone } from "@/components/status-badge";
import { DataTable, type DataTableColumn } from "@/components/data-table";
import { useAppStore } from "@/lib/store";
import { usePagination } from "@/lib/use-pagination";
import { getModelById } from "@/lib/mock/models";
import {
  BENCHMARK_SUITES,
  SELF_EVAL_HISTORY,
  passes,
  type SelfEvalRun,
  type SelfEvalStatus,
  type BenchmarkSuite,
} from "@/lib/mock/self-eval";
import { formatRelative, formatDuration } from "@/lib/mock/time";
import { cn } from "@/lib/utils";

const STATUS_META: Record<SelfEvalStatus, { tone: Tone; label: string }> = {
  queued: { tone: "neutral", label: "Queued" },
  running: { tone: "brand", label: "Running" },
  completed: { tone: "success", label: "Completed" },
  failed: { tone: "danger", label: "Failed" },
};

const BENCHMARK_FILTERS: { value: BenchmarkSuite | "all"; label: string }[] = [
  { value: "all", label: "All" },
  ...BENCHMARK_SUITES.map((b) => ({ value: b, label: b })),
];

const PAGE_SIZE = 12;

export default function EvalRunsPage() {
  const seeded = useAppStore((s) => s.seeded);
  const [filter, setFilter] = useState<BenchmarkSuite | "all">("all");

  const filtered = useMemo(() => {
    if (!seeded) return [];
    return filter === "all" ? SELF_EVAL_HISTORY : SELF_EVAL_HISTORY.filter((r) => r.benchmark === filter);
  }, [filter, seeded]);

  const { page, setPage, pageSize, setPageSize, pageCount, pageItems } = usePagination(filtered, PAGE_SIZE);

  const columns: DataTableColumn<SelfEvalRun>[] = [
    {
      key: "status",
      label: "Status",
      render: (r) => <StatusBadge tone={STATUS_META[r.status].tone} label={STATUS_META[r.status].label} />,
    },
    {
      key: "model",
      label: "Model",
      className: "text-xs text-ink-em",
      render: (r) => getModelById(r.modelId)?.name ?? r.modelId,
    },
    {
      key: "family",
      label: "Family",
      className: "text-2xs text-ink-faint",
      render: (r) => getModelById(r.modelId)?.family ?? "—",
    },
    {
      key: "benchmark",
      label: "Benchmark",
      className: "text-xs text-ink-muted",
      render: (r) => r.benchmark,
    },
    {
      key: "score",
      label: "Score",
      align: "right",
      className: "text-right text-xs tabular-nums",
      render: (r) =>
        r.score == null ? (
          <span className="text-ink-faint">—</span>
        ) : (
          <span className={passes(r.score) ? "text-success-300" : "text-danger-300"}>{r.score.toFixed(1)}</span>
        ),
    },
    {
      key: "duration",
      label: "Duration",
      align: "right",
      className: "text-right text-2xs text-ink-muted tabular-nums",
      render: (r) => (r.durationMs ? formatDuration(r.durationMs) : "—"),
    },
    {
      key: "started",
      label: "Started",
      align: "right",
      className: "text-right text-2xs text-ink-faint tabular-nums",
      render: (r) => formatRelative(r.startedAt),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Eval Runs"
        description="The full history of self-evaluation runs across every model and benchmark suite."
      />

      {!seeded ? (
        <EmptyState
          icon={ClipboardCheck}
          title="No eval runs yet"
          description="Turn on demo data in Settings to see evaluation history."
        />
      ) : (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-1.5">
            {BENCHMARK_FILTERS.map((f) => {
              const count =
                f.value === "all"
                  ? SELF_EVAL_HISTORY.length
                  : SELF_EVAL_HISTORY.filter((r) => r.benchmark === f.value).length;
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

          <TableCount count={filtered.length} label="eval runs" />

          <DataTable columns={columns} data={pageItems} getRowKey={(r) => r.id} />

          <Pagination
            page={page}
            pageCount={pageCount}
            total={filtered.length}
            pageSize={pageSize}
            noun="eval runs"
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        </>
      )}
    </div>
  );
}
