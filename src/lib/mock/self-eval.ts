import { Rng, hashString } from "./rng";
import { MODEL_VERSIONS } from "./models";
import { minutesAgo } from "./time";

export const BENCHMARK_SUITES = [
  "Reasoning-500",
  "CodeBench",
  "SafetyEval",
  "Multimodal-QA",
  "Instruction-Following",
  "Long-Context-QA",
] as const;

export type BenchmarkSuite = (typeof BENCHMARK_SUITES)[number];
export type SelfEvalStatus = "queued" | "running" | "completed" | "failed";

export interface SelfEvalRun {
  id: string;
  modelId: string;
  benchmark: BenchmarkSuite;
  status: SelfEvalStatus;
  score: number | null;
  startedAt: number;
  durationMs: number | null;
}

const PASS_THRESHOLD = 75;

function generateHistory(): SelfEvalRun[] {
  const rng = new Rng(4471);
  const evalCandidates = MODEL_VERSIONS.filter((m) => m.status !== "staged");
  const runs: SelfEvalRun[] = [];

  for (let i = 0; i < 40; i++) {
    const model = rng.pick(evalCandidates);
    const benchmark = rng.pick(BENCHMARK_SUITES);
    const failed = rng.bool(0.06);
    const jitter = (hashString(`${model.id}-${benchmark}-${i}`) % 900) / 100 - 4.5;
    const score = failed ? null : Math.max(40, Math.min(99.5, Math.round((model.benchmarkScore + jitter) * 10) / 10));
    const startedAt = minutesAgo(rng.int(30, 60 * 24 * 45));

    runs.push({
      id: rng.id("seval"),
      modelId: model.id,
      benchmark,
      status: failed ? "failed" : "completed",
      score,
      startedAt,
      durationMs: rng.int(40, 420) * 1000,
    });
  }

  return runs.sort((a, b) => b.startedAt - a.startedAt);
}

export const SELF_EVAL_HISTORY: SelfEvalRun[] = generateHistory();

/** Most recent completed run for this exact model+benchmark pairing, if any — used as the comparison baseline for a freshly queued run. */
export function getLatestScore(modelId: string, benchmark: BenchmarkSuite): number | null {
  const prior = SELF_EVAL_HISTORY.find(
    (r) => r.modelId === modelId && r.benchmark === benchmark && r.status === "completed",
  );
  return prior?.score ?? null;
}

export function passes(score: number): boolean {
  return score >= PASS_THRESHOLD;
}

export { PASS_THRESHOLD };
