"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ListChecks } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { TableCount } from "@/components/table-count";
import { Pagination } from "@/components/pagination";
import { EmptyState } from "@/components/empty-state";
import { StatusBadge, type Tone } from "@/components/status-badge";
import { AgentTag } from "@/components/agent-tag";
import { StackTag } from "@/components/stack-tag";
import { EnsembleAINote } from "@/components/ensemble-ai";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAppStore } from "@/lib/store";
import { usePagination } from "@/lib/use-pagination";
import { RUNS, getAgentForRun, getRepoForRun, getStuckRun, type RunStatus } from "@/lib/mock/runs";
import { stackForRepo } from "@/lib/mock/delivery";
import { formatDuration } from "@/lib/mock/time";
import { cn } from "@/lib/utils";

const STATUS_META: Record<RunStatus, { tone: Tone; label: string }> = {
  queued: { tone: "neutral", label: "Queued" },
  running: { tone: "brand", label: "Running" },
  "awaiting-review": { tone: "warning", label: "Awaiting Review" },
  merged: { tone: "success", label: "Merged" },
  failed: { tone: "danger", label: "Failed" },
};

const FILTERS: { value: RunStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "running", label: "Running" },
  { value: "queued", label: "Queued" },
  { value: "awaiting-review", label: "Awaiting Review" },
  { value: "merged", label: "Merged" },
  { value: "failed", label: "Failed" },
];

const PAGE_SIZE = 10;

export default function RunsPage() {
  const router = useRouter();
  const seeded = useAppStore((s) => s.seeded);
  const [filter, setFilter] = useState<RunStatus | "all">("all");

  const filtered = useMemo(() => {
    if (!seeded) return [];
    return filter === "all" ? RUNS : RUNS.filter((r) => r.status === filter);
  }, [filter, seeded]);

  const { page, setPage, pageCount, pageItems } = usePagination(filtered, PAGE_SIZE);
  const stuck = seeded ? getStuckRun() : null;

  return (
    <div>
      <PageHeader
        title="Runs"
        description="Every agent run across every repo — status, cost, and the diff it produced."
      />

      {!seeded ? (
        <EmptyState
          icon={ListChecks}
          title="No runs yet"
          description="Turn on demo data in Settings to see a populated run history."
        />
      ) : (
        <>
          {stuck && (
            <div className="mb-5">
              <EnsembleAINote label="EnsembleAI — Stuck-Run Highlight">
                <button
                  className="text-left hover:underline"
                  onClick={() => router.push(`/runs/${stuck.run.id}`)}
                >
                  <span className="font-medium">{getAgentForRun(stuck.run).name}</span> has
                  been {stuck.run.status} for {stuck.elapsedMin} minutes on{" "}
                  <span className="font-mono">{getRepoForRun(stuck.run).name}</span> —
                  longer than usual. Worth a look.
                </button>
              </EnsembleAINote>
            </div>
          )}

          <div className="mb-4 flex flex-wrap items-center gap-1.5">
            {FILTERS.map((f) => {
              const count =
                f.value === "all" ? RUNS.length : RUNS.filter((r) => r.status === f.value).length;
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
                      : "border-border text-ink-300 hover:border-neutral-700 hover:text-ink-100",
                  )}
                >
                  {f.label}
                  <span className="font-mono tabular-nums opacity-70">{count}</span>
                </button>
              );
            })}
          </div>

          <TableCount count={filtered.length} label="runs" />

          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Status</TableHead>
                <TableHead>Run</TableHead>
                <TableHead>Agent / Model</TableHead>
                <TableHead>Repo</TableHead>
                <TableHead>Stack</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead className="text-right">Cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageItems.map((run, i) => {
                const agent = getAgentForRun(run);
                const repo = getRepoForRun(run);
                const stack = stackForRepo(run.repoId);
                const meta = STATUS_META[run.status];
                return (
                  <TableRow
                    key={run.id}
                    onClick={() => router.push(`/runs/${run.id}`)}
                    className={cn(
                      "cursor-pointer",
                      i % 2 === 1 && "bg-white/[0.012]",
                    )}
                  >
                    <TableCell>
                      <StatusBadge
                        tone={meta.tone}
                        label={meta.label}
                        pulse={run.status === "running"}
                      />
                    </TableCell>
                    <TableCell className="max-w-[280px]">
                      <p className="truncate text-xs text-ink-100">{run.title}</p>
                      <p className="mt-0.5 truncate font-mono text-2xs text-ink-500">
                        {run.branch}
                      </p>
                    </TableCell>
                    <TableCell>
                      <AgentTag name={agent.name} className="text-xs" />
                      <p className="mt-0.5 font-mono text-2xs text-ink-500">
                        {agent.model.name}
                      </p>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-ink-100">
                      {repo.name}
                    </TableCell>
                    <TableCell>
                      <StackTag stack={stack} className="text-2xs text-ink-300" />
                    </TableCell>
                    <TableCell className="font-mono text-xs text-ink-300 tabular-nums">
                      {run.durationMs ? formatDuration(run.durationMs) : "—"}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs text-ink-100 tabular-nums">
                      {run.costUsd > 0 ? `$${run.costUsd.toFixed(2)}` : "—"}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {pageItems.length === 0 && (
            <EmptyState
              icon={ListChecks}
              title="No runs match this filter"
              description="Try a different status filter."
            />
          )}

          <Pagination
            page={page}
            pageCount={pageCount}
            total={filtered.length}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}
