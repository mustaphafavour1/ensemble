import { daysAgo, REFERENCE_NOW } from "./time";

export type ModelFamily = "Solis" | "Solis Code" | "Solis Vision" | "Solis Motion";
export type ModelTier = "Ultra" | "Pro" | "Flash";
export type ModelModality = "text" | "code" | "image" | "video";
export type ModelStatus = "production" | "staged" | "deprecated";
export type ModelVisibility = "public" | "internal" | "staged";

export interface ModelVersion {
  id: string;
  family: ModelFamily;
  tier: ModelTier | null;
  name: string;
  version: string;
  modality: ModelModality;
  status: ModelStatus;
  visibility: ModelVisibility;
  releasedAt: number;
  deprecatesAt: number | null;
  contextWindow: number;
  maxOutputTokens: number;
  maxVideoSeconds: number | null;
  regionsCount: number;
  countriesCount: number;
  dailyRequestsM: number;
  mauM: number;
  avgLatencyMs: number;
  benchmarkScore: number;
  description: string;
}

export const FAMILY_DESCRIPTIONS: Record<ModelFamily, string> = {
  Solis: "Flagship text and reasoning model — the default for general-purpose and agentic work.",
  "Solis Code": "Code generation and repository-scale reasoning.",
  "Solis Vision": "Text-to-image generation.",
  "Solis Motion": "Text-to-video generation.",
};

export const FAMILY_MODALITY: Record<ModelFamily, ModelModality> = {
  Solis: "text",
  "Solis Code": "code",
  "Solis Vision": "image",
  "Solis Motion": "video",
};

export interface FamilyProfile {
  capabilities: string[];
  focus: string;
}

export const FAMILY_PROFILES: Record<ModelFamily, FamilyProfile> = {
  Solis: {
    capabilities: [
      "Multi-step reasoning and long-horizon planning",
      "Native tool use and function calling for agentic workflows",
      "Up to 2M-token context window on the latest generation",
      "Three tiers (Ultra / Pro / Flash) trading capability for cost and latency",
    ],
    focus:
      "Each generation has pushed context length and agentic reliability further — 4.1 doubled context over 3.5, and the staged 5.0 doubles it again while improving reasoning benchmarks.",
  },
  "Solis Code": {
    capabilities: [
      "Repository-scale code generation and multi-file refactors",
      "Dependency-graph-aware edits on the latest version",
      "Code review and natural-language explanation of diffs",
    ],
    focus:
      "2.0 moved from file-level to repo-scale context; the staged 2.1 adds awareness of the dependency graph across a change.",
  },
  "Solis Vision": {
    capabilities: [
      "Text-to-image generation up to 4-megapixel output",
      "Fine-grained style and composition control via prompting",
    ],
    focus: "1.5 substantially improved output resolution and prompt fidelity over the 1.0 generation.",
  },
  "Solis Motion": {
    capabilities: [
      "Text-to-video generation up to 1080p",
      "Generation length extended from 30s to 60s in production, 180s in testing",
    ],
    focus:
      "Each generation has extended maximum clip length — 1.2 doubled it over 1.0, and the staged 1.3 triples it again.",
  },
};

const future = (days: number) => REFERENCE_NOW + days * 86_400_000;

