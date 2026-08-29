import { Rng } from "./rng";
import { minutesAgo } from "./time";

export type IncidentSeverity = "critical" | "major" | "minor";
export type IncidentStatus = "investigating" | "identified" | "monitoring" | "resolved";

export interface IncidentUpdate {
  timestamp: number;
  status: IncidentStatus;
  message: string;
}

export interface Incident {
  id: string;
  title: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  affectedSystems: string[];
  startedAt: number;
  resolvedAt: number | null;
  updates: IncidentUpdate[];
}

const SEED_INCIDENTS: {
  title: string;
  severity: IncidentSeverity;
  affectedSystems: string[];
  ongoing: boolean;
}[] = [
  { title: "Elevated latency on Solis Flash 4.1 in ap-southeast-1", severity: "major", affectedSystems: ["Solis Flash 4.1", "Singapore"], ongoing: true },
  { title: "Mumbai data center running above safe thermal threshold", severity: "critical", affectedSystems: ["Mumbai"], ongoing: true },
  { title: "Intermittent 500s on Solis Vision image generation", severity: "minor", affectedSystems: ["Solis Vision 1.5"], ongoing: true },
  { title: "Solis Code 2.0 degraded completion quality after config rollout", severity: "major", affectedSystems: ["Solis Code 2.0"], ongoing: false },
  { title: "Full outage — Solis Ultra 4.1 in eu-west-1", severity: "critical", affectedSystems: ["Solis Ultra 4.1", "Dublin"], ongoing: false },
  { title: "Elevated error rate on the model availability API", severity: "minor", affectedSystems: ["Public vs Internal Availability API"], ongoing: false },
  { title: "The Dalles data center power fluctuation", severity: "major", affectedSystems: ["The Dalles"], ongoing: false },
  { title: "Solis Motion queue backlog during traffic spike", severity: "minor", affectedSystems: ["Solis Motion 1.2"], ongoing: false },
  { title: "Frankfurt network link saturation between clusters", severity: "major", affectedSystems: ["Frankfurt"], ongoing: false },
  { title: "Delayed self-evaluation results for Solis Pro 4.1", severity: "minor", affectedSystems: ["Solis Pro 4.1", "Self-Evaluation Loop"], ongoing: false },
  { title: "Auth token validation failures across the API gateway", severity: "critical", affectedSystems: ["Solis Ultra 4.1", "Solis Pro 4.1", "Solis Flash 4.1"], ongoing: false },
  { title: "Sydney data center scheduled maintenance overrun", severity: "minor", affectedSystems: ["Sydney"], ongoing: false },
  { title: "Checkout error rate spike on payments-service", severity: "critical", affectedSystems: ["payments-service"], ongoing: false },
  { title: "Search latency regression after index rebuild", severity: "major", affectedSystems: ["search-service"], ongoing: false },
  { title: "Notification delivery delays during traffic spike", severity: "minor", affectedSystems: ["notification-service"], ongoing: false },
  { title: "Recommendation engine returning stale results", severity: "minor", affectedSystems: ["recommendation-engine"], ongoing: false },
  { title: "CDN edge cache poisoning after a stale asset purge", severity: "major", affectedSystems: ["cdn-edge"], ongoing: false },
  { title: "Identity service session validation timeouts", severity: "critical", affectedSystems: ["identity-service"], ongoing: false },
  { title: "Billing worker double-charged a batch of invoices", severity: "critical", affectedSystems: ["billing-worker", "billing-service"], ongoing: false },
  { title: "Training pipeline checkpoint corruption on a Solis Ultra 5.0 run", severity: "major", affectedSystems: ["training-pipeline", "Solis Ultra 5.0"], ongoing: false },
  { title: "Analytics pipeline backfill stuck in a retry loop", severity: "minor", affectedSystems: ["analytics-pipeline"], ongoing: false },
  { title: "Feature flag service returned stale flags after redeploy", severity: "major", affectedSystems: ["feature-flags-service"], ongoing: false },
  { title: "Admin console SSO login failures", severity: "minor", affectedSystems: ["admin-console", "identity-service"], ongoing: false },
  { title: "Data pipeline schema drift broke downstream joins", severity: "major", affectedSystems: ["data-pipeline"], ongoing: false },
  { title: "Model-serving pod OOM-kills under Solis Ultra 4.1 load", severity: "critical", affectedSystems: ["model-serving", "Solis Ultra 4.1"], ongoing: false },
  { title: "Ashburn data center cooling system alarm", severity: "major", affectedSystems: ["Ashburn"], ongoing: false },
  { title: "Council Bluffs network switch failure", severity: "minor", affectedSystems: ["Council Bluffs"], ongoing: false },
  { title: "Tokyo region elevated 5xx rate on the API gateway", severity: "major", affectedSystems: ["api-gateway", "Tokyo"], ongoing: false },
  { title: "São Paulo data center partial power loss", severity: "critical", affectedSystems: ["São Paulo"], ongoing: false },
  { title: "Mobile app crash spike after a client release", severity: "major", affectedSystems: ["mobile-app"], ongoing: false },
  { title: "Web dashboard memory leak in long-lived sessions", severity: "minor", affectedSystems: ["web-dashboard"], ongoing: false },
  { title: "Growth CRM sync jobs silently dropping records", severity: "minor", affectedSystems: ["growth-crm"], ongoing: false },
  { title: "Core inference queue backup during a model rollout", severity: "major", affectedSystems: ["core-inference"], ongoing: true },
  { title: "Observability stack ingestion lag across all regions", severity: "minor", affectedSystems: ["observability-stack"], ongoing: true },
  { title: "Canary metrics diverged from shadow traffic during a Solis Pro 4.1 rollout", severity: "major", affectedSystems: ["Solis Pro 4.1", "model-serving"], ongoing: false },
  { title: "Flaky integration tests cascaded into a blocked release train", severity: "minor", affectedSystems: ["eval-harness"], ongoing: false },
];

