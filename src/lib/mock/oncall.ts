import { Rng } from "./rng";
import { REVIEWERS } from "./people";
import { INCIDENTS, type Incident } from "./incidents";
import { REFERENCE_NOW, daysAgo } from "./time";

export const ON_CALL_AGENT_NAME = "On-Call Agent";

// ---------------------------------------------------------------------------
// Investigation thread
// ---------------------------------------------------------------------------

export type SourceKind = "metrics" | "logs" | "tracker" | "infra" | "vcs" | "channel";

export const SOURCE_LABELS: Record<SourceKind, string> = {
  metrics: "Metrics & observability",
  logs: "Logs",
  tracker: "Incident tracker",
  infra: "Infrastructure & cluster state",
  vcs: "Code & version control",
  channel: "Incident channel",
};

export interface ResourceChip {
  system: string;
  scope: string;
}

export interface SourceFinding {
  kind: SourceKind;
  label: string;
  chip: ResourceChip;
  finding: string;
}

export type ThreadRole = "agent" | "human";

export interface ThreadMessage {
  id: string;
  role: ThreadRole;
  author: string;
  timestamp: number;
  body: string;
  chips?: ResourceChip[];
  reaction?: { emoji: string; count: number };
}

export type ResolutionState = "auto-resolved" | "awaiting-approval" | "approved";

export interface Resolution {
  state: ResolutionState;
  action: string;
  approver?: string;
  approvedAt?: number;
}

export interface Investigation {
  incidentId: string;
  sources: SourceFinding[];
  thread: ThreadMessage[];
  resolution: Resolution | null;
  hasLikelyCause: boolean;
}

type Category = "shadow" | "flaky" | "flag" | "code" | "infra" | "scale" | "data" | "generic";

function classify(incident: Incident): Category {
  const t = incident.title.toLowerCase();
  if (/shadow|canary/.test(t)) return "shadow";
  if (/flaky/.test(t)) return "flaky";
  if (/flag|config|rollout/.test(t)) return "flag";
  if (/quality|regression|bug|crash|memory leak|oom/.test(t)) return "code";
  if (/data center|network|power|cooling|switch|thermal/.test(t)) return "infra";
  if (/backlog|queue|traffic spike|backup|delay/.test(t)) return "scale";
  if (/schema|stale|sync|drift|backfill|double-charged/.test(t)) return "data";
  return "generic";
}

const CATEGORY_ROOT_CAUSE: Record<Category, string[]> = {
  shadow: ["a canary that diverged from shadow traffic rather than a real regression"],
  flaky: ["test flakiness masquerading as a real failure"],
  flag: [
    "a feature-flag rollout, not a code regression",
    "a rollout that ramped faster than anyone could watch it",
  ],
  code: [
    "a bad config change that shipped without enough test coverage",
    "a change that passed every health check but was still wrong",
    "a default that got flipped and nobody noticed until it mattered",
  ],
  infra: [
    "a hardware or infrastructure fault",
    "a single point of failure nobody had flagged before",
  ],
  scale: [
    "under-provisioned capacity for the load",
    "a consumer that couldn't keep pace with a sudden spike",
  ],
  data: [
    "a schema or data change with an unexpected downstream effect",
    "a data shape change that broke a consumer nobody remembered existed",
  ],
  generic: [
    "a combination of smaller factors that took some digging to isolate",
    "nothing dramatic — just a slow accumulation of small drift",
  ],
};

const CONCLUSION_TEMPLATES: Record<Category, (sys: string) => string> = {
  shadow: (s) => `My read: the canary for ${s} is diverging from shadow traffic rather than a real regression.`,
  flaky: (s) => `My read: this is test flakiness in ${s}, not a real behavior change.`,
  flag: () => "My read: the rollout is the cause, not a code regression.",
  code: (s) => `My read: the config change degraded ${s} directly.`,
  infra: () => "My read: this is a hardware or infrastructure fault, not a software issue.",
  scale: (s) => `My read: ${s} just needs more headroom, not a code fix.`,
  data: () => "My read: the schema or data change is the root cause.",
  generic: () => "Still narrowing it down, but nothing points to a code regression yet.",
};

