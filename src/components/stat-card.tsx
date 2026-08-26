import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * Kept deliberately plain per v2.5's Core Principle: hierarchy comes from
 * type size + the ink ladder, not color or decoration — no icon tile, no
 * filled delta chip.
 */
export function StatCard({
  label,
  value,
  hint,
  trend,
  className,
}: {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  trend?: { direction: "up" | "down"; label: string; good?: boolean };
  className?: string;
}) {
  return (
    <Card className={className}>
      <CardContent>
        <p className="text-2xs font-medium tracking-[0.06em] text-ink-faint uppercase">
          {label}
        </p>
        <p className="mt-2 font-mono text-3xl text-ink-em tabular-nums">{value}</p>
        {(hint || trend) && (
          <div className="mt-1.5 flex items-center gap-1.5 text-2xs">
            {trend && (
              <span
                className={cn(
                  "font-medium tabular-nums",
                  trend.good === false
                    ? "text-danger-300"
                    : trend.good === true
                      ? "text-success-300"
                      : "text-ink-muted",
                )}
              >
                {trend.direction === "up" ? "↑" : "↓"} {trend.label}
              </span>
            )}
            {hint && <span className="text-ink-faint">{hint}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
