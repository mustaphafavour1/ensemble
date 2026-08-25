import { Rng } from "./rng";
import { AGENTS, REPOS } from "./catalog";
import { RUNS } from "./runs";
import { DEPLOYMENTS } from "./delivery";
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

export type ProvenanceEventType = "commit" | "approval" | "review" | "deploy";

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

function generateProvenance(): ProvenanceEvent[] {
  const rng = new Rng(6604);
  const events: ProvenanceEvent[] = [];

  const runSample = rng.sample(
    RUNS.filter((r) => r.status === "merged" || r.status === "failed"),
    230,
  );

  for (const run of runSample) {
    events.push({
      id: rng.id("prov"),
      type: "commit",
      timestamp: run.startedAt + (run.durationMs ?? 0),
      agentId: run.agentId,
      repoId: run.repoId,
      commitSha: run.commitSha,
      reviewer: null,
      confidencePct: run.confidencePct,
      runId: run.id,
      environment: null,
    });

    if (run.reviewer) {
      events.push({
        id: rng.id("prov"),
        type: run.status === "merged" ? "approval" : "review",
        timestamp: run.startedAt + (run.durationMs ?? 0) + rng.int(2, 240) * 60_000,
        agentId: run.agentId,
        repoId: run.repoId,
        commitSha: run.commitSha,
        reviewer: run.reviewer,
        confidencePct: run.confidencePct,
        runId: run.id,
        environment: null,
      });
    }
  }

  const deploySample = rng.sample(DEPLOYMENTS.filter((d) => d.status === "success" && d.runId), 90);
  for (const deploy of deploySample) {
    const run = RUNS.find((r) => r.id === deploy.runId);
    if (!run) continue;
    events.push({
      id: rng.id("prov"),
      type: "deploy",
      timestamp: deploy.deployedAt,
      agentId: run.agentId,
      repoId: deploy.repoId,
      commitSha: deploy.commitSha,
      reviewer: null,
      confidencePct: null,
      runId: run.id,
      environment: deploy.environment,
    });
  }

  return events.sort((a, b) => b.timestamp - a.timestamp);
}

export const PROVENANCE: ProvenanceEvent[] = generateProvenance();