const RESOLUTION_TEMPLATES: Record<Category, { action: (sys: string) => string; state: ResolutionState }[]> = {
  shadow: [{ action: (s) => `Paused the canary and rolled back shadow traffic for ${s}`, state: "auto-resolved" }],
  flaky: [{ action: (s) => `Quarantined the flaky suite and reopened the release train for ${s}`, state: "auto-resolved" }],
  flag: [
    { action: (s) => `Reverted the feature flag behind the ${s} rollout`, state: "auto-resolved" },
    { action: (s) => `Rolled back the config change on ${s}`, state: "auto-resolved" },
  ],
  code: [
    { action: (s) => `Opened a fix PR for ${s}`, state: "approved" },
    { action: (s) => `Opened a fix PR for ${s} and requested review`, state: "awaiting-approval" },
  ],
  infra: [
    { action: (s) => `Failed ${s} over to its standby path`, state: "auto-resolved" },
    { action: (s) => `Power-cycled the affected ${s} hardware`, state: "auto-resolved" },
  ],
  scale: [{ action: (s) => `Scaled up ${s} to clear the backlog`, state: "auto-resolved" }],
  data: [
    { action: (s) => `Opened a fix PR for the ${s} migration`, state: "awaiting-approval" },
    { action: (s) => `Reprocessed the affected ${s} batch`, state: "auto-resolved" },
  ],
  generic: [
    { action: (s) => `Restarted the affected ${s} instances`, state: "auto-resolved" },
    { action: (s) => `Rolled back ${s} to the previous deploy`, state: "auto-resolved" },
  ],
};

function buildFindings(incident: Incident, rng: Rng): SourceFinding[] {
  const sys = incident.affectedSystems[0];
  const errBefore = Math.round(rng.float(0.1, 0.5) * 10) / 10;
  const mult = incident.severity === "critical" ? rng.int(8, 20) : incident.severity === "major" ? rng.int(4, 9) : rng.int(2, 4);
  const errAfter = Math.round(errBefore * mult * 10) / 10;

  return [
    {
      kind: "metrics",
      label: SOURCE_LABELS.metrics,
      chip: { system: "Grafana", scope: `${sys}-ops` },
      finding: `Error rate on ${sys} climbed from a ${errBefore}% baseline to ${errAfter}% right before the page fired.`,
    },
    {
      kind: "logs",
      label: SOURCE_LABELS.logs,
      chip: { system: "Logs", scope: sys },
      finding: rng.pick([
        `Logs show a cluster of ${rng.pick(["timeout", "connection-reset", "5xx", "null-reference"])} errors from the same code path.`,
        `Log volume for ${sys} spiked ${rng.int(3, 12)}x with one repeating error signature.`,
      ]),
    },
    {
      kind: "tracker",
      label: SOURCE_LABELS.tracker,
      chip: { system: "Linear", scope: `INC-${rng.int(1000, 9999)}` },
      finding: rng.pick([
        "No open tickets reference this failure mode — treating it as new.",
        "One related ticket from a past quarter with a similar symptom, already closed.",
      ]),
    },
    {
      kind: "infra",
      label: SOURCE_LABELS.infra,
      chip: { system: "Kubernetes", scope: `${sys}-cluster` },
      finding: rng.pick([
        "Pod restarts and resource usage look nominal — not a capacity issue.",
        `${rng.int(2, 6)} pods restarted in the same window, consistent with a rollout.`,
      ]),
    },
    {
      kind: "vcs",
      label: SOURCE_LABELS.vcs,
      chip: { system: "GitHub", scope: sys },
      finding: rng.pick([
        `A deploy landed ${rng.int(2, 30)} minutes before the first error — timing lines up.`,
        "No deploys in the preceding two hours; ruling out a release-related cause.",
      ]),
    },
    {
      kind: "channel",
      label: SOURCE_LABELS.channel,
      chip: { system: "Slack", scope: `#incident-${incident.id.replace("inc_", "")}` },
      finding: rng.pick([
        "Two on-call engineers reported the same symptom within a minute of each other.",
        "First flagged by a customer-facing teammate before the automated alert fired.",
      ]),
    },
  ];
}

function buildResolution(incident: Incident, category: Category, rng: Rng): Resolution | null {
  const pool = RESOLUTION_TEMPLATES[category];
  const tmpl = rng.pick(pool);
  const sys = incident.affectedSystems[0];
  const action = tmpl.action(sys);

  if (incident.status !== "resolved") {
    if (tmpl.state === "auto-resolved") {
      return rng.bool(0.55) ? { state: "auto-resolved", action } : null;
    }
    return rng.bool(0.5) ? { state: "awaiting-approval", action } : null;
  }

  if (tmpl.state === "approved") {
    return {
      state: "approved",
      action,
      approver: rng.pick(REVIEWERS),
      approvedAt: incident.resolvedAt! - rng.int(5, 40) * 60_000,
    };
  }
  return { state: tmpl.state, action };
}

