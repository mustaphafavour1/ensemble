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
