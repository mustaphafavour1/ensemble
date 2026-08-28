import { StatusBadge, type Tone } from "@/components/status-badge";
import { SLA_RECORDS, SLA_TARGET, getOverallModelStatus, type SystemStatusLevel } from "@/lib/mock/sla";
import { getModelById } from "@/lib/mock/models";
import { cn } from "@/lib/utils";

const STATUS_META: Record<SystemStatusLevel, { tone: Tone; label: string }> = {
  operational: { tone: "success", label: "All systems operational" },
  degraded: { tone: "warning", label: "Degraded performance" },
  outage: { tone: "danger", label: "Active outage" },
};

// Uptime lives in a narrow 99.0–100% band — a plain 0–100 meter would render
// every bar as visually full. Stretching that band across the meter's full
// width is what makes a 99.4% dip actually read as a dip.
const METER_MIN = 99;
const METER_MAX = 100;

function meterFillPct(uptimePct: number): number {
  return Math.max(0, Math.min(100, ((uptimePct - METER_MIN) / (METER_MAX - METER_MIN)) * 100));
}

export function SystemStatusMeters() {
  const overall = getOverallModelStatus();

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between">
        <span className="text-2xs font-medium tracking-[0.06em] text-ink-faint uppercase">
          Overall system status
        </span>
        <StatusBadge
          tone={STATUS_META[overall].tone}
          label={STATUS_META[overall].label}
          pulse={overall !== "operational"}
        />
      </div>

      <div className="mt-4 flex flex-1 flex-col justify-center gap-3">
        {SLA_RECORDS.map((r) => {
          const model = getModelById(r.modelId);
          if (!model) return null;
          const healthy = r.uptimePct30d >= r.slaTargetPct;
          return (
            <div key={r.modelId} className="flex items-center gap-3">
              <span className="w-32 shrink-0 truncate text-2xs text-ink-em">{model.name}</span>
              <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-neutral-800">
                <div
                  className={cn(
                    "absolute inset-y-0 left-0 rounded-full",
                    healthy ? "bg-brand-500" : "bg-warning-500",
                  )}
                  style={{ width: `${meterFillPct(r.uptimePct30d)}%` }}
                />
              </div>
              <span
                className={cn(
                  "w-16 shrink-0 text-right text-2xs tabular-nums",
                  healthy ? "text-ink-muted" : "text-warning-300",
                )}
              >
                {r.uptimePct30d.toFixed(2)}%
              </span>
            </div>
          );
        })}
      </div>

      <p className="mt-3 shrink-0 text-2xs text-ink-faint">
        30-day uptime against a {SLA_TARGET}% SLA target, across every production model.
      </p>
    </div>
  );
}
