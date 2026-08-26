import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border py-20 text-center">
      <div className="flex size-9 items-center justify-center rounded-md border border-border bg-surface text-ink-faint">
        <Icon className="size-4" strokeWidth={1.75} />
      </div>
      <div>
        <p className="text-xs font-medium text-ink-em">{title}</p>
        <p className="mx-auto mt-1 max-w-xs text-2xs text-ink-muted">
          {description}
        </p>
      </div>
      {action}
    </div>
  );
}
