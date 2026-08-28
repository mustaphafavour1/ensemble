import { Rng } from "./rng";
import { AGENTS, REPOS } from "./catalog";
import { RUNS } from "./runs";
import { REVIEWERS } from "./people";
import { minutesAgo } from "./time";

export type SpecStatus = "proposed" | "approved" | "in-progress" | "needs-changes";

export interface Spec {
  id: string;
  title: string;
  summary: string;
  repoId: string;
  agentId: string;
  status: SpecStatus;
  riskLevel: "low" | "medium" | "high";
  createdAt: number;
  qualityScore: number;
  qualityNote: string;
}

const SPEC_TOPICS = [
  { title: "Add tiered rate limiting to the public API", summary: "Introduce a token-bucket limiter keyed by API key, with 429 responses carrying Retry-After headers." },
  { title: "Migrate session storage to Redis cluster", summary: "Replace the in-memory session store with a Redis-backed one behind the existing session interface." },
  { title: "Backfill test coverage for the checkout flow", summary: "Add integration tests covering discount codes, partial refunds, and failed-payment retries." },
  { title: "Split the monolithic worker into per-queue consumers", summary: "Break billing-worker into independently deployable consumers, one per Temporal task queue." },
  { title: "Rotate and vault all third-party API credentials", summary: "Move hardcoded provider keys into the secrets manager and add automatic 90-day rotation." },
  { title: "Add optimistic locking to the inventory service", summary: "Prevent lost updates under concurrent writes using a version column and conditional writes." },
  { title: "Deprecate the legacy v1 webhook format", summary: "Add a v2 payload, dual-write for one release, then remove v1 consumers and docs." },
  { title: "Reduce cold-start latency on the inference endpoint", summary: "Pre-warm model weights and switch to a smaller quantized checkpoint for the hot path." },
  { title: "Introduce feature flags for the new onboarding flow", summary: "Gate the redesigned onboarding behind a flag, targetable by org and rollout percentage." },
  { title: "Harden the auth service against timing attacks", summary: "Use constant-time comparison for token verification and add jitter to failed-login responses." },
  { title: "Consolidate duplicate GraphQL resolvers", summary: "Merge three near-identical resolvers in web-dashboard into one parameterized resolver." },
  { title: "Add automatic rollback on failed health checks", summary: "Wire deployment health checks to trigger an automatic rollback after three consecutive failures." },
  { title: "Normalize currency handling across billing-worker", summary: "Move all money math to integer minor units and remove floating-point rounding in invoices." },
  { title: "Add structured logging to the data pipeline", summary: "Replace print-based logging in data-pipeline DAGs with structured, queryable log events." },
  { title: "Upgrade mobile-app to the new navigation library", summary: "Replace the deprecated navigation stack with typed routes across all mobile-app screens." },
  { title: "Add a dead-letter queue for failed webhook deliveries", summary: "Capture undeliverable webhook events for replay instead of silently dropping them." },
  { title: "Right-size ephemeral environment resource limits", summary: "Lower default CPU/memory requests for preview environments based on 30-day usage data." },
  { title: "Add row-level security to the analytics warehouse", summary: "Scope analytics queries to the requesting org using Postgres row-level security policies." },
  { title: "Extract the design system's color tokens to CSS variables", summary: "Move hardcoded hex values in design-system to the shared token file for easier theming." },
  { title: "Add contract tests between api-gateway and payments-service", summary: "Introduce Pact-style contract tests so breaking API changes fail CI before merge." },
  { title: "Batch outbound notification sends", summary: "Coalesce per-event notification sends into periodic batches to cut provider API costs." },
  { title: "Add a circuit breaker around the ML inference client", summary: "Fail fast and serve cached predictions when ml-inference latency exceeds threshold." },
  { title: "Move session tokens to short-lived, rotating credentials", summary: "Cut session token lifetime and add silent rotation so a leaked token expires fast." },
  { title: "Add a canary stage before full production rollout", summary: "Route a small percentage of production traffic to new deploys before promoting them." },
];

const QUALITY_NOTES_LOW = [
  "Under-specified — no rollback plan or affected consumers listed.",
  "Missing acceptance criteria; scope could expand mid-run.",
  "Doesn't name a blast radius. Recommend narrowing file scope first.",
  "No mention of migration strategy for existing data.",
];
const QUALITY_NOTES_MID = [
  "Reasonably scoped, but success criteria are informal.",
  "Clear intent; would benefit from an explicit test plan.",
  "Good scope, missing a note on backward compatibility.",
];
const QUALITY_NOTES_HIGH = [
  "Well-scoped — clear acceptance criteria and blast radius.",
  "Specific file boundaries and a rollback path are both stated.",
  "Strong spec — includes edge cases and a verification step.",
];

const STATUS_TARGETS: [SpecStatus, number][] = [
  ["proposed", 7],
  ["approved", 6],
  ["in-progress", 6],
  ["needs-changes", 5],
];

