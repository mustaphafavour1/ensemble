import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  trend,
  className,
}: {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  icon?: LucideIcon;
  trend?: { direction: "up" | "down"; label: string; good?: boolean };
  className?: string;
}) {
  return (
    <Card className={className}>
      <CardContent>
        <div className="flex items-center justify-between gap-2">
          <p className="text-2xs font-medium tracking-[0.06em] text-ink-500 uppercase">
            {label}
          </p>
          {Icon && <Icon className="size-3.5 shrink-0 text-ink-500" strokeWidth={1.75} />}
        </div>
        <p className="mt-2 font-mono text-3xl text-ink-100 tabular-nums">{value}</p>
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
                      : "text-ink-300",
                )}
              >
                {trend.direction === "up" ? "↑" : "↓"} {trend.label}
              </span>
            )}
            {hint && <span className="text-ink-500">{hint}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
