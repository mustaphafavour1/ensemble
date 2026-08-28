import { success, warning, danger } from "@/lib/palette";
import type { HealthStatus } from "@/lib/mock/sla";
import { cn } from "@/lib/utils";

const STATUS_STROKE: Record<HealthStatus, string> = {
  healthy: success[500],
  degraded: warning[500],
  critical: danger[500],
};

const STATUS_TEXT: Record<HealthStatus, string> = {
  healthy: "text-success-300",
  degraded: "text-warning-300",
  critical: "text-danger-300",
};

const SIZE = 100;
const RADIUS = 40;
const STROKE = 9;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
// A 270° gauge — the remaining 90° is the gap at the bottom of the ring.
const TRACK_LEN = CIRCUMFERENCE * 0.75;
const GAP_LEN = CIRCUMFERENCE - TRACK_LEN;
const ROTATE = 135;

export function ModelHealthGauge({
  name,
  version,
  score,
  status,
  stats,
}: {
  name: string;
  version: string;
  score: number;
  status: HealthStatus;
  stats: { label: string; value: string }[];
}) {
  const clamped = Math.max(0, Math.min(100, score));
  const fillLen = TRACK_LEN * (clamped / 100);

  return (
    <div className="flex w-[172px] shrink-0 snap-start flex-col items-center rounded-lg border border-border bg-surface px-3 py-4">
      <div className="relative" style={{ width: SIZE, height: SIZE }}>
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="size-full">
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="currentColor"
            className="text-neutral-800"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={`${TRACK_LEN} ${GAP_LEN}`}
            transform={`rotate(${ROTATE} ${SIZE / 2} ${SIZE / 2})`}
          />
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke={STATUS_STROKE[status]}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={`${fillLen} ${CIRCUMFERENCE - fillLen}`}
            transform={`rotate(${ROTATE} ${SIZE / 2} ${SIZE / 2})`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("font-heading text-lg tabular-nums", STATUS_TEXT[status])}>
            {clamped.toFixed(1)}
          </span>
          <span className="text-[8px] tracking-[0.05em] text-ink-faint uppercase">Health</span>
        </div>
      </div>

      <p className="mt-2.5 max-w-full truncate text-xs font-medium text-ink-em">{name}</p>
      <p className="text-2xs text-ink-faint">{version}</p>

      <div className="mt-2.5 flex w-full flex-col gap-1 border-t border-border pt-2.5">
        {stats.map((s) => (
          <div key={s.label} className="flex items-center justify-between text-2xs">
            <span className="text-ink-faint">{s.label}</span>
            <span className="text-ink-muted tabular-nums">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