function buildInvestigation(incident: Incident, rng: Rng): Investigation {
  const sources = buildFindings(incident, rng);
  const detectMin = rng.int(2, 9);
  const likely = incident.status === "resolved" ? true : rng.bool(0.75);
  const category = classify(incident);
  const sys = incident.affectedSystems[0];

  const hypothesis: ThreadMessage = likely
    ? {
        id: `${incident.id}-msg-0`,
        role: "agent",
        author: ON_CALL_AGENT_NAME,
        timestamp: incident.startedAt + detectMin * 60_000,
        body: `${detectMin} minutes after this opened: ${sources[0].finding} ${sources[4].finding} ${CONCLUSION_TEMPLATES[category](sys)}`,
        chips: [sources[0].chip, sources[4].chip],
        reaction: rng.bool(0.4) ? { emoji: "👍", count: rng.int(1, 3) } : undefined,
      }
    : {
        id: `${incident.id}-msg-0`,
        role: "agent",
        author: ON_CALL_AGENT_NAME,
        timestamp: incident.startedAt + detectMin * 60_000,
        body: `${detectMin} minutes in — nothing conclusive yet. ${sources[0].finding} ${sources[1].finding} Still ruling out causes across the other sources before proposing anything.`,
        chips: [sources[0].chip, sources[1].chip],
      };

  return {
    incidentId: incident.id,
    sources,
    thread: [hypothesis],
    resolution: buildResolution(incident, category, rng),
    hasLikelyCause: likely,
  };
}

function findIncident(titleIncludes: string): Incident {
  const found = INCIDENTS.find((i) => i.title.includes(titleIncludes));
  if (!found) throw new Error(`Seed incident not found: ${titleIncludes}`);
  return found;
}

function buildPaymentsShowcase(incident: Incident): Investigation {
  const sources: SourceFinding[] = [
    { kind: "metrics", label: SOURCE_LABELS.metrics, chip: { system: "Grafana", scope: "checkout-errors" }, finding: "Checkout error rate jumped from a 0.3% baseline to 4.8% starting at 11:52 AM; latency was unaffected." },
    { kind: "logs", label: SOURCE_LABELS.logs, chip: { system: "Logs", scope: "payments-service" }, finding: "Failures are almost entirely `PaymentIntentValidationError` on the new express-checkout path." },
    { kind: "tracker", label: SOURCE_LABELS.tracker, chip: { system: "Linear", scope: "INC-4471" }, finding: "No prior tickets for this error class — first occurrence." },
    { kind: "infra", label: SOURCE_LABELS.infra, chip: { system: "Kubernetes", scope: "payments-service-cluster" }, finding: "Pod count and resource usage are flat — not a capacity or infra issue." },
    { kind: "vcs", label: SOURCE_LABELS.vcs, chip: { system: "GitHub", scope: "feature-flags-service" }, finding: "The `new-checkout-flow` flag ramped from 10% to 100% at 11:47 AM, five minutes before errors began." },
    { kind: "channel", label: SOURCE_LABELS.channel, chip: { system: "Slack", scope: "#incident-4471" }, finding: "Two customer-support tickets referencing failed checkouts came in within a minute of each other." },
  ];

  const t0 = incident.startedAt;
  const resolvedAt = incident.resolvedAt!;
  const thread: ThreadMessage[] = [
    {
      id: `${incident.id}-msg-0`,
      role: "agent",
      author: ON_CALL_AGENT_NAME,
      timestamp: t0 + 4 * 60_000,
      body: "4 minutes in — here's what I've got. Checkout error rate jumped from a 0.3% baseline to 4.8% starting at 11:52 AM. The `new-checkout-flow` flag ramped from 10% to 100% at 11:47 AM — five minutes before errors began — and the failures are almost entirely `PaymentIntentValidationError` on the express-checkout path that only exists behind that flag. My read: the flag rollout is the cause, not a code regression. Proposing a revert.",
      chips: [
        { system: "Grafana", scope: "checkout-errors" },
        { system: "GitHub", scope: "feature-flags-service" },
      ],
      reaction: { emoji: "👍", count: 2 },
    },
    {
      id: `${incident.id}-msg-1`,
      role: "human",
      author: "Priya Nair",
      timestamp: t0 + 51 * 60_000,
      body: "we also shipped a schema change around noon, could that be it instead?",
    },
    {
      id: `${incident.id}-msg-2`,
      role: "agent",
      author: ON_CALL_AGENT_NAME,
      timestamp: t0 + 54 * 60_000,
      body: "Good challenge — checked. The schema change (an additive, nullable `express_checkout_id` column) deployed at 12:03 PM, eleven minutes after errors had already started at 11:52 AM, and nothing reads or writes that column yet. The error onset lines up with the flag ramp, not the migration. Still confident it's the flag.",
      chips: [
        { system: "GitHub", scope: "payments-service" },
        { system: "Grafana", scope: "checkout-errors" },
      ],
      reaction: { emoji: "💯", count: 1 },
    },
    {
      id: `${incident.id}-msg-3`,
      role: "human",
      author: "Priya Nair",
      timestamp: resolvedAt + 118 * 60_000,
      body: "what's the error rate looked like since the fix?",
    },
    {
      id: `${incident.id}-msg-4`,
      role: "agent",
      author: ON_CALL_AGENT_NAME,
      timestamp: resolvedAt + 121 * 60_000,
      body: "Dropped from 4.8% to 0.3% shortly after the revert and has held at 0.2–0.4% since — right at baseline, no recurrence in the last 2 hours.",
      chips: [{ system: "Grafana", scope: "checkout-errors" }],
    },
  ];

  return {
    incidentId: incident.id,
    sources,
    thread,
    resolution: { state: "auto-resolved", action: "Reverted the feature flag `new-checkout-flow`" },
    hasLikelyCause: true,
  };
}