const UPDATE_TEMPLATES: Record<IncidentStatus, string[]> = {
  investigating: ["We're investigating reports of the issue described above.", "Engineers are actively investigating root cause."],
  identified: ["The root cause has been identified. A fix is being implemented.", "Identified a faulty config rollout as the likely cause; rolling back."],
  monitoring: ["A fix has been deployed and we're monitoring the results.", "Metrics have returned to baseline; continuing to monitor."],
  resolved: ["This incident has been resolved.", "Fully resolved — all affected systems have recovered."],
};

// These two get a hand-scripted AI investigation thread (see oncall.ts) whose
// internal timing assumes a fast, same-hour resolution — keep it that way.
const FAST_RESOLUTION_TITLES = new Set([
  "Checkout error rate spike on payments-service",
  "Solis Code 2.0 degraded completion quality after config rollout",
]);

function generateIncidents(): Incident[] {
  const rng = new Rng(6689);
  return SEED_INCIDENTS.map((seed, i) => {
    const startedAt = minutesAgo(seed.ongoing ? rng.int(15, 400) : rng.int(500, 60 * 24 * 60)) - i;
    const status: IncidentStatus = seed.ongoing
      ? rng.pick(["investigating", "identified", "monitoring"] as const)
      : "resolved";
    const resolvedAt = seed.ongoing
      ? null
      : startedAt + (FAST_RESOLUTION_TITLES.has(seed.title) ? rng.int(58, 75) : rng.int(30, 400)) * 60_000;

    const sequence: IncidentStatus[] =
      status === "investigating"
        ? ["investigating"]
        : status === "identified"
          ? ["investigating", "identified"]
          : status === "monitoring"
            ? ["investigating", "identified", "monitoring"]
            : ["investigating", "identified", "monitoring", "resolved"];

    const updates: IncidentUpdate[] = sequence.map((s, idx) => ({
      timestamp: startedAt + idx * rng.int(8, 40) * 60_000,
      status: s,
      message: rng.pick(UPDATE_TEMPLATES[s]),
    }));

    return {
      id: rng.id("inc"),
      title: seed.title,
      severity: seed.severity,
      status,
      affectedSystems: seed.affectedSystems,
      startedAt,
      resolvedAt,
      updates,
    };
  }).sort((a, b) => b.startedAt - a.startedAt);
}

export const INCIDENTS: Incident[] = generateIncidents();
