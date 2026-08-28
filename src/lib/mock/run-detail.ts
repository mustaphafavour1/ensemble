import { Rng, hashString } from "./rng";
import type { Run } from "./runs";
import { getAgentForRun, getRepoForRun } from "./runs";
import { stackForRepo } from "./delivery";
import type { AgentKind } from "./catalog";

const PLAN_TEMPLATES: Record<AgentKind, string[]> = {
  Refactor: [
    "Map current usages of {module} across {repo}",
    "Extract shared logic into a single utility",
    "Update call sites to the new interface",
    "Run the existing test suite to confirm no behavior change",
  ],
  "Test-Writer": [
    "Identify uncovered branches in {module}",
    "Write unit tests for the happy path and edge cases",
    "Add a regression test for the reported gap",
    "Confirm coverage increased against the baseline",
  ],
  "Bug-Fix": [
    "Reproduce the failure locally against {module}",
    "Bisect to the change that introduced it",
    "Apply a minimal, targeted fix",
    "Add a regression test covering the failure",
  ],
  Docs: [
    "Audit existing docs for {module} against current behavior",
    "Rewrite unclear sections and add missing examples",
    "Cross-link related pages",
  ],
  Migration: [
    "Snapshot the current {module} schema and call sites",
    "Write a backward-compatible shim",
    "Migrate call sites incrementally",
    "Remove the shim once every call site is migrated",
  ],
  Security: [
    "Scan {module} for the flagged vulnerability class",
    "Confirm exploitability with a minimal repro",
    "Apply the fix and add a regression test",
    "Re-scan to confirm resolution",
  ],
  Performance: [
    "Profile {module} under representative load",
    "Identify the dominant cost in the hot path",
    "Apply a targeted optimization",
    "Re-benchmark to confirm the improvement",
  ],
  Dependency: [
    "Diff the current and target versions for {module}",
    "Check the changelog for breaking changes",
    "Update the manifest and lockfile",
    "Run the full test suite to confirm compatibility",
  ],
  "Schema-Migration": [
    "Snapshot the current {module} schema in {repo}",
    "Write the forward migration and a matching rollback",
    "Backfill existing rows in batches",
    "Verify row counts and constraints post-migration",
  ],
  I18n: [
    "Scan {module} for hardcoded, untranslated strings",
    "Extract strings into locale files with stable keys",
    "Add machine-translated drafts for missing locales",
    "Flag idiom-heavy strings for human review",
  ],
  Accessibility: [
    "Run an automated audit against {module}",
    "Fix missing labels, roles, and contrast violations",
    "Verify keyboard navigation end to end",
    "Re-run the audit to confirm the fixes landed",
  ],
  Changelog: [
    "Collect merged PRs affecting {module} since the last entry",
    "Group changes into added/changed/fixed",
    "Draft the changelog entry in the project's existing voice",
  ],
  "Release-Notes": [
    "Pull the commit log for {repo} since the last tag",
    "Group changes by user-facing impact",
    "Draft release notes and flag any breaking changes",
  ],
  "Lint-Fix": [
    "Run the linter against {module} and collect violations",
    "Apply safe auto-fixes",
    "Re-run the linter to confirm a clean pass",
  ],
  "Eval-Harness": [
    "Identify the coverage gap in the {module} eval suite",
    "Write new eval cases against the target behavior",
    "Run the suite against the current and prior model versions",
    "Confirm no regression before merging",
  ],
};

const EXT_BY_LANGUAGE: Record<string, string> = {
  TypeScript: "ts",
  Python: "py",
  Go: "go",
  Rust: "rs",
  Ruby: "rb",
  Java: "java",
  Elixir: "ex",
  HCL: "tf",
};

const PATH_ROOTS: Record<string, string[]> = {
  TypeScript: ["src", "src/app", "src/lib", "src/components"],
  Python: ["app", "services", "app/api"],
  Go: ["internal", "cmd", "internal/handler"],
  Rust: ["src", "src/routes"],
  Ruby: ["app/models", "app/controllers"],
  Java: ["src/main/java/com/ensemble"],
  Elixir: ["lib"],
  HCL: ["infra"],
};

function extractModule(title: string): string {
  const match = title.match(/\b(auth|billing|webhook|dashboard|queue|search|notifications|onboarding|checkout|analytics|settings|upload|cache|scheduler|reporting|session|rate-limiter)\b/);
  return match ? match[1] : "core";
}

export interface DiffFile {
  path: string;
  additions: number;
  removals: number;
}

export interface CostBreakdown {
  inputTokens: number;
  outputTokens: number;
  inputCost: number;
  outputCost: number;
}

