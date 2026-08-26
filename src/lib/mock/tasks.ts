import { Rng } from "./rng";
import { REPOS, MODELS, type AgentKind } from "./catalog";
import { REVIEWERS } from "./people";
import { minutesAgo } from "./time";

export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type TaskStatus = "pending" | "assigned" | "in-progress" | "completed" | "failed";

export interface EngTask {
  id: string;
  title: string;
  description: string;
  repoId: string;
  agentKind: AgentKind;
  targetModel: string;
  priority: TaskPriority;
  status: TaskStatus;
  requestedBy: string;
  createdAt: number;
}

const SEED_TASKS: { kind: AgentKind; title: string; description: string }[] = [
  { kind: "Refactor", title: "Extract shared auth middleware into its own package", description: "Three services currently duplicate the same JWT-validation logic — pull it into a shared internal package." },
  { kind: "Refactor", title: "Break up the 800-line OrderService into smaller modules", description: "Split by responsibility (pricing, fulfillment, notifications) so each can be tested independently." },
  { kind: "Refactor", title: "Replace callback-based API client with async/await", description: "The legacy client predates async/await support and makes error handling inconsistent." },
  { kind: "Test-Writer", title: "Add missing test coverage for the checkout flow", description: "Checkout has no integration tests covering the discount-code edge cases." },
  { kind: "Test-Writer", title: "Write integration tests for the webhook retry logic", description: "Cover exponential backoff, max-retry exhaustion, and the dead-letter path." },
  { kind: "Test-Writer", title: "Backfill unit tests for the pricing calculator", description: "Currency rounding and tiered-discount logic are both currently untested." },
  { kind: "Bug-Fix", title: "Fix race condition in session token refresh", description: "Concurrent requests during token expiry occasionally both trigger a refresh, invalidating one." },
  { kind: "Bug-Fix", title: "Resolve memory leak in the WebSocket connection pool", description: "Closed connections aren't being evicted from the pool's internal map." },
  { kind: "Bug-Fix", title: "Patch off-by-one error in pagination cursor", description: "The last item of each page is duplicated as the first item of the next." },
  { kind: "Docs", title: "Document the new rate-limit headers for external API consumers", description: "The X-RateLimit-* headers shipped last week have no public documentation yet." },
  { kind: "Docs", title: "Write a migration guide for the v3 SDK breaking changes", description: "Cover the renamed methods and the new required auth parameter." },
  { kind: "Docs", title: "Update onboarding docs for the new environment setup flow", description: "The setup steps changed when Sandbox Playground replaced the old environment wizard." },
  { kind: "Migration", title: "Migrate legacy cron jobs to the new scheduler service", description: "Twelve remaining jobs still run on the deprecated cron host." },
  { kind: "Migration", title: "Port the notifications service from REST to gRPC", description: "Aligns it with the rest of the internal service mesh." },
  { kind: "Migration", title: "Upgrade the ORM from v4 to v5 across all services", description: "v4 reaches end of support next quarter; v5 has several breaking query-builder changes." },
  { kind: "Security", title: "Audit third-party dependencies for known CVEs", description: "Full sweep across all repos ahead of the quarterly security review." },
  { kind: "Security", title: "Rotate and re-scope overly broad service account credentials", description: "Several service accounts still hold org-wide write access from an earlier migration." },
  { kind: "Security", title: "Add rate limiting to the password reset endpoint", description: "Currently unthrottled — flagged in the last penetration test." },
  { kind: "Performance", title: "Reduce p99 latency on the search endpoint", description: "p99 has crept up 40% over the last month as the index has grown." },
  { kind: "Performance", title: "Add caching layer for frequently-read config values", description: "Config is re-fetched from the database on every request." },
  { kind: "Performance", title: "Optimize the N+1 query pattern in the dashboard API", description: "Loading a single dashboard currently issues one query per widget." },
  { kind: "Dependency", title: "Bump all packages with known security advisories", description: "Weekly dependency-audit sweep." },
  { kind: "Dependency", title: "Consolidate duplicate lodash versions across the monorepo", description: "Four different major versions currently ship in the bundle." },
  { kind: "Dependency", title: "Update to the latest major version of the HTTP client", description: "Unlocks connection pooling improvements the perf team has asked for." },
];

const STATUS_WEIGHTS: [TaskStatus, number][] = [
  ["pending", 20],
  ["assigned", 15],
  ["in-progress", 30],
  ["completed", 25],
  ["failed", 10],
];

const PRIORITY_WEIGHTS: [TaskPriority, number][] = [
  ["low", 20],
  ["medium", 40],
  ["high", 30],
  ["urgent", 10],
];

function generateTasks(): EngTask[] {
  const rng = new Rng(6231);
  return SEED_TASKS.map((seed, i) => {
    const model = rng.pick(MODELS);
    return {
      id: rng.id("task"),
      title: seed.title,
      description: seed.description,
      repoId: rng.pick(REPOS).id,
      agentKind: seed.kind,
      targetModel: `${model.provider} — ${model.name}`,
      priority: rng.pickWeighted(PRIORITY_WEIGHTS),
      status: rng.pickWeighted(STATUS_WEIGHTS),
      requestedBy: rng.pick(REVIEWERS),
      createdAt: minutesAgo(rng.int(10, 60 * 24 * 21)) - i,
    };
  }).sort((a, b) => b.createdAt - a.createdAt);
}

export const TASKS: EngTask[] = generateTasks();