function buildCodeQualityShowcase(incident: Incident): Investigation {
  const sources: SourceFinding[] = [
    { kind: "metrics", label: SOURCE_LABELS.metrics, chip: { system: "Grafana", scope: "eval-scores" }, finding: "Rolling eval score for Solis Code 2.0 dropped from 87.3 to 79.1 over six hours, with no error-rate change." },
    { kind: "logs", label: SOURCE_LABELS.logs, chip: { system: "Logs", scope: "core-inference" }, finding: "No new error signatures — every request is still completing successfully." },
    { kind: "tracker", label: SOURCE_LABELS.tracker, chip: { system: "Linear", scope: "INC-3390" }, finding: "No open tickets for a quality regression on this model version." },
    { kind: "infra", label: SOURCE_LABELS.infra, chip: { system: "Kubernetes", scope: "core-inference-cluster" }, finding: "Latency and resource usage are unchanged — rules out a capacity-driven quality tradeoff." },
    { kind: "vcs", label: SOURCE_LABELS.vcs, chip: { system: "GitHub", scope: "core-inference" }, finding: "A config rollout changed the default sampling temperature 20 minutes before scores started dropping." },
    { kind: "channel", label: SOURCE_LABELS.channel, chip: { system: "Slack", scope: "#incident-3390" }, finding: "First flagged by the eval pipeline's own daily-run alert, not by a user report." },
  ];

  const t0 = incident.startedAt;
  const thread: ThreadMessage[] = [
    {
      id: `${incident.id}-msg-0`,
      role: "agent",
      author: ON_CALL_AGENT_NAME,
      timestamp: t0 + 7 * 60_000,
      body: "No errors and no alerts here — this only showed up because the eval suite caught it. Rolling eval score for Solis Code 2.0 dropped from 87.3 to 79.1 over six hours. A config rollout changed the default sampling temperature about 20 minutes before scores started dropping, and nothing else in metrics, logs, or infra moved. My read: the config change degraded output quality directly. Opening a revert PR for review rather than auto-reverting, since this touches model-serving defaults.",
      chips: [
        { system: "Grafana", scope: "eval-scores" },
        { system: "GitHub", scope: "core-inference" },
      ],
      reaction: { emoji: "👍", count: 3 },
    },
  ];

  return {
    incidentId: incident.id,
    sources,
    thread,
    resolution: {
      state: "approved",
      action: "Opened PR #482 to revert the sampling-temperature default",
      approver: "Marcus Chen",
      approvedAt: incident.resolvedAt! - 12 * 60_000,
    },
    hasLikelyCause: true,
  };
}

function generateInvestigations(): Record<string, Investigation> {
  const rng = new Rng(7823);
  const map: Record<string, Investigation> = {};
  for (const incident of INCIDENTS) {
    map[incident.id] = buildInvestigation(incident, rng);
  }
  const payments = findIncident("Checkout error rate spike on payments-service");
  const codeQuality = findIncident("Solis Code 2.0 degraded completion quality after config rollout");
  map[payments.id] = buildPaymentsShowcase(payments);
  map[codeQuality.id] = buildCodeQualityShowcase(codeQuality);
  return map;
}

