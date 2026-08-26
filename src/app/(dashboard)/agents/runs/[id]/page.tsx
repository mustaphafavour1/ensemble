"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, FileCode2, ShieldCheck, Receipt } from "lucide-react";
import { StatusBadge, type Tone } from "@/components/status-badge";
import { AgentTag } from "@/components/agent-tag";
import { StackTag } from "@/components/stack-tag";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getRunById, getAgentForRun, getRepoForRun, type RunStatus } from "@/lib/mock/runs";
import { stackForRepo } from "@/lib/mock/delivery";
import { getRunDetail } from "@/lib/mock/run-detail";
import { formatDate, formatDuration } from "@/lib/mock/time";

const STATUS_META: Record<RunStatus, { tone: Tone; label: string }> = {
  queued: { tone: "neutral", label: "Queued" },
  running: { tone: "brand", label: "Running" },
  "awaiting-review": { tone: "warning", label: "Awaiting Review" },
  merged: { tone: "success", label: "Merged" },
  failed: { tone: "danger", label: "Failed" },
};

export default function RunDetailPage() {
  const params = useParams<{ id: string }>();
  const run = getRunById(params.id);

  if (!run) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-sm text-ink-em">Run not found</p>
        <p className="mt-1 text-2xs text-ink-muted">
          It may have been pruned from history.
        </p>
        <Link
          href="/agents/runs"
          className="mt-4 text-2xs text-brand-400 hover:underline"
        >
          ← Back to Runs
        </Link>
      </div>
    );
  }

  const agent = getAgentForRun(run);
  const repo = getRepoForRun(run);
  const stack = stackForRepo(run.repoId);
  const meta = STATUS_META[run.status];
  const detail = getRunDetail(run);

  return (
    <div>
      <Link
        href="/agents/runs"
        className="mb-4 inline-flex items-center gap-1.5 text-2xs text-ink-muted hover:text-ink-em"
      >
        <ArrowLeft className="size-3" />
        Back to Runs
      </Link>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <StatusBadge tone={meta.tone} label={meta.label} pulse={run.status === "running"} />
            <span className="font-mono text-2xs text-ink-faint">{run.id}</span>
          </div>
          <h1 className="mt-2 font-heading text-xl text-ink-em">{run.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-ink-muted">
            <AgentTag name={agent.name} />
            <span className="font-mono text-ink-faint">{agent.model.name}</span>
            <span className="font-mono">{repo.name}</span>
            <StackTag stack={stack} />
            <span className="font-mono text-2xs text-ink-faint">{run.branch}</span>
          </div>
        </div>
        <div className="flex gap-4 text-right">
          <div>
            <p className="text-2xs text-ink-faint">Duration</p>
            <p className="font-mono text-sm text-ink-em tabular-nums">
              {run.durationMs ? formatDuration(run.durationMs) : "—"}
            </p>
          </div>
          <div>
            <p className="text-2xs text-ink-faint">Cost</p>
            <p className="font-mono text-sm text-ink-em tabular-nums">
              {run.costUsd > 0 ? `$${run.costUsd.toFixed(2)}` : "—"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Spec given</CardTitle>
            </CardHeader>
            <CardContent className="text-xs leading-relaxed text-ink-200">
              {detail.specText}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Proposed plan</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="flex flex-col gap-2.5">
                {detail.planSteps.map((step, i) => (
                  <li key={i} className="flex gap-2.5 text-xs text-ink-200">
                    <span className="font-mono text-2xs text-brand-500">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileCode2 className="size-3.5 text-ink-faint" />
                <CardTitle>Diff</CardTitle>
                <span className="font-mono text-2xs text-ink-faint">
                  +{run.linesAdded} / -{run.linesRemoved}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="flex flex-col divide-y divide-border">
                {detail.diffFiles.map((f) => (
                  <li
                    key={f.path}
                    className="flex items-center justify-between py-2 font-mono text-2xs"
                  >
                    <span className="text-ink-200">{f.path}</span>
                    <span className="tabular-nums">
                      <span className="text-success-300">+{f.additions}</span>{" "}
                      <span className="text-danger-300">-{f.removals}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-64 overflow-y-auto rounded-md bg-neutral-950 p-3">
                {detail.logLines.map((line, i) => (
                  <p
                    key={i}
                    className="font-mono text-2xs leading-relaxed text-ink-muted"
                  >
                    <span className="text-ink-faint">
                      [{String(Math.floor(line.offsetSec / 60)).padStart(2, "0")}:
                      {String(line.offsetSec % 60).padStart(2, "0")}]
                    </span>{" "}
                    {line.message}
                  </p>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="col-span-1 flex flex-col gap-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-3.5 text-ink-faint" />
                <CardTitle>Provenance &amp; confidence</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {run.confidencePct != null ? (
                <>
                  <div className="mb-1 flex items-center justify-between text-2xs">
                    <span className="text-ink-faint">Confidence</span>
                    <span className="font-mono text-ink-em tabular-nums">
                      {run.confidencePct}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-800">
                    <div
                      className={
                        run.confidencePct >= 80
                          ? "h-full bg-success-500"
                          : run.confidencePct >= 60
                            ? "h-full bg-warning-500"
                            : "h-full bg-danger-500"
                      }
                      style={{ width: `${run.confidencePct}%` }}
                    />
                  </div>
                </>
              ) : (
                <p className="text-2xs text-ink-faint">
                  Confidence is reported once the run completes.
                </p>
              )}

              <dl className="mt-4 flex flex-col gap-2.5 border-t border-border pt-3 text-2xs">
                <div className="flex items-center justify-between">
                  <dt className="text-ink-faint">Commit</dt>
                  <dd className="font-mono text-ink-em">{run.commitSha}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-ink-faint">Reviewer</dt>
                  <dd className="text-ink-em">{run.reviewer ?? "Unreviewed"}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-ink-faint">Started</dt>
                  <dd className="font-mono text-ink-em">{formatDate(run.startedAt)}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Receipt className="size-3.5 text-ink-faint" />
                <CardTitle>Cost breakdown</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <dl className="flex flex-col gap-2.5 text-2xs">
                <div className="flex items-center justify-between">
                  <dt className="text-ink-faint">Input tokens</dt>
                  <dd className="font-mono text-ink-em tabular-nums">
                    {detail.cost.inputTokens.toLocaleString()}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-ink-faint">Output tokens</dt>
                  <dd className="font-mono text-ink-em tabular-nums">
                    {detail.cost.outputTokens.toLocaleString()}
                  </dd>
                </div>
                <div className="flex items-center justify-between border-t border-border pt-2.5">
                  <dt className="text-ink-faint">Input cost</dt>
                  <dd className="font-mono text-ink-em tabular-nums">
                    ${detail.cost.inputCost.toFixed(2)}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-ink-faint">Output cost</dt>
                  <dd className="font-mono text-ink-em tabular-nums">
                    ${detail.cost.outputCost.toFixed(2)}
                  </dd>
                </div>
                <div className="flex items-center justify-between border-t border-border pt-2.5">
                  <dt className="font-medium text-ink-em">Total</dt>
                  <dd className="font-mono font-medium text-brand-400 tabular-nums">
                    ${run.costUsd.toFixed(2)}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