export interface LogLine {
  offsetSec: number;
  message: string;
}

export interface RunDetail {
  specText: string;
  planSteps: string[];
  diffFiles: DiffFile[];
  logLines: LogLine[];
  cost: CostBreakdown;
}

export function getRunDetail(run: Run): RunDetail {
  const rng = new Rng(hashString(run.id));
  const agent = getAgentForRun(run);
  const repo = getRepoForRun(run);
  const stack = stackForRepo(run.repoId);
  const moduleName = extractModule(run.title);

  const specText = `${agent.name} was asked to: ${run.title.toLowerCase()}, scoped to ${repo.name}. ${agent.scope}.`;

  const planSteps = PLAN_TEMPLATES[agent.kind].map((s) =>
    s.replace("{module}", moduleName).replace("{repo}", repo.name),
  );

  const ext = EXT_BY_LANGUAGE[stack.language] ?? "txt";
  const roots = PATH_ROOTS[stack.language] ?? ["src"];
  const suffixPool = ["helpers", "types", "utils", "handler", "test", "service", "client", "worker"];
  const fileCount = Math.max(1, Math.min(run.filesChanged, 9));
  const diffFiles: DiffFile[] = [];
  let remainingAdd = run.linesAdded;
  let remainingDel = run.linesRemoved;
  for (let i = 0; i < fileCount; i++) {
    const isLast = i === fileCount - 1;
    const add = isLast ? remainingAdd : rng.int(1, Math.max(1, Math.floor(remainingAdd / (fileCount - i))));
    const del = isLast ? remainingDel : rng.int(0, Math.max(0, Math.floor(remainingDel / (fileCount - i))));
    remainingAdd -= add;
    remainingDel -= del;
    const root = rng.pick(roots);
    // Cycle the suffix deterministically by index (rather than re-rolling it)
    // so two files can never collide on the same generated path.
    const suffix = i === 0 ? moduleName : `${moduleName}-${suffixPool[(i - 1) % suffixPool.length]}`;
    diffFiles.push({
      path: `${root}/${suffix}.${ext}`,
      additions: Math.max(0, add),
      removals: Math.max(0, del),
    });
  }

  const totalMin = run.durationMs ? Math.max(1, Math.round(run.durationMs / 60_000)) : 3;
  const logLines: LogLine[] = [
    { offsetSec: 0, message: `Starting run — agent=${agent.name} model=${agent.model.name}` },
    { offsetSec: 4, message: `Indexing ${repo.name}@${repo.defaultBranch}...` },
    { offsetSec: 12, message: `Context ready. Drafting plan (${planSteps.length} steps).` },
    { offsetSec: 28, message: "Plan approved. Beginning execution." },
  ];
  planSteps.forEach((step, i) => {
    logLines.push({
      offsetSec: 40 + i * Math.round((totalMin * 60 - 60) / Math.max(1, planSteps.length)),
      message: `[step ${i + 1}/${planSteps.length}] ${step}`,
    });
  });

  if (run.status === "merged" || run.status === "failed" || run.status === "awaiting-review") {
    logLines.push({
      offsetSec: totalMin * 60 - 8,
      message: `Wrote diff — ${diffFiles.length} files, +${run.linesAdded}/-${run.linesRemoved}`,
    });
  }
  if (run.status === "merged") {
    logLines.push({
      offsetSec: totalMin * 60,
      message: run.reviewer
        ? `Opened PR against ${repo.defaultBranch}. Merged by ${run.reviewer}.`
        : `Opened PR against ${repo.defaultBranch}. Auto-merged (below policy threshold).`,
    });
  } else if (run.status === "failed") {
    logLines.push({
      offsetSec: totalMin * 60,
      message: "Run failed — test suite did not pass after 2 retries. Flagged for review.",
    });
  } else if (run.status === "awaiting-review") {
    logLines.push({
      offsetSec: totalMin * 60,
      message: "Diff ready. Waiting on human review before merge.",
    });
  } else if (run.status === "running") {
    logLines.push({ offsetSec: totalMin * 60, message: "..." });
  }

  const outputTokens = Math.round(run.tokens * 0.35);
  const inputTokens = run.tokens - outputTokens;
  const outputCost = Math.round(run.costUsd * 0.62 * 100) / 100;
  const inputCost = Math.round((run.costUsd - outputCost) * 100) / 100;

  return {
    specText,
    planSteps,
    diffFiles,
    logLines,
    cost: { inputTokens, outputTokens, inputCost, outputCost },
  };
}
