import { Rng, hashString } from "./rng";
import { MODEL_VERSIONS } from "./models";
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