function generateSpecs(): Spec[] {
  const rng = new Rng(2216);
  const topics = rng.sample(SPEC_TOPICS, SPEC_TOPICS.length);
  const specs: Spec[] = [];
  let topicIdx = 0;

  for (const [status, target] of STATUS_TARGETS) {
    for (let i = 0; i < target; i++) {
      const topic = topics[topicIdx % topics.length];
      topicIdx++;
      const qualityScore = rng.int(38, 98);
      const qualityNote =
        qualityScore < 60
          ? rng.pick(QUALITY_NOTES_LOW)
          : qualityScore < 82
            ? rng.pick(QUALITY_NOTES_MID)
            : rng.pick(QUALITY_NOTES_HIGH);

      specs.push({
        id: rng.id("spec"),
        title: topic.title,
        summary: topic.summary,
        repoId: rng.pick(REPOS).id,
        agentId: rng.pick(AGENTS).id,
        status,
        riskLevel: rng.pickWeighted([["low", 50], ["medium", 35], ["high", 15]]),
        createdAt: minutesAgo(rng.int(30, 21_600)),
        qualityScore,
        qualityNote,
      });
    }
  }

  return specs.sort((a, b) => b.createdAt - a.createdAt);
}

export const SPECS: Spec[] = generateSpecs();

export type ProvenanceEventType =
  | "commit"
  | "approval"
  | "review"
  | "deploy"
  | "merged"
  | "rolled-back"
  | "flagged-for-review"
  | "test-failed"
  | "escalated";

export interface ProvenanceEvent {
  id: string;
  type: ProvenanceEventType;
  timestamp: number;
  agentId: string;
  repoId: string;
  commitSha: string | null;
  reviewer: string | null;
  confidencePct: number | null;
  runId: string | null;
  environment: string | null;
}

const EVENT_TYPE_WEIGHTS: [ProvenanceEventType, number][] = [
  ["commit", 30],
  ["merged", 14],
  ["approval", 14],
  ["review", 10],
  ["deploy", 12],
  ["rolled-back", 4],
  ["flagged-for-review", 6],
  ["test-failed", 7],
  ["escalated", 3],
];

const ENVIRONMENTS = ["production", "staging", "preview"];

// Recency tiers, weighted so the feed reads as genuinely live: a large
// share of events land in the last few hours ("just now" / "Xm ago"),
// with a long tail stretching back three weeks for date-grouped history.
const AGE_TIERS: [[number, number], number][] = [
  [[0, 15], 12],
  [[15, 60], 10],
  [[60, 360], 13],
  [[360, 1440], 15],
  [[1440, 2880], 15],
  [[2880, 30_240], 35],
];

function generateProvenance(count = 500): ProvenanceEvent[] {
  const rng = new Rng(6604);
  const completedRuns = RUNS.filter((r) => r.status === "merged" || r.status === "failed");
  const events: ProvenanceEvent[] = [];

  for (let i = 0; i < count; i++) {
    const type = rng.pickWeighted(EVENT_TYPE_WEIGHTS);
    const agent = rng.pick(AGENTS);
    const repo = rng.pick(REPOS);
    const run = completedRuns.length ? rng.pick(completedRuns) : null;
    const [minAge, maxAge] = rng.pickWeighted(AGE_TIERS);
    const timestamp = minutesAgo(rng.int(minAge, maxAge));
    const commitSha = run?.commitSha ?? rng.id("").slice(1);
    const confidencePct = run?.confidencePct ?? rng.int(72, 98);

    const base = {
      id: rng.id("prov"),
      type,
      timestamp,
      agentId: agent.id,
      repoId: run?.repoId ?? repo.id,
      runId: run?.id ?? null,
    };

    switch (type) {
      case "commit":
        events.push({ ...base, commitSha, reviewer: null, confidencePct, environment: null });
        break;
      case "merged":
        events.push({ ...base, commitSha, reviewer: null, confidencePct, environment: null });
        break;
      case "approval":
        events.push({ ...base, commitSha, reviewer: rng.pick(REVIEWERS), confidencePct, environment: null });
        break;
      case "review":
        events.push({ ...base, commitSha, reviewer: rng.pick(REVIEWERS), confidencePct, environment: null });
        break;
      case "deploy":
        events.push({ ...base, commitSha, reviewer: null, confidencePct: null, environment: rng.pick(ENVIRONMENTS) });
        break;
      case "rolled-back":
        events.push({ ...base, commitSha, reviewer: null, confidencePct: null, environment: rng.pick(ENVIRONMENTS) });
        break;
      case "flagged-for-review":
        events.push({ ...base, commitSha: null, reviewer: rng.pick(REVIEWERS), confidencePct: null, environment: null });
        break;
      case "test-failed":
        events.push({ ...base, commitSha, reviewer: null, confidencePct: null, environment: null });
        break;
      case "escalated":
        events.push({ ...base, commitSha: null, reviewer: rng.pick(REVIEWERS), confidencePct: null, environment: null });
        break;
    }
  }

  return events.sort((a, b) => b.timestamp - a.timestamp);
}

export const PROVENANCE: ProvenanceEvent[] = generateProvenance();