const INVESTIGATIONS = generateInvestigations();

export function getInvestigation(incidentId: string): Investigation | undefined {
  return INVESTIGATIONS[incidentId];
}

// ---------------------------------------------------------------------------
// Lessons learned
// ---------------------------------------------------------------------------

export interface LessonLearned {
  id: string;
  incidentId: string;
  title: string;
  timestamp: number;
  whatHappened: string;
  rootCause: string;
  fix: string;
  gotcha: string;
  promotedToPlaybookId: string | null;
}

const WHAT_HAPPENED_POOL = (sys: string) => [
  `${sys} started throwing errors and it took a minute to separate signal from noise.`,
  `This one crept up on ${sys} — small at first, then not.`,
  `A routine change touching ${sys} turned into an unplanned stretch of the day.`,
];

const GOTCHA_POOL = (sys: string, category: Category) => [
  `Worth remembering: ${sys}'s default dashboards don't split this failure mode out, so it's easy to miss until it's loud.`,
  `The gotcha here is timing — this looked identical to a deploy-window blip for the first few minutes.`,
  `Next time, check ${SOURCE_LABELS[categorySource(category)].toLowerCase()} first — it would've saved a few minutes.`,
];

function categorySource(category: Category): SourceKind {
  if (category === "flag" || category === "code" || category === "shadow" || category === "flaky") return "vcs";
  if (category === "infra") return "infra";
  if (category === "data") return "logs";
  return "metrics";
}

function buildLesson(incident: Incident, investigation: Investigation, rng: Rng): LessonLearned {
  const sys = incident.affectedSystems[0];
  const category = classify(incident);
  const resolution = investigation.resolution;
  return {
    id: `lesson-${incident.id}`,
    incidentId: incident.id,
    title: incident.title,
    timestamp: incident.resolvedAt!,
    whatHappened: rng.pick(WHAT_HAPPENED_POOL(sys)),
    rootCause: `Traced it back to ${rng.pick(CATEGORY_ROOT_CAUSE[category])}.`,
    fix: resolution ? resolution.action + "." : "Mitigated manually — no standing fix needed.",
    gotcha: rng.pick(GOTCHA_POOL(sys, category)),
    promotedToPlaybookId: null,
  };
}

const PAYMENTS_LESSON_OVERRIDE = (incident: Incident): LessonLearned => ({
  id: `lesson-${incident.id}`,
  incidentId: incident.id,
  title: "The checkout flag that shipped faster than the rollback plan",
  timestamp: incident.resolvedAt!,
  whatHappened:
    "We ramped `new-checkout-flow` straight from 10% to 100%, and within five minutes checkout errors were at 4.8% — sixteen times baseline. Support tickets came in before the alert did.",
  rootCause:
    "The new express-checkout path threw a validation error the old path never hit, and we found out at 100% traffic instead of 25%.",
  fix:
    "Reverted the flag. Someone also asked whether a schema change deployed around the same time was the real cause — it wasn't, but it was a fair question and worth double-checking whenever two changes land close together.",
  gotcha:
    "Ramp flags in steps you'd actually notice failing at. 10% to 100% in one jump means your first real signal is a page, not a graph.",
  promotedToPlaybookId: null,
});

const CODE_QUALITY_LESSON_OVERRIDE = (incident: Incident): LessonLearned => ({
  id: `lesson-${incident.id}`,
  incidentId: incident.id,
  title: "A config rollout that quietly made Solis Code 2.0 worse",
  timestamp: incident.resolvedAt!,
  whatHappened:
    "Completion quality on Solis Code 2.0 dropped noticeably after a routine eval-config rollout — no errors, no alerts, just a worse model that nobody would've caught without the eval suite.",
  rootCause:
    "A default sampling parameter got flipped in the rollout config. It passed every health check, because health checks don't grade output quality.",
  fix:
    "Opened a PR reverting the sampling default; a teammate approved it once the eval scores confirmed the regression matched the config diff exactly.",
  gotcha:
    "Health checks and quality are different signals. This one wouldn't have paged anyone if the eval suite hadn't caught the score drop on its own schedule.",
  promotedToPlaybookId: null,
});

