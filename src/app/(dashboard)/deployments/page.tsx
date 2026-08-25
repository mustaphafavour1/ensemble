"use client";

import { useMemo, useState } from "react";
import { Rocket } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { TableCount } from "@/components/table-count";
import { Pagination } from "@/components/pagination";
import { EmptyState } from "@/components/empty-state";
import { StatusBadge, type Tone } from "@/components/status-badge";
import { StackTag } from "@/components/stack-tag";
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
import { DEPLOYMENTS, stackForRepo, type DeploymentStatus } from "@/lib/mock/delivery";
import { REPOS } from "@/lib/mock/catalog";
import { formatDuration, formatRelative } from "@/lib/mock/time";
import { cn } from "@/lib/utils";

const STATUS_META: Record<DeploymentStatus, { tone: Tone; label: string }> = {
  success: { tone: "success", label: "Success" },
  failed: { tone: "danger", label: "Failed" },
  "in-progress": { tone: "brand", label: "In Progress" },
  "rolled-back": { tone: "warning", label: "Rolled Back" },
};

const FILTERS: { value: DeploymentStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "success", label: "Success" },
  { value: "in-progress", label: "In Progress" },
  { value: "failed", label: "Failed" },
  { value: "rolled-back", label: "Rolled Back" },
];

const PAGE_SIZE = 10;

export default function DeploymentsPage() {
  const seeded = useAppStore((s) => s.seeded);
  const [filter, setFilter] = useState<DeploymentStatus | "all">("all");

  const filtered = useMemo(() => {
    if (!seeded) return [];
    return filter === "all" ? DEPLOYMENTS : DEPLOYMENTS.filter((d) => d.status === filter);
  }, [filter, seeded]);

  const { page, setPage, pageCount, pageItems } = usePagination(filtered, PAGE_SIZE);

  return (
    <div>
      <PageHeader
        title="Deployments"
        description="Every deployment across every environment and stack."
      />

      {!seeded ? (
        <EmptyState
          icon={Rocket}
          title="No deployments yet"
          description="Turn on demo data in Settings to see deployment history."
        />
      ) : (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-1.5">
            {FILTERS.map((f) => {
              const count =
                f.value === "all"
                  ? DEPLOYMENTS.length
                  : DEPLOYMENTS.filter((d) => d.status === f.value).length;
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

          <TableCount count={filtered.length} label="deployments" />

          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Status</TableHead>
                <TableHead>Repo</TableHead>
                <TableHead>Environment</TableHead>
                <TableHead>Commit</TableHead>
                <TableHead>Stack</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead className="text-right">Deployed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageItems.map((dep, i) => {
                const repo = REPOS.find((r) => r.id === dep.repoId)!;
                const stack = stackForRepo(dep.repoId);
                const meta = STATUS_META[dep.status];
                return (
                  <TableRow
                    key={dep.id}
                    className={i % 2 === 1 ? "bg-white/[0.012]" : undefined}
                  >
                    <TableCell>
                      <StatusBadge
                        tone={meta.tone}
                        label={meta.label}
                        pulse={dep.status === "in-progress"}
                      />
                    </TableCell>
                    <TableCell className="font-mono text-xs text-ink-100">
                      {repo.name}
                    </TableCell>
                    <TableCell className="text-xs text-ink-200 capitalize">
                      {dep.environment}
                    </TableCell>
                    <TableCell className="font-mono text-2xs text-ink-500">
                      {dep.commitSha}
                    </TableCell>
                    <TableCell>
                      <StackTag stack={stack} className="text-2xs text-ink-300" />
                    </TableCell>
                    <TableCell className="font-mono text-xs text-ink-300 tabular-nums">
                      {formatDuration(dep.durationMs)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-2xs text-ink-500 tabular-nums">
                      {formatRelative(dep.deployedAt)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {pageItems.length === 0 && (
            <EmptyState
              icon={Rocket}
              title="No deployments match this filter"
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
