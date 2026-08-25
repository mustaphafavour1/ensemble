import { Rng } from "./rng";
import { REPOS, STACKS } from "./catalog";
import { RUNS } from "./runs";
import { minutesAgo } from "./time";

export type DeploymentStatus = "success" | "failed" | "in-progress" | "rolled-back";

export interface Deployment {
  id: string;
  repoId: string;
  environment: string;
  status: DeploymentStatus;
  commitSha: string;
  durationMs: number;
  deployedAt: number;
  runId: string | null;
}

const ENVIRONMENT_NAMES = ["production", "staging", "preview"];

const DEPLOY_STATUS_WEIGHTS: [DeploymentStatus, number][] = [
  ["success", 78],
  ["failed", 9],
  ["in-progress", 5],
  ["rolled-back", 8],
];

function generateDeployments(count: number): Deployment[] {
  const rng = new Rng(4519);
  const mergedRuns = RUNS.filter((r) => r.status === "merged");
  const deployments: Deployment[] = [];

  for (let i = 0; i < count; i++) {
    const useRun = mergedRuns.length > 0 && rng.bool(0.7);
    const run = useRun ? rng.pick(mergedRuns) : null;
    const repo = run ? REPOS.find((r) => r.id === run.repoId)! : rng.pick(REPOS);
    const deployedAt = run ? run.startedAt + (run.durationMs ?? 0) + rng.int(1, 20) * 60_000 : minutesAgo(rng.int(5, 129_600));

    deployments.push({
      id: rng.id("dep"),
      repoId: repo.id,
      environment: rng.pickWeighted([
        [ENVIRONMENT_NAMES[0], 45],
        [ENVIRONMENT_NAMES[1], 35],
        [ENVIRONMENT_NAMES[2], 20],
      ]),
      status: rng.pickWeighted(DEPLOY_STATUS_WEIGHTS),
      commitSha: run?.commitSha ?? rng.id("").slice(1),
      durationMs: rng.int(25, 340) * 1000,
      deployedAt,
      runId: run?.id ?? null,
    });
  }

  return deployments.sort((a, b) => b.deployedAt - a.deployedAt);
}

export const DEPLOYMENTS: Deployment[] = generateDeployments(618);

export type EnvironmentStatus = "running" | "provisioning" | "idle" | "expired";

export interface Environment {
  id: string;
  name: string;
  repoId: string;
  status: EnvironmentStatus;
  cpuPct: number;
  memPct: number;
  branch: string;
  linkedRunId: string | null;
  persistent: boolean;
  expiresAt: number | null;
  createdAt: number;
}

const ENV_STATUS_WEIGHTS: [EnvironmentStatus, number][] = [
  ["running", 55],
  ["idle", 20],
  ["provisioning", 8],
  ["expired", 17],
];

function generateEnvironments(count: number): Environment[] {
  const rng = new Rng(8862);
  const environments: Environment[] = [];

  const persistentCount = Math.min(count, REPOS.length * 2);
  for (let i = 0; i < persistentCount; i++) {
    const repo = REPOS[i % REPOS.length];
    const kind = i < REPOS.length ? "production" : "staging";
    environments.push({
      id: rng.id("env"),
      name: `${repo.name}-${kind}`,
      repoId: repo.id,
      status: rng.bool(0.94) ? "running" : "idle",
      cpuPct: rng.int(8, 74),
      memPct: rng.int(15, 82),
      branch: repo.defaultBranch,
      linkedRunId: null,
      persistent: true,
      expiresAt: null,
      createdAt: minutesAgo(rng.int(4_000, 200_000)),
    });
  }

  const ephemeralRuns = rng.sample(RUNS, count - persistentCount);
  for (const run of ephemeralRuns) {
    const repo = REPOS.find((r) => r.id === run.repoId)!;
    const status = rng.pickWeighted(ENV_STATUS_WEIGHTS);
    const createdAt = run.startedAt;
    const ttlMin = rng.int(60, 4320);
    environments.push({
      id: rng.id("env"),
      name: `pr-${rng.int(1000, 9999)}-${repo.name}`,
      repoId: repo.id,
      status,
      cpuPct: status === "expired" ? 0 : rng.int(3, 68),
      memPct: status === "expired" ? 0 : rng.int(6, 71),
      branch: run.branch,
      linkedRunId: run.id,
      persistent: false,
      expiresAt: createdAt + ttlMin * 60_000,
      createdAt,
    });
  }

  return environments.sort((a, b) => b.createdAt - a.createdAt);
}

export const ENVIRONMENTS: Environment[] = generateEnvironments(27);

export function stackForRepo(repoId: string) {
  const repo = REPOS.find((r) => r.id === repoId)!;
  return STACKS[repo.stackId];
}
