import {
  GitCommitHorizontal,
  CheckCircle2,
  MessageSquareWarning,
  Rocket,
  type LucideIcon,
} from "lucide-react";
import type { ActivityItem } from "@/lib/mock/activity";
import { formatRelative } from "@/lib/mock/time";

const ICONS: Record<ActivityItem["type"], LucideIcon> = {
  commit: GitCommitHorizontal,
  approval: CheckCircle2,
  review: MessageSquareWarning,
  deploy: Rocket,
};

export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  return (
    <ul className="flex flex-col gap-4">
      {items.map((item) => {
        const Icon = ICONS[item.type];
        return (
          <li key={item.id} className="flex gap-2.5">
            <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-surface-hover text-ink-faint">
              <Icon className="size-3" strokeWidth={1.75} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-2xs leading-relaxed text-ink-em">
                {item.message}
              </p>
              <p className="mt-0.5 font-mono text-[9px] text-ink-faint">
                {formatRelative(item.timestamp)}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
