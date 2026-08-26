import { Rng } from "./rng";
import { REVIEWERS } from "./people";
import { minutesAgo } from "./time";

export type BacklogStatus = "proposed" | "in-progress" | "shipped" | "wont-fix";
export type BacklogCategory = "Latency" | "Compute Efficiency" | "Cost" | "Capability";

export interface OptimizationItem {
  id: string;
  title: string;
  description: string;
  category: BacklogCategory;
  estimatedImpact: string;
  status: BacklogStatus;
  owner: string;
  createdAt: number;
}

const SEED_ITEMS: { title: string; description: string; category: BacklogCategory; estimatedImpact: string }[] = [
  { title: "Speculative decoding for Solis Flash", description: "Draft-and-verify decoding to cut latency on the highest-volume tier.", category: "Latency", estimatedImpact: "-22% p99 latency" },
  { title: "KV-cache reuse across multi-turn sessions", description: "Avoid recomputing the prefix cache on every turn of a conversation.", category: "Compute Efficiency", estimatedImpact: "-15% GPU-hours" },
  { title: "Right-size Solis Vision serving replicas", description: "Current replica count assumes peak load 24/7; scale to actual traffic curve.", category: "Cost", estimatedImpact: "+$41K/mo savings" },
  { title: "Extend Solis Motion to 180s generation", description: "Staged in Solis Motion 1.3 — see Impact Estimator for the full compute delta.", category: "Capability", estimatedImpact: "+38% compute/request" },
  { title: "Quantize Solis Code for on-prem deployments", description: "INT8 quantization for partner on-prem installs with limited accelerator budgets.", category: "Compute Efficiency", estimatedImpact: "-30% memory footprint" },
  { title: "Batch small-request traffic on Flash tier", description: "Micro-batch sub-100-token requests instead of serving them individually.", category: "Latency", estimatedImpact: "-9% p50 latency" },
  { title: "Retire the 3.5 generation's dedicated capacity", description: "Traffic has fallen enough to fold 3.5 serving into the shared 4.1 pool.", category: "Cost", estimatedImpact: "+$18K/mo savings" },
  { title: "Prefetch context for known repeat callers", description: "Large API partners re-send similar context; cache and prefetch it.", category: "Latency", estimatedImpact: "-12% p99 latency" },
  { title: "Increase Solis Ultra max output to 128K tokens", description: "Requested by three enterprise customers for long-document generation.", category: "Capability", estimatedImpact: "+14% compute/request" },
  { title: "Move Solis Vision inference to newer accelerator generation", description: "New accelerators land 40% more throughput per watt for diffusion workloads.", category: "Compute Efficiency", estimatedImpact: "-25% cost/image" },
  { title: "Cache repeated Solis Code completions", description: "Boilerplate completions (imports, common patterns) repeat heavily across requests.", category: "Cost", estimatedImpact: "+$9K/mo savings" },
  { title: "Reduce cold-start latency for staged models", description: "Internal testers on staged models see 3-4x colder starts than production.", category: "Latency", estimatedImpact: "-40% cold-start time" },
  { title: "Extend context window to 2M tokens fleet-wide", description: "Currently only Ultra 5.0 supports 2M; evaluate extending to Pro.", category: "Capability", estimatedImpact: "+9% compute/request" },
  { title: "Consolidate duplicate embedding caches", description: "Three services independently cache the same embeddings.", category: "Compute Efficiency", estimatedImpact: "-11% storage cost" },
  { title: "Dynamic batching for Solis Motion queue", description: "Video generation requests currently process strictly FIFO with no batching.", category: "Latency", estimatedImpact: "-17% queue wait time" },
  { title: "Sunset unused regional replicas for Vision 1.0", description: "Deprecated model still holds capacity reservations in two regions.", category: "Cost", estimatedImpact: "+$6K/mo savings" },
];

const STATUS_WEIGHTS: [BacklogStatus, number][] = [
  ["proposed", 35],
  ["in-progress", 30],
  ["shipped", 25],
  ["wont-fix", 10],
];

function generateBacklog(): OptimizationItem[] {
  const rng = new Rng(5583);
  return SEED_ITEMS.map((seed, i) => ({
    id: rng.id("opt"),
    ...seed,
    status: rng.pickWeighted(STATUS_WEIGHTS),
    owner: rng.pick(REVIEWERS),
    createdAt: minutesAgo(rng.int(60, 60 * 24 * 90)) - i,
  })).sort((a, b) => b.createdAt - a.createdAt);
}

export const OPTIMIZATION_BACKLOG: OptimizationItem[] = generateBacklog();