function generateLessons(): LessonLearned[] {
  const rng = new Rng(4462);
  const resolved = INCIDENTS.filter((i) => i.status === "resolved" && i.resolvedAt !== null);
  const payments = findIncident("Checkout error rate spike on payments-service");
  const codeQuality = findIncident("Solis Code 2.0 degraded completion quality after config rollout");

  const lessons = resolved.map((incident) => {
    if (incident.id === payments.id) return PAYMENTS_LESSON_OVERRIDE(incident);
    if (incident.id === codeQuality.id) return CODE_QUALITY_LESSON_OVERRIDE(incident);
    return buildLesson(incident, getInvestigation(incident.id)!, rng);
  });

  return lessons.sort((a, b) => b.timestamp - a.timestamp);
}

export const LESSONS_LEARNED: LessonLearned[] = generateLessons();

// ---------------------------------------------------------------------------
// Investigation playbooks
// ---------------------------------------------------------------------------

export interface Playbook {
  id: string;
  name: string;
  description: string;
  usageCount: number;
  originIncidentTitle: string;
  originStory: string;
  steps: string[];
}

export const PLAYBOOKS: Playbook[] = [
  {
    id: "pb-deploy-window-regression",
    name: "Deploy-Window Regression",
    description: "A symptom that starts right around one or more recent deploys or config changes.",
    usageCount: 23,
    originIncidentTitle: "Checkout error rate spike on payments-service",
    originStory: "Built after the payments-service checkout incident, once the same two-changes-landed-close-together confusion showed up a second time on a different service.",
    steps: [
      "Pull every deploy or flag change in the 30 minutes before the first symptom, not just the most recent one.",
      "Check error onset time against each change's exact rollout timestamp, not its merge time.",
      "When two changes land close together, rule each one out with its own evidence — don't assume the most recent is guilty by default.",
      "Prefer reverting the narrowest change first; only widen scope if that doesn't resolve it.",
    ],
  },
  {
    id: "pb-shadow-divergence",
    name: "Shadow Divergence",
    description: "Canary metrics disagree with shadow traffic during a staged model or service rollout.",
    usageCount: 4,
    originIncidentTitle: "Canary metrics diverged from shadow traffic during a Solis Pro 4.1 rollout",
    originStory: "Generalized from the Solis Pro 4.1 canary rollout, where the divergence turned out to be a shadow-traffic replay bug rather than a real regression.",
    steps: [
      "Compare canary metrics against shadow-traffic baselines for the same window, not against overall production average.",
      "Check the canary's current traffic percentage — divergence often only appears above a threshold.",
      "Confirm shadow traffic is actually mirroring live request shape and not a stale replay.",
      "If metrics diverge but user-facing traffic is clean, roll back the canary before it ramps further.",
    ],
  },
  {
    id: "pb-flaky-test-cascade",
    name: "Flaky Test Cascade",
    description: "One unreliable test blocks a release train and gets mistaken for a real regression.",
    usageCount: 11,
    originIncidentTitle: "Flaky integration tests cascaded into a blocked release train",
    originStory: "Built after a single flaky integration test blocked three unrelated PRs for most of a morning.",
    steps: [
      "Pull the failing test's pass/fail history over the last 20 runs before assuming it's a real regression.",
      "Check whether failures cluster on one runner or shard — that points to environment, not code.",
      "Quarantine the specific test, not the whole suite, to unblock the release train.",
      "File a follow-up to fix or delete the test — a quarantined test nobody revisits is a silent coverage gap.",
    ],
  },
  {
    id: "pb-feature-flag-blast-radius",
    name: "Feature Flag Blast Radius",
    description: "A flag rollout affects more traffic, or a different code path, than intended.",
    usageCount: 17,
    originIncidentTitle: "Feature flag service returned stale flags after redeploy",
    originStory: "Generalized after a redeploy served stale flag values to a slice of traffic, which took longer to diagnose than it should have.",
    steps: [
      "Check the flag's rollout percentage at the moment symptoms started, not its current value.",
      "Confirm what code path exists only behind the flag — that's where to look first.",
      "Revert to the last known-good percentage rather than fully killing the flag, if a partial rollback is supported.",
      "Note in the retro if the rollout jumped straight to 100% — recommend a stepped ramp next time.",
    ],
  },
  {
    id: "pb-dc-thermal-response",
    name: "Data Center Thermal Response",
    description: "A facility thermal or power sensor crosses a safety threshold.",
    usageCount: 6,
    originIncidentTitle: "The Dalles data center power fluctuation",
    originStory: "Built from a data center power incident, after the first response nearly failed workloads over before confirming the sensor reading.",
    steps: [
      "Confirm the sensor reading against a second, independent sensor before acting — false positives happen.",
      "Check cooling redundancy and load-shedding status before choosing between throttling and failover.",
      "Fail workloads over to the paired region if the thermal trend hasn't reversed within one cooling cycle.",
      "Loop in the facility team from the first alert, not after failover — they own the physical fix.",
    ],
  },
  {
    id: "pb-schema-drift-triage",
    name: "Schema Drift Triage",
    description: "A schema or data shape change breaks a downstream consumer that wasn't in the change's review.",
    usageCount: 9,
    originIncidentTitle: "Data pipeline schema drift broke downstream joins",
    originStory: "Generalized after a schema change broke a downstream join that its author didn't know existed.",
    steps: [
      "Diff the actual production schema against what the pipeline code expects — don't trust migration history alone.",
      "Identify every downstream consumer of the changed table before writing the fix.",
      "Backfill or reprocess only the affected window, not the full history, unless the drift is systemic.",
      "Add a schema-compatibility check to CI so the same drift can't ship silently again.",
    ],
  },
  {
    id: "pb-traffic-spike-backlog",
    name: "Traffic Spike Backlog Clearing",
    description: "A queue or worker pool falls behind during a load spike and needs headroom, not a fix.",
    usageCount: 14,
    originIncidentTitle: "Notification delivery delays during traffic spike",
    originStory: "Built after a notification backlog was fixed by scaling before anyone had finished reading the logs.",
    steps: [
      "Check whether the backlog is growing or already draining before scaling — scaling a draining queue wastes a cycle.",
      "Scale the consumer, not the producer, unless the producer itself is the bottleneck.",
      "Watch for a retry storm once the backlog clears — it can reopen the incident.",
      "Record peak queue depth and drain time — it's the number that justifies a permanent capacity increase.",
    ],
  },
];