export const MODEL_VERSIONS: ModelVersion[] = [
  {
    id: "solis-ultra-4-1", family: "Solis", tier: "Ultra", name: "Solis Ultra 4.1", version: "4.1",
    modality: "text", status: "production", visibility: "public",
    releasedAt: daysAgo(38), deprecatesAt: null,
    contextWindow: 1_000_000, maxOutputTokens: 64_000, maxVideoSeconds: null,
    regionsCount: 14, countriesCount: 71, dailyRequestsM: 780, mauM: 180, avgLatencyMs: 1450, benchmarkScore: 91.4,
    description: "The most capable Solis model — long-horizon reasoning, agentic tool use, million-token context.",
  },
  {
    id: "solis-pro-4-1", family: "Solis", tier: "Pro", name: "Solis Pro 4.1", version: "4.1",
    modality: "text", status: "production", visibility: "public",
    releasedAt: daysAgo(38), deprecatesAt: null,
    contextWindow: 1_000_000, maxOutputTokens: 32_000, maxVideoSeconds: null,
    regionsCount: 14, countriesCount: 71, dailyRequestsM: 1450, mauM: 260, avgLatencyMs: 640, benchmarkScore: 86.7,
    description: "Balanced cost and capability for the majority of production traffic.",
  },
  {
    id: "solis-flash-4-1", family: "Solis", tier: "Flash", name: "Solis Flash 4.1", version: "4.1",
    modality: "text", status: "production", visibility: "public",
    releasedAt: daysAgo(38), deprecatesAt: null,
    contextWindow: 256_000, maxOutputTokens: 16_000, maxVideoSeconds: null,
    regionsCount: 14, countriesCount: 71, dailyRequestsM: 3200, mauM: 310, avgLatencyMs: 210, benchmarkScore: 78.9,
    description: "Low-latency tier for high-volume, cost-sensitive workloads.",
  },
  {
    id: "solis-ultra-3-5", family: "Solis", tier: "Ultra", name: "Solis Ultra 3.5", version: "3.5",
    modality: "text", status: "production", visibility: "public",
    releasedAt: daysAgo(310), deprecatesAt: future(40),
    contextWindow: 500_000, maxOutputTokens: 32_000, maxVideoSeconds: null,
    regionsCount: 14, countriesCount: 71, dailyRequestsM: 210, mauM: 60, avgLatencyMs: 1520, benchmarkScore: 87.1,
    description: "Previous-generation flagship, still serving long-tail integrations pinned to 3.5.",
  },
  {
    id: "solis-pro-3-5", family: "Solis", tier: "Pro", name: "Solis Pro 3.5", version: "3.5",
    modality: "text", status: "deprecated", visibility: "public",
    releasedAt: daysAgo(310), deprecatesAt: daysAgo(10),
    contextWindow: 500_000, maxOutputTokens: 16_000, maxVideoSeconds: null,
    regionsCount: 9, countriesCount: 71, dailyRequestsM: 15, mauM: 8, avgLatencyMs: 590, benchmarkScore: 82.0,
    description: "Sunset in favor of 4.1 — remaining traffic is unmigrated integrations.",
  },
  {
    id: "solis-flash-3-5", family: "Solis", tier: "Flash", name: "Solis Flash 3.5", version: "3.5",
    modality: "text", status: "deprecated", visibility: "public",
    releasedAt: daysAgo(310), deprecatesAt: daysAgo(25),
    contextWindow: 128_000, maxOutputTokens: 8_000, maxVideoSeconds: null,
    regionsCount: 9, countriesCount: 71, dailyRequestsM: 40, mauM: 20, avgLatencyMs: 190, benchmarkScore: 74.2,
    description: "Sunset in favor of 4.1.",
  },
  {
    id: "solis-ultra-5-0", family: "Solis", tier: "Ultra", name: "Solis Ultra 5.0", version: "5.0",
    modality: "text", status: "staged", visibility: "staged",
    releasedAt: daysAgo(6), deprecatesAt: null,
    contextWindow: 2_000_000, maxOutputTokens: 64_000, maxVideoSeconds: null,
    regionsCount: 1, countriesCount: 0, dailyRequestsM: 2, mauM: 0.3, avgLatencyMs: 1380, benchmarkScore: 93.8,
    description: "Next-generation flagship, currently in internal testing ahead of staged rollout.",
  },

  {
    id: "solis-code-2-0", family: "Solis Code", tier: null, name: "Solis Code 2.0", version: "2.0",
    modality: "code", status: "production", visibility: "public",
    releasedAt: daysAgo(64), deprecatesAt: null,
    contextWindow: 500_000, maxOutputTokens: 32_000, maxVideoSeconds: null,
    regionsCount: 14, countriesCount: 71, dailyRequestsM: 310, mauM: 45, avgLatencyMs: 980, benchmarkScore: 89.5,
    description: "Repository-scale code generation, review, and multi-file refactors.",
  },
  {
    id: "solis-code-1-5", family: "Solis Code", tier: null, name: "Solis Code 1.5", version: "1.5",
    modality: "code", status: "deprecated", visibility: "public",
    releasedAt: daysAgo(280), deprecatesAt: daysAgo(15),
    contextWindow: 128_000, maxOutputTokens: 8_000, maxVideoSeconds: null,
    regionsCount: 9, countriesCount: 71, dailyRequestsM: 12, mauM: 6, avgLatencyMs: 740, benchmarkScore: 79.6,
    description: "Sunset in favor of 2.0.",
  },
  {
    id: "solis-code-2-1", family: "Solis Code", tier: null, name: "Solis Code 2.1", version: "2.1",
    modality: "code", status: "staged", visibility: "staged",
    releasedAt: daysAgo(4), deprecatesAt: null,
    contextWindow: 500_000, maxOutputTokens: 32_000, maxVideoSeconds: null,
    regionsCount: 1, countriesCount: 0, dailyRequestsM: 1.5, mauM: 0.2, avgLatencyMs: 910, benchmarkScore: 91.0,
    description: "Adds repo-wide dependency-graph awareness, in internal testing.",
  },

  {
    id: "solis-vision-1-5", family: "Solis Vision", tier: null, name: "Solis Vision 1.5", version: "1.5",
    modality: "image", status: "production", visibility: "public",
    releasedAt: daysAgo(92), deprecatesAt: null,
    contextWindow: 16_000, maxOutputTokens: 0, maxVideoSeconds: null,
    regionsCount: 12, countriesCount: 68, dailyRequestsM: 95, mauM: 38, avgLatencyMs: 3400, benchmarkScore: 84.2,
    description: "Text-to-image generation up to 4-megapixel output.",
  },
  {
    id: "solis-vision-1-0", family: "Solis Vision", tier: null, name: "Solis Vision 1.0", version: "1.0",
    modality: "image", status: "deprecated", visibility: "public",
    releasedAt: daysAgo(400), deprecatesAt: daysAgo(60),
    contextWindow: 4_000, maxOutputTokens: 0, maxVideoSeconds: null,
    regionsCount: 6, countriesCount: 68, dailyRequestsM: 4, mauM: 2, avgLatencyMs: 2800, benchmarkScore: 71.5,
    description: "Sunset in favor of 1.5.",
  },

  {
    id: "solis-motion-1-2", family: "Solis Motion", tier: null, name: "Solis Motion 1.2", version: "1.2",
    modality: "video", status: "production", visibility: "public",
    releasedAt: daysAgo(51), deprecatesAt: null,
    contextWindow: 8_000, maxOutputTokens: 0, maxVideoSeconds: 60,
    regionsCount: 10, countriesCount: 54, dailyRequestsM: 22, mauM: 14, avgLatencyMs: 48_000, benchmarkScore: 79.8,
    description: "Text-to-video generation, up to 60 seconds at 1080p.",
  },
  {
    id: "solis-motion-1-0", family: "Solis Motion", tier: null, name: "Solis Motion 1.0", version: "1.0",
    modality: "video", status: "deprecated", visibility: "public",
    releasedAt: daysAgo(220), deprecatesAt: daysAgo(90),
    contextWindow: 4_000, maxOutputTokens: 0, maxVideoSeconds: 30,
    regionsCount: 5, countriesCount: 54, dailyRequestsM: 1, mauM: 0.5, avgLatencyMs: 31_000, benchmarkScore: 68.4,
    description: "Sunset in favor of 1.2.",
  },
  {
    id: "solis-motion-1-3", family: "Solis Motion", tier: null, name: "Solis Motion 1.3", version: "1.3",
    modality: "video", status: "staged", visibility: "staged",
    releasedAt: daysAgo(2), deprecatesAt: null,
    contextWindow: 8_000, maxOutputTokens: 0, maxVideoSeconds: 180,
    regionsCount: 1, countriesCount: 0, dailyRequestsM: 0.3, mauM: 0.05, avgLatencyMs: 96_000, benchmarkScore: 82.1,
    description: "Extends max generation length from 60s to 180s, in internal testing.",
  },
];

export const GLOBAL_SCALE = {
  dataCenters: 14,
  countries: 71,
  acceleratorsTotal: 38_400,
  trainingDataPB: 340,
  totalMauM: 824,
  computeSpendThisMonthM: 62.4,
};

/** Summed from live (non-deprecated) model versions, so this can never drift from the per-model table. */
export function getTotalDailyRequestsB(): number {
  const totalM = MODEL_VERSIONS.filter((m) => m.status !== "deprecated").reduce(
    (sum, m) => sum + m.dailyRequestsM,
    0,
  );
  return Math.round((totalM / 1000) * 10) / 10;
}

export function getModelById(id: string): ModelVersion | undefined {
  return MODEL_VERSIONS.find((m) => m.id === id);
}

export function getFamilyVersions(family: ModelFamily): ModelVersion[] {
  return MODEL_VERSIONS.filter((m) => m.family === family).sort((a, b) => b.releasedAt - a.releasedAt);
}

export function getFamilyFirstRelease(family: ModelFamily): number {
  return Math.min(...MODEL_VERSIONS.filter((m) => m.family === family).map((m) => m.releasedAt));
}

export const MODEL_FAMILIES: ModelFamily[] = ["Solis", "Solis Code", "Solis Vision", "Solis Motion"];
