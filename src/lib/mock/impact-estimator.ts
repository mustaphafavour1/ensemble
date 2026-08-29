import { Rng } from "./rng";
import { daysAgo } from "./time";
import { MODEL_VERSIONS, type ModelVersion } from "./models";

export type ImpactChangeType = "video-length" | "output-tokens" | "context-window";

export interface ImpactChangeDef {
  value: ImpactChangeType;
  label: string;
  unit: string;
  costScaleFactor: number;
  currentValue: (m: ModelVersion) => number;
  eligible: (m: ModelVersion) => boolean;
  suggestedTo: (current: number) => number;
}

export const IMPACT_CHANGE_TYPES: ImpactChangeDef[] = [
  {
    value: "video-length",
    label: "Extend max video generation length",
    unit: "s",
    costScaleFactor: 1.15,
    currentValue: (m) => m.maxVideoSeconds ?? 0,
    eligible: (m) => m.modality === "video",
    suggestedTo: (current) => current * 3,
  },
  {
    value: "output-tokens",
    label: "Increase max output tokens",
    unit: " tokens",
    costScaleFactor: 0.9,
    currentValue: (m) => m.maxOutputTokens,
    eligible: (m) => m.maxOutputTokens > 0,
    suggestedTo: (current) => current * 2,
  },
  {
    value: "context-window",
    label: "Extend context window",
    unit: " tokens",
    costScaleFactor: 0.6,
    currentValue: (m) => m.contextWindow,
    eligible: () => true,
    suggestedTo: (current) => current * 2,
  },
];

export type RolloutRisk = "Low" | "Medium" | "High";

export interface ImpactResult {
  costDeltaPct: number;
  additionalGpuHoursPerDay: number;
  risk: RolloutRisk;
  affectedModels: ModelVersion[];
}

const GPU_HOURS_PER_MILLION_REQUESTS = 42;

export function calculateImpact(
  changeType: ImpactChangeDef,
  model: ModelVersion,
  fromValue: number,
  toValue: number,
): ImpactResult {
  const ratio = fromValue > 0 ? toValue / fromValue : 1;
  const costDeltaPct = Math.round((ratio - 1) * 100 * changeType.costScaleFactor * 10) / 10;

  const additionalGpuHoursPerDay = Math.round(
    model.dailyRequestsM * GPU_HOURS_PER_MILLION_REQUESTS * (costDeltaPct / 100),
  );

  const risk: RolloutRisk = costDeltaPct < 30 ? "Low" : costDeltaPct < 100 ? "Medium" : "High";

  const affectedModels = MODEL_VERSIONS.filter(
    (m) => m.family === model.family && m.status !== "deprecated",
  );

  return { costDeltaPct, additionalGpuHoursPerDay, risk, affectedModels };
}

export interface PastChange {
  id: string;
  title: string;
  summary: string;
  modelName: string;
  changeType: string;
  appliedAt: number;
  estimatedCostDeltaPct: number;
  actualCostDeltaPct: number;
  risk: RolloutRisk;
}

const PAST_CHANGE_SEEDS: {
  title: string;
  summary: string;
  modelName: string;
  changeType: string;
  daysAgoApplied: number;
  estimatedCostDeltaPct: number;
}[] = [
  {
    title: "Extended Solis Ultra 3.5 context to 1M tokens",
    summary: "Doubled the context window ahead of the 4.1 generation to unblock long-document customers.",
    modelName: "Solis Ultra 3.5",
    changeType: "Context window",
    daysAgoApplied: 145,
    estimatedCostDeltaPct: 22,
  },
  {
    title: "Raised Solis Flash 4.1 max output to 16K tokens",
    summary: "Enterprise partners needed longer structured outputs for batch generation workloads.",
    modelName: "Solis Flash 4.1",
    changeType: "Output tokens",
    daysAgoApplied: 98,
    estimatedCostDeltaPct: 12,
  },
  {
    title: "Extended Solis Motion 1.2 generation to 60s",
    summary: "Matched a competitor's clip length ahead of a major creative-tooling partnership launch.",
    modelName: "Solis Motion 1.2",
    changeType: "Video length",
    daysAgoApplied: 210,
    estimatedCostDeltaPct: 45,
  },
  {
    title: "Doubled Solis Pro 4.1 context window to 512K",
    summary: "Rolled out alongside Ultra 4.1's context bump to keep the tier's positioning consistent.",
    modelName: "Solis Pro 4.1",
    changeType: "Context window",
    daysAgoApplied: 60,
    estimatedCostDeltaPct: 18,
  },
  {
    title: "Raised Solis Code 2.0 max output to 8K tokens",
    summary: "Repo-scale refactors were getting truncated mid-diff; this closed the gap.",
    modelName: "Solis Code 2.0",
    changeType: "Output tokens",
    daysAgoApplied: 175,
    estimatedCostDeltaPct: 9,
  },
  {
    title: "Extended Solis Ultra 4.1 context to 2M tokens",
    summary: "The flagship's headline capability for this generation — full-repo and long-video-transcript workloads.",
    modelName: "Solis Ultra 4.1",
    changeType: "Context window",
    daysAgoApplied: 40,
    estimatedCostDeltaPct: 30,
  },
  {
    title: "Raised Solis Vision 1.5 max output for higher-resolution replies",
    summary: "Bumped effective output tokens to support higher-resolution image description round-trips.",
    modelName: "Solis Vision 1.5",
    changeType: "Output tokens",
    daysAgoApplied: 120,
    estimatedCostDeltaPct: 15,
  },
];

function generatePastChanges(): PastChange[] {
  const rng = new Rng(9021);
  return PAST_CHANGE_SEEDS.map((seed, i) => {
    const actualCostDeltaPct = Math.round(seed.estimatedCostDeltaPct * rng.float(0.75, 1.35) * 10) / 10;
    const risk: RolloutRisk = actualCostDeltaPct < 15 ? "Low" : actualCostDeltaPct < 35 ? "Medium" : "High";
    return {
      id: `pastchange-${i}`,
      title: seed.title,
      summary: seed.summary,
      modelName: seed.modelName,
      changeType: seed.changeType,
      appliedAt: daysAgo(seed.daysAgoApplied),
      estimatedCostDeltaPct: seed.estimatedCostDeltaPct,
      actualCostDeltaPct,
      risk,
    };
  }).sort((a, b) => b.appliedAt - a.appliedAt);
}

export const PAST_CHANGES: PastChange[] = generatePastChanges();
