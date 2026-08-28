import { Rng } from "./rng";
import { REVIEWERS } from "./people";
import { minutesAgo } from "./time";

export const DATASET_SOURCES = [
  "Internal collection",
  "Licensed third-party",
  "Synthetic generation",
  "User-contributed (opted in)",
  "Partner data-sharing agreement",
] as const;

export const DATASET_USES = [
  "Pretraining",
  "Fine-tuning",
  "Evaluation",
  "Safety tuning",
  "RLHF / RLAIF",
] as const;

export const DATASET_CATEGORIES = [
  "Mathematics",
  "Visual Reasoning",
  "Code",
  "Multilingual",
  "Conversational",
  "Safety",
  "Long-Context",
  "Finance",
  "Scientific Reasoning",
  "General Knowledge",
  "Video & Motion",
  "Instruction-Following",
] as const;

export type DatasetSource = (typeof DATASET_SOURCES)[number];
export type DatasetUse = (typeof DATASET_USES)[number];
export type DatasetCategory = (typeof DATASET_CATEGORIES)[number];
export type DatasetSizeUnit = "GB" | "TB" | "PB";
export type DatasetStatus = "processing" | "ready" | "failed";

export interface Dataset {
  id: string;
  name: string;
  source: DatasetSource;
  category: DatasetCategory;
  sizeValue: number;
  sizeUnit: DatasetSizeUnit;
  intendedUse: DatasetUse;
  target: string;
  uploadedBy: string;
  uploadedAt: number;
  status: DatasetStatus;
}

const SEED_NAMES: { name: string; target: string; category: DatasetCategory }[] = [
  { name: "web-crawl-dedup-2026-q3", target: "s3://ensemble-datasets/web-crawl-dedup-2026-q3", category: "General Knowledge" },
  { name: "code-repos-permissive-license", target: "s3://ensemble-datasets/code-permissive", category: "Code" },
  { name: "multilingual-conversations-v4", target: "s3://ensemble-datasets/multiling-convo-v4", category: "Multilingual" },
  { name: "synthetic-reasoning-chains", target: "gs://ensemble-synth/reasoning-chains", category: "Mathematics" },
  { name: "image-caption-pairs-licensed", target: "s3://ensemble-datasets/image-caption-licensed", category: "Visual Reasoning" },
  { name: "video-clips-motion-training", target: "s3://ensemble-datasets/video-motion-train", category: "Video & Motion" },
  { name: "rlhf-preference-pairs-batch-14", target: "internal://rlhf/batch-14", category: "Instruction-Following" },
  { name: "customer-support-transcripts-optin", target: "s3://ensemble-datasets/support-transcripts-optin", category: "Conversational" },
  { name: "safety-red-team-prompts-v6", target: "internal://safety/red-team-v6", category: "Safety" },
  { name: "long-context-books-public-domain", target: "s3://ensemble-datasets/books-public-domain", category: "Long-Context" },
  { name: "instruction-following-curated", target: "s3://ensemble-datasets/instruct-curated", category: "Instruction-Following" },
  { name: "partner-financial-docs-2026", target: "sftp://partner-vault/financial-docs-2026", category: "Finance" },
];

function generateDatasets(): Dataset[] {
  const rng = new Rng(7734);
  return SEED_NAMES.map((seed, i) => {
    const isBulk = rng.bool(0.35);
    const sizeUnit: DatasetSizeUnit = isBulk ? "PB" : rng.bool(0.5) ? "TB" : "GB";
    return {
      id: rng.id("ds"),
      name: seed.name,
      source: rng.pick(DATASET_SOURCES),
      category: seed.category,
      sizeValue: isBulk ? rng.int(2, 60) : rng.int(20, 900),
      sizeUnit,
      intendedUse: rng.pick(DATASET_USES),
      target: seed.target,
      uploadedBy: rng.pick(REVIEWERS),
      uploadedAt: minutesAgo(rng.int(60, 60 * 24 * 120)) - i,
      status: rng.pickWeighted<DatasetStatus>([
        ["ready", 85],
        ["processing", 10],
        ["failed", 5],
      ]),
    };
  }).sort((a, b) => b.uploadedAt - a.uploadedAt);
}

export const DATASETS: Dataset[] = generateDatasets();
