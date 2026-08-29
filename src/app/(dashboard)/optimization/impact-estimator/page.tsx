"use client";

import { useMemo, useState } from "react";
import { Calculator, Zap, Cpu, ShieldAlert, History } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MODEL_VERSIONS } from "@/lib/mock/models";
import {
  IMPACT_CHANGE_TYPES,
  calculateImpact,
  PAST_CHANGES,
  type ImpactChangeType,
  type ImpactResult,
  type RolloutRisk,
} from "@/lib/mock/impact-estimator";
import { useAppStore } from "@/lib/store";
import { formatDate } from "@/lib/mock/time";
import { cn } from "@/lib/utils";

const RISK_CLASSES: Record<RolloutRisk, string> = {
  Low: "border-success-500/25 bg-success-500/10 text-success-300",
  Medium: "border-warning-500/25 bg-warning-500/10 text-warning-300",
  High: "border-danger-500/25 bg-danger-500/10 text-danger-300",
};

export default function ImpactEstimatorPage() {
  const seeded = useAppStore((s) => s.seeded);
  const [changeType, setChangeType] = useState<ImpactChangeType>("video-length");
  const def = IMPACT_CHANGE_TYPES.find((c) => c.value === changeType)!;

  const eligibleModels = useMemo(() => MODEL_VERSIONS.filter((m) => def.eligible(m) && m.status !== "deprecated"), [def]);
  const [modelId, setModelId] = useState(eligibleModels[0]?.id ?? "");
  const model = MODEL_VERSIONS.find((m) => m.id === modelId) ?? eligibleModels[0];

  const fromValue = model ? def.currentValue(model) : 0;
  const [toValue, setToValue] = useState<string>(String(def.suggestedTo(fromValue)));
  const [result, setResult] = useState<ImpactResult | null>(null);

  function handleChangeType(v: ImpactChangeType) {
    const nextDef = IMPACT_CHANGE_TYPES.find((c) => c.value === v)!;
    const nextEligible = MODEL_VERSIONS.filter((m) => nextDef.eligible(m) && m.status !== "deprecated");
    const nextModel = nextEligible[0];
    setChangeType(v);
    setModelId(nextModel?.id ?? "");
    setToValue(nextModel ? String(nextDef.suggestedTo(nextDef.currentValue(nextModel))) : "");
    setResult(null);
  }

  function handleModelChange(id: string) {
    setModelId(id);
    const m = MODEL_VERSIONS.find((x) => x.id === id);
    if (m) setToValue(String(def.suggestedTo(def.currentValue(m))));
    setResult(null);
  }

  function handleCalculate(e: React.FormEvent) {
    e.preventDefault();
    if (!model) return;
    const to = Number(toValue);
    if (!to || to <= fromValue) return;
    setResult(calculateImpact(def, model, fromValue, to));
  }

  return (
    <div>
      <PageHeader
        title="Impact Estimator"
        description="Model a proposed capability change before it ships — compute cost delta, affected models, and rollout risk."
      />

      {!seeded ? (
        <EmptyState
          icon={Calculator}
          title="No model data yet"
          description="Turn on demo data in Settings to use the Impact Estimator."
        />
      ) : (
        <>
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Calculator className="size-3.5 text-ink-faint" />
                <CardTitle>Proposed change</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex flex-wrap items-center gap-1.5">
                {IMPACT_CHANGE_TYPES.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => handleChangeType(c.value)}
                    className={cn(
                      "rounded-full border px-2.5 py-1 text-2xs font-medium transition-colors",
                      changeType === c.value
                        ? "border-brand-500/30 bg-brand-500/10 text-brand-400"
                        : "border-border text-ink-muted hover:border-neutral-700 hover:text-ink-em",
                    )}
                  >
                    {c.label}
                  </button>
                ))}
              </div>

              <form onSubmit={handleCalculate} className="flex flex-wrap items-end gap-3">
                <div className="flex min-w-[220px] flex-1 flex-col gap-1.5">
                  <Label htmlFor="impact-model">Target model</Label>
                  <Select value={modelId} onValueChange={(v) => v && handleModelChange(v)}>
                    <SelectTrigger id="impact-model" className="w-full">
                      <SelectValue>
                        {(v: string) => MODEL_VERSIONS.find((m) => m.id === v)?.name ?? v}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {eligibleModels.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex w-32 flex-col gap-1.5">
                  <Label>Current</Label>
                  <div className="flex h-9 items-center rounded-md border border-border bg-surface/60 px-3 text-xs text-ink-muted tabular-nums">
                    {fromValue.toLocaleString()}
                    {def.unit}
                  </div>
                </div>

                <div className="flex w-40 flex-col gap-1.5">
                  <Label htmlFor="impact-to">Proposed</Label>
                  <Input
                    id="impact-to"
                    type="number"
                    min={fromValue + 1}
                    value={toValue}
                    onChange={(e) => {
                      setToValue(e.target.value);
                      setResult(null);
                    }}
                  />
                </div>

                <Button type="submit" disabled={!model}>
                  <Zap className="size-3.5" />
                  Calculate impact
                </Button>
              </form>
            </CardContent>
          </Card>

          {result && model && (
            <div className="grid grid-cols-3 gap-4">
              <Card className="col-span-1">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Cpu className="size-3.5 text-ink-faint" />
                    <CardTitle>Compute cost</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="font-heading text-3xl text-ink-em tabular-nums">
                    {result.costDeltaPct >= 0 ? "+" : ""}
                    {result.costDeltaPct}%
                  </p>
                  <p className="mt-1.5 text-2xs text-ink-faint">per-request compute cost</p>
                  <p className="mt-3 border-t border-border pt-3 text-sm text-ink-em tabular-nums">
                    +{result.additionalGpuHoursPerDay.toLocaleString()} GPU-hrs/day
                  </p>
                  <p className="mt-1 text-2xs text-ink-faint">at current traffic for {model.name}</p>
                </CardContent>
              </Card>

              <Card className="col-span-1">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="size-3.5 text-ink-faint" />
                    <CardTitle>Rollout risk</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
                      RISK_CLASSES[result.risk],
                    )}
                  >
                    {result.risk}
                  </span>
                  <p className="mt-3 text-2xs leading-relaxed text-ink-muted">
                    {result.risk === "Low" &&
                      "Small enough to roll out broadly without a staged ramp."}
                    {result.risk === "Medium" &&
                      "Recommend a staged rollout with monitoring before going fully public."}
                    {result.risk === "High" &&
                      "Significant compute impact — recommend internal testing and a limited staged rollout first."}
                  </p>
                </CardContent>
              </Card>

              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Affected models</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="flex flex-col gap-2">
                    {result.affectedModels.map((m) => (
                      <li key={m.id} className="flex items-center justify-between text-xs">
                        <span className="text-[13px] text-ink-em">{m.name}</span>
                        <span className="text-2xs text-ink-faint">{m.status}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          )}

          <Card className="mt-6">
            <CardHeader>
              <div className="flex items-center gap-2">
                <History className="size-3.5 text-ink-faint" />
                <CardTitle>Past changes</CardTitle>
              </div>
              <p className="text-2xs text-ink-muted">
                Estimated vs. actual compute impact for the last {PAST_CHANGES.length} capability changes shipped.
              </p>
            </CardHeader>
            <CardContent>
              <ul className="flex flex-col divide-y divide-border">
                {PAST_CHANGES.map((c) => (
                  <li key={c.id} className="flex flex-col gap-1.5 py-4 first:pt-0 last:pb-0">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <p className="text-[13px] text-ink-em">{c.title}</p>
                      <span
                        className={cn(
                          "shrink-0 rounded-full border px-2 py-0.5 text-2xs font-medium",
                          RISK_CLASSES[c.risk],
                        )}
                      >
                        {c.risk} risk
                      </span>
                    </div>
                    <p className="text-2xs leading-relaxed text-ink-muted">{c.summary}</p>
                    <div className="mt-0.5 flex flex-wrap items-center gap-3 text-2xs text-ink-faint">
                      <span>{c.modelName}</span>
                      <span>{c.changeType}</span>
                      <span>{formatDate(c.appliedAt)}</span>
                    </div>
                    <div className="mt-1.5 flex items-center gap-5 border-t border-border pt-2.5">
                      <span className="text-xs text-ink-faint">
                        Estimated{" "}
                        <span className="font-medium text-ink-em tabular-nums">+{c.estimatedCostDeltaPct}%</span>
                      </span>
                      <span className="text-xs text-ink-faint">
                        Actual{" "}
                        <span
                          className={cn(
                            "font-medium tabular-nums",
                            c.actualCostDeltaPct > c.estimatedCostDeltaPct ? "text-danger-300" : "text-success-300",
                          )}
                        >
                          +{c.actualCostDeltaPct}%
                        </span>
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
