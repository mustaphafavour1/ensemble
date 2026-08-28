import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StatusBadge, type Tone } from "@/components/status-badge";
import {
  getModelById,
  getFamilyVersions,
  FAMILY_PROFILES,
  type ModelStatus,
} from "@/lib/mock/models";
import { formatDate } from "@/lib/mock/time";
import { cn } from "@/lib/utils";

const STATUS_META: Record<ModelStatus, { tone: Tone; label: string }> = {
  production: { tone: "success", label: "Production" },
  staged: { tone: "brand", label: "Staged" },
  deprecated: { tone: "neutral", label: "Deprecated" },
};

const VISIBILITY_LABEL: Record<string, string> = {
  public: "Public",
  internal: "Internal",
  staged: "Staged",
};

function formatCount(m: number): string {
  if (m >= 1000) return `${(m / 1000).toFixed(1)}B`;
  if (m < 1) return `${Math.round(m * 1000)}K`;
  return `${m.toFixed(m < 10 ? 1 : 0)}M`;
}

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1000)}K`;
  return `${n}`;
}

export function ModelDetailsDialog({
  modelId,
  open,
  onOpenChange,
  onSelectModel,
}: {
  modelId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectModel: (id: string) => void;
}) {
  const model = modelId ? getModelById(modelId) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        {model && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2">
                <StatusBadge tone={STATUS_META[model.status].tone} label={STATUS_META[model.status].label} />
                <span className="text-2xs text-ink-faint">{model.id}</span>
              </div>
              <DialogTitle className="mt-1">{model.name}</DialogTitle>
            </DialogHeader>

            <div>
              <p className="mb-1 text-2xs font-medium tracking-[0.06em] text-ink-faint uppercase">Summary</p>
              <p className="text-xs leading-relaxed text-ink-muted">{model.description}</p>
              <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-2xs text-ink-faint">
                <span>{model.family}</span>
                {model.tier && <span>{model.tier} tier</span>}
                <span>{VISIBILITY_LABEL[model.visibility]}</span>
                <span>Released {formatDate(model.releasedAt)}</span>
                {model.deprecatesAt && (
                  <span className={model.status === "deprecated" ? "text-danger-300" : "text-warning-300"}>
                    {model.status === "deprecated" ? "Deprecated" : "Deprecates"} {formatDate(model.deprecatesAt)}
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-border pt-3">
              <div>
                <p className="mb-2 text-2xs font-medium tracking-[0.06em] text-ink-faint uppercase">Specifications</p>
                <dl className="grid grid-cols-2 gap-y-2 text-xs">
                  <dt className="text-ink-faint">Context window</dt>
                  <dd className="text-right text-ink-em">{formatTokens(model.contextWindow)} tokens</dd>
                  {model.maxOutputTokens > 0 && (
                    <>
                      <dt className="text-ink-faint">Max output</dt>
                      <dd className="text-right text-ink-em">{formatTokens(model.maxOutputTokens)}</dd>
                    </>
                  )}
                  {model.maxVideoSeconds != null && (
                    <>
                      <dt className="text-ink-faint">Max video</dt>
                      <dd className="text-right text-ink-em">{model.maxVideoSeconds}s</dd>
                    </>
                  )}
                  <dt className="text-ink-faint">Avg latency</dt>
                  <dd className="text-right text-ink-em">
                    {model.avgLatencyMs >= 1000 ? `${(model.avgLatencyMs / 1000).toFixed(1)}s` : `${model.avgLatencyMs}ms`}
                  </dd>
                  <dt className="text-ink-faint">Benchmark</dt>
                  <dd className="text-right text-ink-em">{model.benchmarkScore.toFixed(1)}</dd>
                </dl>
              </div>

              <div>
                <p className="mb-2 text-2xs font-medium tracking-[0.06em] text-ink-faint uppercase">Availability</p>
                <dl className="grid grid-cols-2 gap-y-2 text-xs">
                  <dt className="text-ink-faint">Regions</dt>
                  <dd className="text-right text-ink-em tabular-nums">{model.regionsCount}</dd>
                  <dt className="text-ink-faint">Countries</dt>
                  <dd className="text-right text-ink-em tabular-nums">{model.countriesCount}</dd>
                  <dt className="text-ink-faint">Daily requests</dt>
                  <dd className="text-right text-ink-em">{formatCount(model.dailyRequestsM)}</dd>
                  <dt className="text-ink-faint">MAU</dt>
                  <dd className="text-right text-ink-em">{formatCount(model.mauM)}</dd>
                </dl>
              </div>
            </div>

            <div className="border-t border-border pt-3">
              <p className="mb-2 text-2xs font-medium tracking-[0.06em] text-ink-faint uppercase">
                {model.family} versions
              </p>
              <ul className="flex flex-col divide-y divide-border">
                {getFamilyVersions(model.family).map((v) => {
                  const vMeta = STATUS_META[v.status];
                  const isCurrent = v.id === model.id;
                  return (
                    <li key={v.id}>
                      <button
                        type="button"
                        onClick={() => onSelectModel(v.id)}
                        className={cn(
                          "flex w-full items-center justify-between gap-2 rounded-md px-1.5 py-2 text-left text-xs transition-colors",
                          isCurrent ? "bg-brand-500/10 text-brand-400" : "text-ink-em hover:bg-surface-hover",
                        )}
                      >
                        <span>{v.name}</span>
                        <span className="flex items-center gap-2">
                          <span className="text-2xs text-ink-faint">{formatDate(v.releasedAt)}</span>
                          <StatusBadge tone={vMeta.tone} label={vMeta.label} className="text-[10.5px]" />
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            <p className="border-t border-border pt-3 text-2xs leading-relaxed text-ink-faint">
              {FAMILY_PROFILES[model.family].focus}
            </p>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
