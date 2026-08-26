"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Gauge, Globe, Layers } from "lucide-react";
import { StatusBadge, type Tone } from "@/components/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getModelById,
  getFamilyVersions,
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

export default function ModelDetailPage() {
  const params = useParams<{ id: string }>();
  const model = getModelById(params.id);

  if (!model) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-sm text-ink-em">Model not found</p>
        <p className="mt-1 text-2xs text-ink-muted">It may have been fully retired.</p>
        <Link href="/models" className="mt-4 text-2xs text-brand-400 hover:underline">
          ← Back to All Models
        </Link>
      </div>
    );
  }

  const meta = STATUS_META[model.status];
  const versions = getFamilyVersions(model.family);

  return (
    <div>
      <Link
        href="/models"
        className="mb-4 inline-flex items-center gap-1.5 text-2xs text-ink-muted hover:text-ink-em"
      >
        <ArrowLeft className="size-3" />
        Back to All Models
      </Link>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <StatusBadge tone={meta.tone} label={meta.label} />
            <span className="font-mono text-2xs text-ink-faint">{model.id}</span>
          </div>
          <h1 className="mt-2 font-heading text-xl text-ink-em">{model.name}</h1>
          <p className="mt-2 max-w-2xl text-xs leading-relaxed text-ink-muted">
            {model.description}
          </p>
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
        <div className="flex gap-4 text-right">
          <div>
            <p className="text-2xs text-ink-faint">Daily requests</p>
            <p className="font-mono text-sm text-ink-em tabular-nums">
              {formatCount(model.dailyRequestsM)}
            </p>
          </div>
          <div>
            <p className="text-2xs text-ink-faint">MAU</p>
            <p className="font-mono text-sm text-ink-em tabular-nums">{formatCount(model.mauM)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 flex flex-col gap-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Gauge className="size-3.5 text-ink-faint" />
                <CardTitle>Specifications</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-y-3 text-xs">
                <dt className="text-ink-faint">Context window</dt>
                <dd className="text-right font-mono text-ink-em">{formatTokens(model.contextWindow)} tokens</dd>
                {model.maxOutputTokens > 0 && (
                  <>
                    <dt className="text-ink-faint">Max output tokens</dt>
                    <dd className="text-right font-mono text-ink-em">
                      {formatTokens(model.maxOutputTokens)}
                    </dd>
                  </>
                )}
                {model.maxVideoSeconds != null && (
                  <>
                    <dt className="text-ink-faint">Max video length</dt>
                    <dd className="text-right font-mono text-ink-em">{model.maxVideoSeconds}s</dd>
                  </>
                )}
                <dt className="text-ink-faint">Avg latency</dt>
                <dd className="text-right font-mono text-ink-em">
                  {model.avgLatencyMs >= 1000
                    ? `${(model.avgLatencyMs / 1000).toFixed(1)}s`
                    : `${model.avgLatencyMs}ms`}
                </dd>
                <dt className="text-ink-faint">Benchmark score</dt>
                <dd className="text-right font-mono text-ink-em">{model.benchmarkScore.toFixed(1)}</dd>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Globe className="size-3.5 text-ink-faint" />
                <CardTitle>Availability</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-y-3 text-xs">
                <dt className="text-ink-faint">Data center regions</dt>
                <dd className="text-right font-mono text-ink-em tabular-nums">{model.regionsCount}</dd>
                <dt className="text-ink-faint">Countries</dt>
                <dd className="text-right font-mono text-ink-em tabular-nums">{model.countriesCount}</dd>
                <dt className="text-ink-faint">Visibility</dt>
                <dd className="text-right text-ink-em">{VISIBILITY_LABEL[model.visibility]}</dd>
              </dl>
            </CardContent>
          </Card>
        </div>

        <div className="col-span-1">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Layers className="size-3.5 text-ink-faint" />
                <CardTitle>{model.family} versions</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="flex flex-col divide-y divide-border">
                {versions.map((v) => {
                  const vMeta = STATUS_META[v.status];
                  const isCurrent = v.id === model.id;
                  return (
                    <li key={v.id} className="py-2.5 first:pt-0 last:pb-0">
                      <Link
                        href={`/models/${v.id}`}
                        className={cn(
                          "flex items-center justify-between gap-2 rounded-md px-1.5 py-1 text-xs transition-colors",
                          isCurrent ? "bg-brand-500/10 text-brand-400" : "text-ink-em hover:text-brand-400",
                        )}
                      >
                        <span className="font-mono">{v.version}</span>
                        <StatusBadge tone={vMeta.tone} label={vMeta.label} className="text-[9px]" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