// Mark every lesson whose incident originated a playbook. Matched by
// incident id (via title), not lesson title, since a couple of lessons carry
// a hand-written title that differs from their incident's own.
for (const playbook of PLAYBOOKS) {
  const originIncident = INCIDENTS.find((i) => i.title === playbook.originIncidentTitle);
  const lesson = originIncident ? LESSONS_LEARNED.find((l) => l.incidentId === originIncident.id) : undefined;
  if (lesson) lesson.promotedToPlaybookId = playbook.id;
}

// ---------------------------------------------------------------------------
// Live triage: intake paths + escalation rules
// ---------------------------------------------------------------------------

export type TriageIntakeKind = "alert" | "channel" | "filed";

export interface TriageIntakePath {
  id: string;
  kind: TriageIntakeKind;
  label: string;
  description: string;
}

export const TRIAGE_INTAKE_PATHS: TriageIntakePath[] = [
  { id: "alert", kind: "alert", label: "Automated alert fires", description: "A monitored threshold crosses its escalation rule and pages on-call automatically." },
  { id: "channel", kind: "channel", label: "Posted in the on-call channel", description: "A human notices something first and posts directly in #on-call — the agent picks it up from there." },
  { id: "filed", kind: "filed", label: "Filed and tagged internally", description: "Someone opens a ticket and tags it as an incident, routing it into the same triage queue." },
];

export interface EscalationRule {
  id: string;
  condition: string;
  action: "page" | "log";
  enabled: boolean;
}

export const ESCALATION_RULES: EscalationRule[] = [
  { id: "err-rate-sustained", condition: "Error rate above 2% for more than 5 minutes, outside a known deploy window", action: "page", enabled: true },
  { id: "latency-p99", condition: "p99 latency more than 3x the 7-day baseline for more than 10 minutes", action: "page", enabled: true },
  { id: "critical-down", condition: "Any production system fully unreachable, regardless of duration", action: "page", enabled: true },
  { id: "dc-thermal", condition: "Data center thermal sensor above safe threshold", action: "page", enabled: true },
  { id: "err-rate-brief", condition: "Error rate above 2% for under 5 minutes and self-recovers", action: "log", enabled: true },
  { id: "known-deploy-window", condition: "Any alert firing within 10 minutes of a tagged deploy window", action: "log", enabled: true },
  { id: "single-region-failover-ok", condition: "Single-region degradation with a healthy automatic failover", action: "log", enabled: true },
  { id: "minor-queue-backlog", condition: "Queue backlog under a 15-minute projected drain time", action: "log", enabled: false },
];

// ---------------------------------------------------------------------------
// CI weather report
// ---------------------------------------------------------------------------

export interface CiWeatherReport {
  headline: string;
  body: string[];
}

