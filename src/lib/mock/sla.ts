import { Rng, hashString } from "./rng";
import { MODEL_VERSIONS, type ModelVersion } from "./models";
import { REFERENCE_NOW } from "./time";

export interface SlaRecord {
  modelId: string;
  uptimePct30d: number;
  slaTargetPct: number;
  incidentsThisMonth: number;
}

const SLA_TARGET = 99.9;

export const SLA_RECORDS: SlaRecord[] = MODEL_VERSIONS.filter((m) => m.status === "production").map((m) => {
  const rng = new Rng(hashString(m.id));
  const dipsBelowTarget = rng.bool(0.2);
  const uptimePct30d = dipsBelowTarget
    ? Math.round((SLA_TARGET - rng.float(0.05, 0.6)) * 1000) / 1000
    : Math.round((SLA_TARGET + rng.float(0.02, 0.099)) * 1000) / 1000;

  return {
    modelId: m.id,
    uptimePct30d,
    slaTargetPct: SLA_TARGET,
    incidentsThisMonth: dipsBelowTarget ? rng.int(1, 3) : rng.bool(0.3) ? 1 : 0,
  };
});

export { SLA_TARGET };

export type SystemStatusLevel = "operational" | "degraded" | "outage";

/** Worst-of-fleet rollup — one bad model is enough to mark the platform degraded. */
export function getOverallModelStatus(): SystemStatusLevel {
  const worst = Math.min(...SLA_RECORDS.map((r) => r.uptimePct30d));
  if (worst < SLA_TARGET - 1) return "outage";
  if (worst < SLA_TARGET) return "degraded";
  return "operational";
}

export type HealthStatus = "healthy" | "degraded" | "critical";

export interface ModelHealth {
  score: number;
  status: HealthStatus;
  latencyMs: number;
  requestsPerSec: number;
}

/**
 * Uptime lives in a razor-thin 97.9–100% band. Rescaling that band onto a
 * full 0–100 gauge score (rather than plotting uptime directly) is what
 * makes a real but modest SLA miss actually show up as a shorter arc
 * instead of every model reading as a visually-identical full circle.
 */
function scoreFromUptime(uptimePct: number): number {
  const floor = SLA_TARGET - 2;
  const pct = ((uptimePct - floor) / (100 - floor)) * 100;
  return Math.max(0, Math.min(100, pct));
}

function statusFromScore(score: number): HealthStatus {
  if (score >= 92) return "healthy";
  if (score >= 65) return "degraded";
  return "critical";
}

export function getModelHealth(model: ModelVersion): ModelHealth {
  const sla = SLA_RECORDS.find((r) => r.modelId === model.id);
  const score = sla
    ? scoreFromUptime(sla.uptimePct30d)
    : new Rng(hashString(`${model.id}-health`)).float(85, 98);

  return {
    score: Math.round(score * 10) / 10,
    status: statusFromScore(score),
    latencyMs: model.avgLatencyMs,
    requestsPerSec: Math.round((model.dailyRequestsM * 1_000_000) / 86_400),
  };
}

const DAYS = 90;

/** Daily platform-wide uptime for the trend chart — deliberately close to 100 with rare, small dips. */
export const UPTIME_TREND: { timestamp: number; uptimePct: number }[] = Array.from({ length: DAYS }, (_, i) => {
  const dayIndex = DAYS - 1 - i;
  const timestamp = REFERENCE_NOW - dayIndex * 86_400_000;
  const rng = new Rng(hashString(`uptime-${dayIndex}`));
  const hasDip = rng.bool(0.08);
  const uptimePct = hasDip
    ? Math.round((100 - rng.float(0.3, 1.4)) * 1000) / 1000
    : Math.round((100 - rng.float(0, 0.08)) * 1000) / 1000;
  return { timestamp, uptimePct };
});
