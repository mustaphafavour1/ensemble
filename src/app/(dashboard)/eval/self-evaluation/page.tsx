"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { FlaskConical, Play } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { EmptyState } from "@/components/empty-state";
import { StatusBadge, type Tone } from "@/components/status-badge";
import { AgentTag } from "@/components/agent-tag";
import { DataTable, type DataTableColumn } from "@/components/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppStore } from "@/lib/store";
import { hashString } from "@/lib/mock/rng";
import { MODEL_VERSIONS, getModelById } from "@/lib/mock/models";
import {
  BENCHMARK_SUITES,
  SELF_EVAL_HISTORY,
  PASS_THRESHOLD,
  getLatestScore,
  passes,
  type SelfEvalRun,
  type SelfEvalStatus,
  type BenchmarkSuite,
} from "@/lib/mock/self-eval";
import { formatRelative, formatDuration } from "@/lib/mock/time";
import { cn } from "@/lib/utils";

const EVAL_CANDIDATES = MODEL_VERSIONS.filter((m) => m.status !== "staged");

const STATUS_META: Record<SelfEvalStatus, { tone: Tone; label: string }> = {
  queued: { tone: "neutral", label: "Queued" },
  running: { tone: "brand", label: "Running" },
  completed: { tone: "success", label: "Completed" },
  failed: { tone: "danger", label: "Failed" },
};