export const CI_WEATHER_VARIANTS: CiWeatherReport[] = [
  {
    headline: "Clear — safe to merge.",
    body: [
      "Build health is solid: the last 40 CI runs on main are green, and the flaky-test quarantine list is empty.",
      "Merge queue is short — 2 PRs waiting, both under 10 minutes from landing.",
      "Deploy lag is normal: the last production deploy went out 47 minutes ago, and staging is caught up to head.",
      "No incidents are touching shared infrastructure right now — check Live Incidents for anything isolated, but it's clear to ship.",
    ],
  },
  {
    headline: "Mostly clear, one thing to watch.",
    body: [
      "Build health is fine on main, but payments-service has failed its last 2 CI runs on a flaky integration test that isn't quarantined yet.",
      "Merge queue is backed up to 6 PRs, averaging a 24-minute wait, mostly stuck behind the flaky test above.",
      "Deploy lag is a little behind — staging is about 90 minutes behind head while the team looks at the CI failures.",
      "One incident is in flight, isolated to search-service — safe to merge everywhere else.",
    ],
  },
  {
    headline: "Hold merges to the affected service.",
    body: [
      "Build health is degraded: 3 of the last 10 CI runs on main failed, all in the same test suite.",
      "Merge queue is effectively paused for model-serving while the on-call agent investigates a live incident there.",
      "Deploy lag is elevated — the last deploy was rolled back 20 minutes ago pending a fix.",
      "Recommend holding non-urgent merges to the affected service until it resolves; everything else is unaffected.",
    ],
  },
];

// ---------------------------------------------------------------------------
// Handoff reports
// ---------------------------------------------------------------------------

export interface HandoffReport {
  period: "daily" | "weekly";
  headline: string;
  stats: { label: string; value: string }[];
  body: string[];
}

function avgDetectMinutes(incidents: Incident[]): number {
  const withHypothesis = incidents
    .map((i) => getInvestigation(i.id))
    .filter((inv): inv is Investigation => Boolean(inv) && inv!.thread.length > 0);
  if (withHypothesis.length === 0) return 5;
  const total = withHypothesis.reduce((sum, inv) => sum + (inv.thread[0].timestamp - INCIDENTS.find((i) => i.id === inv.incidentId)!.startedAt), 0);
  return Math.round(total / withHypothesis.length / 60_000);
}

function buildHandoff(period: "daily" | "weekly"): HandoffReport {
  const since = period === "daily" ? daysAgo(1) : daysAgo(7);
  const windowIncidents = INCIDENTS.filter((i) => i.startedAt >= since);
  const stillOpen = INCIDENTS.filter((i) => i.status !== "resolved");
  const critical = windowIncidents.filter((i) => i.severity === "critical");
  const topIncident = [...windowIncidents].sort((a, b) => {
    const rank = { critical: 2, major: 1, minor: 0 } as const;
    return rank[b.severity] - rank[a.severity] || b.startedAt - a.startedAt;
  })[0];

  const stats = [
    { label: "Incidents", value: String(windowIncidents.length) },
    { label: "Critical", value: String(critical.length) },
    { label: "Avg. time to first analysis", value: `${avgDetectMinutes(windowIncidents)}m` },
    { label: "Currently open", value: String(stillOpen.length) },
  ];

  const body = [
    period === "daily"
      ? `${windowIncidents.length} incident${windowIncidents.length === 1 ? "" : "s"} opened in the last 24 hours, ${critical.length} of them critical.`
      : `${windowIncidents.length} incidents opened this week, ${critical.length} critical — see Lessons Learned for the full write-ups.`,
    topIncident
      ? `The one most worth knowing about: "${topIncident.title}"${topIncident.status === "resolved" ? ", now resolved" : " — still open, see Live Triage for the current investigation"}.`
      : "Nothing severity-worthy in this window — a quiet stretch.",
    stillOpen.length > 0
      ? `${stillOpen.length} incident${stillOpen.length === 1 ? " is" : "s are"} still open heading into the next shift: ${stillOpen.map((i) => `"${i.title}"`).join(", ")}.`
      : "Nothing open heading into the next shift.",
    "Check On-Call Schedule for who's up and the escalation path if something new comes in.",
  ];

  return { period, headline: period === "daily" ? "Handoff — last 24 hours" : "Handoff — last 7 days", stats, body };
}

export const HANDOFF_REPORTS: Record<"daily" | "weekly", HandoffReport> = {
  daily: buildHandoff("daily"),
  weekly: buildHandoff("weekly"),
};

export const ON_CALL_REFERENCE_NOW = REFERENCE_NOW;
