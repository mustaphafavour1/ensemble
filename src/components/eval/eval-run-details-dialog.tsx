import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StatusBadge, type Tone } from "@/components/status-badge";
import { getModelById } from "@/lib/mock/models";
import { BENCHMARK_DESCRIPTIONS, passes, type SelfEvalRun, type SelfEvalStatus } from "@/lib/mock/self-eval";
import { formatDateTime, formatDuration } from "@/lib/mock/time";

const STATUS_META: Record<SelfEvalStatus, { tone: Tone; label: string }> = {
  queued: { tone: "neutral", label: "Queued" },
  running: { tone: "brand", label: "Running" },
  completed: { tone: "success", label: "Completed" },
  failed: { tone: "danger", label: "Failed" },
};

export function EvalRunDetailsDialog({
  run,
  open,
  onOpenChange,
}: {
  run: SelfEvalRun | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const model = run ? getModelById(run.modelId) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {run && (
          <>
            <DialogHeader>
              <StatusBadge tone={STATUS_META[run.status].tone} label={STATUS_META[run.status].label} />
              <DialogTitle className="mt-1">{run.benchmark}</DialogTitle>
              <p className="text-2xs text-ink-muted">{BENCHMARK_DESCRIPTIONS[run.benchmark]}</p>
            </DialogHeader>

            <dl className="grid grid-cols-2 gap-y-3 border-t border-border pt-3 text-xs">
              <dt className="text-ink-faint">Model</dt>
              <dd className="text-right text-ink-em">{model?.name ?? run.modelId}</dd>

              <dt className="text-ink-faint">Family</dt>
              <dd className="text-right text-ink-em">{model?.family ?? "—"}</dd>

              <dt className="text-ink-faint">Score</dt>
              <dd className="text-right">
                {run.score == null ? (
                  <span className="text-ink-faint">—</span>
                ) : (
                  <span className={passes(run.score) ? "text-success-300" : "text-danger-300"}>
                    {run.score.toFixed(1)}
                  </span>
                )}
              </dd>

              <dt className="text-ink-faint">Duration</dt>
              <dd className="text-right text-ink-em">{run.durationMs ? formatDuration(run.durationMs) : "—"}</dd>

              <dt className="text-ink-faint">Started</dt>
              <dd className="text-right text-ink-em">{formatDateTime(run.startedAt)}</dd>
            </dl>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