export default function SelfEvaluationLoopPage() {
  const seeded = useAppStore((s) => s.seeded);
  const [runs, setRuns] = useState<SelfEvalRun[]>(SELF_EVAL_HISTORY);
  const [modelId, setModelId] = useState(EVAL_CANDIDATES[0].id);
  const [benchmark, setBenchmark] = useState<BenchmarkSuite>(BENCHMARK_SUITES[0]);
  const [latestId, setLatestId] = useState<string | null>(null);

  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => {
    const timeouts = timeoutsRef.current;
    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, []);

  const stats = useMemo(() => {
    const completed = runs.filter((r) => r.status === "completed" && r.score != null);
    const avg = completed.length
      ? completed.reduce((sum, r) => sum + (r.score ?? 0), 0) / completed.length
      : 0;
    const passCount = completed.filter((r) => passes(r.score!)).length;
    return {
      total: runs.length,
      avgScore: Math.round(avg * 10) / 10,
      passRate: completed.length ? Math.round((passCount / completed.length) * 1000) / 10 : 0,
    };
  }, [runs]);

  const latest = runs.find((r) => r.id === latestId) ?? null;
  const latestBaseline = latest ? getLatestScore(latest.modelId, latest.benchmark) : null;

  function runEvaluation(e: React.FormEvent) {
    e.preventDefault();
    const id = `seval_${Math.random().toString(36).slice(2, 9)}`;
    const model = getModelById(modelId)!;
    const startedAt = Date.now();

    setRuns((prev) => [
      { id, modelId, benchmark, status: "queued", score: null, startedAt, durationMs: null },
      ...prev,
    ]);
    setLatestId(id);
    toast("Evaluation queued", { description: `${model.name} against ${benchmark}.` });

    timeoutsRef.current.push(
      setTimeout(() => {
        setRuns((prev) => prev.map((r) => (r.id === id ? { ...r, status: "running" } : r)));
      }, 1400),
    );

    timeoutsRef.current.push(
      setTimeout(() => {
        const jitter = (hashString(id) % 900) / 100 - 4.5;
        const score = Math.max(40, Math.min(99.5, Math.round((model.benchmarkScore + jitter) * 10) / 10));
        setRuns((prev) =>
          prev.map((r) =>
            r.id === id
              ? { ...r, status: "completed", score, durationMs: Date.now() - startedAt }
              : r,
          ),
        );
        toast.success(`${model.name} scored ${score} on ${benchmark}`, {
          description: passes(score) ? "Passed the release threshold." : "Below the release threshold — flagged for review.",
        });
      }, 4600),
    );
  }

  const columns: DataTableColumn<SelfEvalRun>[] = [
    {
      key: "status",
      label: "Status",
      render: (r) => (
        <StatusBadge
          tone={STATUS_META[r.status].tone}
          label={STATUS_META[r.status].label}
          pulse={r.status === "queued" || r.status === "running"}
        />
      ),
    },
    {
      key: "model",
      label: "Model",
      className: "text-[13px] text-ink-em",
      render: (r) => getModelById(r.modelId)?.name ?? r.modelId,
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
          <span className={passes(r.score) ? "text-success-300" : "text-danger-300"}>
            {r.score.toFixed(1)}
          </span>
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
        title="Self-Evaluation Loop"
        description="Queue a model's output against a benchmark suite and watch the eval run through to a scored result."
      />

      {!seeded ? (
        <EmptyState
          icon={FlaskConical}
          title="No evaluation history yet"
          description="Turn on demo data in Settings to see the self-evaluation loop."
        />
      ) : (
        <>
          <div className="mb-6 grid grid-cols-3 gap-4">
            <StatCard label="Total eval runs" value={stats.total} hint="all time" />
            <StatCard label="Average score" value={stats.avgScore.toFixed(1)} hint={`pass ≥ ${PASS_THRESHOLD}`} />
            <StatCard label="Pass rate" value={`${stats.passRate}%`} hint="of completed runs" />
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Run a self-evaluation</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={runEvaluation} className="flex flex-wrap items-end gap-3">
                <div className="flex min-w-[220px] flex-1 flex-col gap-1.5">
                  <Label htmlFor="eval-model">Model</Label>
                  <Select value={modelId} onValueChange={(v) => v && setModelId(v)}>
                    <SelectTrigger id="eval-model" className="w-full">
                      <SelectValue>
                        {(v: string) => getModelById(v)?.name ?? v}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {EVAL_CANDIDATES.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex min-w-[200px] flex-1 flex-col gap-1.5">
                  <Label htmlFor="eval-benchmark">Benchmark suite</Label>
                  <Select value={benchmark} onValueChange={(v) => v && setBenchmark(v as BenchmarkSuite)}>
                    <SelectTrigger id="eval-benchmark" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {BENCHMARK_SUITES.map((b) => (
                        <SelectItem key={b} value={b}>
                          {b}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit">
                  <Play className="size-3.5" />
                  Run evaluation
                </Button>
              </form>

              {latest && (
                <div
                  className={cn(
                    "mt-4 rounded-md border px-3 py-2.5 text-xs",
                    latest.status === "completed"
                      ? passes(latest.score!)
                        ? "border-success-500/25 bg-success-500/[0.06] text-success-300"
                        : "border-danger-500/25 bg-danger-500/[0.06] text-danger-300"
                      : "border-border bg-surface/60 text-ink-muted",
                  )}
                >
                  {latest.status === "queued" && "Queued — waiting for a runner…"}
                  {latest.status === "running" && `Running ${getModelById(latest.modelId)?.name} against ${latest.benchmark}…`}
                  {latest.status === "completed" && (
                    <>
                      <span className="font-medium">{getModelById(latest.modelId)?.name}</span> scored{" "}
                      <span>{latest.score!.toFixed(1)}</span> on {latest.benchmark}
                      {latestBaseline != null && (
                        <>
                          {" "}
                          ({latest.score! - latestBaseline >= 0 ? "+" : ""}
                          {(latest.score! - latestBaseline).toFixed(1)} vs last run)
                        </>
                      )}
                      {" — "}
                      {passes(latest.score!) ? "passed the release threshold." : "below the release threshold, flagged for review."}
                      <div className="mt-2 border-t border-current/10 pt-2">
                        <AgentTag name="EnsembleAI" className="text-2xs opacity-80" />
                      </div>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <DataTable columns={columns} data={runs.slice(0, 30)} getRowKey={(r) => r.id} />
        </>
      )}
    </div>
  );
}
