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
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { SuccessFailureChart } from "@/components/analytics/success-failure-chart";
import { DeploymentFrequencyChart } from "@/components/analytics/deployment-frequency-chart";
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
import { DEPLOYMENTS, stackForRepo, type Deployment, type DeploymentStatus } from "@/lib/mock/delivery";
import { formatDuration } from "@/lib/mock/time";
import { cn } from "@/lib/utils";

// DEPLOYMENTS is sorted most-recent-first, so the first hit per run here is
// that run's latest deploy — a run can be deployed more than once (e.g. a
// rollback followed by a redeploy).
const LATEST_DEPLOY_BY_RUN = new Map<string, Deployment>();
for (const d of DEPLOYMENTS) {
  if (d.runId && !LATEST_DEPLOY_BY_RUN.has(d.runId)) {
    LATEST_DEPLOY_BY_RUN.set(d.runId, d);
  }
}

const STATUS_META: Record<RunStatus, { tone: Tone; label: string }> = {
  queued: { tone: "neutral", label: "Queued" },
  running: { tone: "brand", label: "Running" },
  "awaiting-review": { tone: "warning", label: "Awaiting Review" },
  merged: { tone: "success", label: "Merged" },
  failed: { tone: "danger", label: "Failed" },
};

const DEPLOY_STATUS_META: Record<DeploymentStatus, { tone: Tone; label: string }> = {
  success: { tone: "success", label: "Deployed" },
  failed: { tone: "danger", label: "Deploy failed" },
  "in-progress": { tone: "brand", label: "Deploying" },
  "rolled-back": { tone: "warning", label: "Rolled back" },
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

export default function RunHistoryPage() {
  const router = useRouter();
  const seeded = useAppStore((s) => s.seeded);
  const [filter, setFilter] = useState<RunStatus | "all">("all");

  const filtered = useMemo(() => {
    if (!seeded) return [];
    return filter === "all" ? RUNS : RUNS.filter((r) => r.status === filter);
  }, [filter, seeded]);

  const { page, setPage, pageSize, setPageSize, pageCount, pageItems } = usePagination(filtered, PAGE_SIZE);
  const stuck = seeded ? getStuckRun() : null;

  return (
    <div>
      <PageHeader
        title="Run History"
        description="Every agent run across every repo — status, cost, the diff it produced, and how its deploy went."
      />

      {!seeded ? (
        <EmptyState
          icon={ListChecks}
          title="No runs yet"
          description="Turn on demo data in Settings to see a populated run history."
        />
      ) : (
        <>
          <div className="mb-6 grid grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Run success / failure</CardTitle>
                <p className="text-2xs text-ink-muted">Merged vs. failed, by week</p>
              </CardHeader>
              <CardContent className="h-[220px]">
                <SuccessFailureChart />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Deployment frequency</CardTitle>
                <p className="text-2xs text-ink-muted">Successful deploys, by week</p>
              </CardHeader>
              <CardContent className="h-[220px]">
                <DeploymentFrequencyChart />
              </CardContent>
            </Card>
          </div>

          {stuck && (
            <div className="mb-5">
              <EnsembleAINote label="EnsembleAI — Stuck-Run Highlight">
                <button
                  className="text-left hover:underline"
                  onClick={() => router.push(`/agents/runs/${stuck.run.id}`)}
                >
                  <span className="font-medium">{getAgentForRun(stuck.run).name}</span> has
                  been {stuck.run.status} for {stuck.elapsedMin} minutes on{" "}
                  <span>{getRepoForRun(stuck.run).name}</span> —
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
                      : "border-border text-ink-muted hover:border-neutral-700 hover:text-ink-em",
                  )}
                >
                  {f.label}
                  <span className="tabular-nums opacity-70">{count}</span>
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
                <TableHead>Deploy</TableHead>
                <TableHead className="text-right">Cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageItems.map((run, i) => {
                const agent = getAgentForRun(run);
                const repo = getRepoForRun(run);
                const stack = stackForRepo(run.repoId);
                const meta = STATUS_META[run.status];
                const deploy = LATEST_DEPLOY_BY_RUN.get(run.id);
                return (
                  <TableRow
                    key={run.id}
                    onClick={() => router.push(`/agents/runs/${run.id}`)}
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
                      <p className="truncate text-[13px] text-ink-em">{run.title}</p>
                      <p className="mt-0.5 truncate text-2xs text-ink-faint">
                        {run.branch}
                      </p>
                    </TableCell>
                    <TableCell>
                      <AgentTag name={agent.name} className="text-xs" />
                      <p className="mt-0.5 text-2xs text-ink-faint">
                        {agent.model.name}
                      </p>
                    </TableCell>
                    <TableCell className="text-xs text-ink-em">
                      {repo.name}
                    </TableCell>
                    <TableCell>
                      <StackTag stack={stack} className="text-2xs text-ink-muted" />
                    </TableCell>
                    <TableCell className="text-xs text-ink-muted tabular-nums">
                      {run.durationMs ? formatDuration(run.durationMs) : "—"}
                    </TableCell>
                    <TableCell>
                      {deploy ? (
                        <StatusBadge
                          tone={DEPLOY_STATUS_META[deploy.status].tone}
                          label={DEPLOY_STATUS_META[deploy.status].label}
                          pulse={deploy.status === "in-progress"}
                        />
                      ) : (
                        <span className="text-2xs text-ink-faint">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right text-xs text-ink-em tabular-nums">
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
            pageSize={pageSize}
            noun="runs"
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        </>
      )}
    </div>
  );
}
