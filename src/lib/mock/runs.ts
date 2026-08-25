import { Rng } from "./rng";
import { AGENTS, AgentDef, REPOS } from "./catalog";
import { REVIEWERS } from "./people";
import { minutesAgo, REFERENCE_NOW } from "./time";

export type RunStatus = "queued" | "running" | "awaiting-review" | "merged" | "failed";

export interface Run {
  id: string;
  title: string;
  agentId: string;
  repoId: string;
  branch: string;
  status: RunStatus;
  startedAt: number;
  durationMs: number | null;
  costUsd: number;
  tokens: number;
  commitSha: string;
  filesChanged: number;
  linesAdded: number;
  linesRemoved: number;
  confidencePct: number | null;
  reviewer: string | null;
}

const MODULES = [
  "auth", "billing", "webhook", "dashboard", "queue", "search",
  "notifications", "onboarding", "checkout", "analytics", "settings",
  "upload", "cache", "scheduler", "reporting", "session", "rate-limiter",
];

const TITLE_TEMPLATES: Record<AgentDef["kind"], string[]> = {
  Refactor: [
    "Simplify {moduleName} state management",
    "Extract shared {moduleName} logic into a utility",
    "Reduce duplication across {moduleName} handlers",
    "Modernize the legacy {moduleName} module",
  ],
  "Test-Writer": [
    "Add missing test coverage for {moduleName}",
    "Write integration tests for the {moduleName} flow",
    "Backfill unit tests for {moduleName}",
  ],
  "Bug-Fix": [
    "Fix race condition in {moduleName}",
    "Resolve null-pointer edge case in {moduleName}",
    "Patch memory leak in the {moduleName} worker",
    "Fix off-by-one error in {moduleName} pagination",
  ],
  Docs: [
    "Document the {moduleName} API",
    "Update README for {moduleName}",
    "Write onboarding guide for {moduleName}",
  ],
  Migration: [
    "Migrate {moduleName} to the new schema",
    "Upgrade {moduleName} to async/await",
    "Port {moduleName} off the deprecated SDK",
  ],
  Security: [
    "Audit {moduleName} for injection risk",
    "Rotate hardcoded credentials in {moduleName}",
    "Patch dependency CVE in {moduleName}",
  ],
  Performance: [
    "Optimize {moduleName} query performance",
    "Reduce {moduleName} cold-start latency",
    "Cache {moduleName} responses",
  ],
  Dependency: [
    "Bump {moduleName} dependencies to latest minor",
    "Resolve peer-dependency conflict in {moduleName}",
    "Remove unused packages from {moduleName}",
  ],
};

const TERMINAL_STATUS_WEIGHTS: [RunStatus, number][] = [
  ["merged", 62],
  ["awaiting-review", 18],
  ["failed", 20],
];

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function generateRuns(count: number): Run[] {
  const rng = new Rng(7301);
  const runs: Run[] = [];

  // A small, bounded slice of runs are "live" right now — everything else
  // is a completed historical run spread across the last ~90 days. Without
  // this split, a uniformly-random status/time pairing produces nonsense
  // like a "running" run that started 80 days ago.
  const activeCount = rng.int(16, 28);

  for (let i = 0; i < count; i++) {
    const agent = rng.pick(AGENTS);
    const repo = rng.pick(REPOS);
    const moduleName = rng.pick(MODULES);
    const template = rng.pick(TITLE_TEMPLATES[agent.kind]);
    const title = template.replace("{moduleName}", moduleName);

    const isActive = i < activeCount;
    const status: RunStatus = isActive
      ? rng.pickWeighted([["running", 78], ["queued", 22]])
      : rng.pickWeighted(TERMINAL_STATUS_WEIGHTS);

    const startedMinAgo = isActive ? rng.int(1, 95) : rng.int(30, 129_600);
    const startedAt = minutesAgo(startedMinAgo);
    const isTerminal = status === "merged" || status === "failed";
    const hasConfidence = isTerminal || status === "awaiting-review";

    const durationMs = status === "queued"
      ? null
      : status === "running"
        ? Math.min(startedMinAgo, rng.int(2, 45)) * 60_000
        : rng.int(1, 68) * 60_000 + rng.int(0, 59) * 1000;

    const filesChanged = rng.int(1, 34);
    const linesAdded = rng.int(4, 620);
    const linesRemoved = rng.int(0, Math.round(linesAdded * 0.7));

    runs.push({
      id: rng.id("run"),
      title,
      agentId: agent.id,
      repoId: repo.id,
      branch: `agent/${slugify(agent.kind)}-${rng.id("").slice(1)}`,
      status,
      startedAt,
      durationMs,
      costUsd: durationMs
        ? Math.round((durationMs / 60_000) * rng.float(0.06, 0.34) * 100) / 100
        : 0,
      tokens: durationMs ? rng.int(1_200, 148_000) : 0,
      commitSha: rng.id("").slice(1),
      filesChanged,
      linesAdded,
      linesRemoved,
      confidencePct: hasConfidence ? rng.int(status === "failed" ? 38 : 71, status === "failed" ? 74 : 99) : null,
      reviewer: isTerminal && rng.bool(0.82) ? rng.pick(REVIEWERS) : null,
    });
  }

  return runs.sort((a, b) => b.startedAt - a.startedAt);
}

export const RUNS: Run[] = generateRuns(1284);

export function getRunById(id: string): Run | undefined {
  return RUNS.find((r) => r.id === id);
}

export function getAgentForRun(run: Run) {
  return AGENTS.find((a) => a.id === run.agentId)!;
}

export function getRepoForRun(run: Run) {
  return REPOS.find((r) => r.id === run.repoId)!;
}

export interface StuckRun {
  run: Run;
  elapsedMin: number;
}

/** Flags the longest-running active run — the "been idle" signal for EnsembleAI. */
export function getStuckRun(): StuckRun | null {
  const active = RUNS.filter((r) => r.status === "running" || r.status === "queued");
  if (!active.length) return null;
  const withElapsed = active
    .map((run) => ({ run, elapsedMin: Math.round((REFERENCE_NOW - run.startedAt) / 60_000) }))
    .sort((a, b) => b.elapsedMin - a.elapsedMin);
  return withElapsed[0];
}
