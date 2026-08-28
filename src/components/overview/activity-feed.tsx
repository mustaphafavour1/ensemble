import {
  GitCommitHorizontal,
  CheckCircle2,
  MessageSquareWarning,
  Rocket,
  GitMerge,
  RotateCcw,
  Flag,
  XCircle,
  ArrowUpCircle,
  type LucideIcon,
} from "lucide-react";
import type { ActivityItem } from "@/lib/mock/activity";
import { AgentTag } from "@/components/agent-tag";
import { TONE_CLASSES, type Tone } from "@/components/status-badge";
import { formatRelative } from "@/lib/mock/time";
import { cn } from "@/lib/utils";

export const TYPE_META: Record<ActivityItem["type"], { label: string; tone: Tone; icon: LucideIcon }> = {
  commit: { label: "Commit", tone: "neutral", icon: GitCommitHorizontal },
  approval: { label: "Approved", tone: "success", icon: CheckCircle2 },
  review: { label: "Changes requested", tone: "warning", icon: MessageSquareWarning },
  deploy: { label: "Deployed", tone: "brand", icon: Rocket },
  merged: { label: "Merged", tone: "success", icon: GitMerge },
  "rolled-back": { label: "Rolled back", tone: "danger", icon: RotateCcw },
  "flagged-for-review": { label: "Flagged", tone: "warning", icon: Flag },
  "test-failed": { label: "Test failed", tone: "danger", icon: XCircle },
  escalated: { label: "Escalated", tone: "danger", icon: ArrowUpCircle },
};

function detailFor(item: ActivityItem): string {
  switch (item.type) {
    case "commit":
      return `${item.commitSha} · ${item.confidencePct}% confidence`;
    case "approval":
      return `Approved by ${item.reviewer}`;
    case "review":
      return `Requested by ${item.reviewer}`;
    case "deploy":
      return `Shipped to ${item.environment}`;
    case "merged":
      return `${item.commitSha} · ${item.confidencePct}% confidence`;
    case "rolled-back":
      return `Rolled back from ${item.environment}`;
    case "flagged-for-review":
      return `Flagged by ${item.reviewer}`;
    case "test-failed":
      return `${item.commitSha} · needs a fix`;
    case "escalated":
      return `Escalated to ${item.reviewer}`;
  }
}

export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  return (
    <ul className="flex flex-col divide-y divide-border">
      {items.map((item) => {
        const meta = TYPE_META[item.type];
        const Icon = meta.icon;
        return (
          <li key={item.id} className="flex flex-col gap-1.5 py-2.5 first:pt-0 last:pb-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-2xs font-medium whitespace-nowrap",
                  TONE_CLASSES[meta.tone],
                )}
              >
                <Icon className="size-2.5 shrink-0" strokeWidth={2} />
                {meta.label}
              </span>
              <AgentTag name={item.agentName} className="text-2xs" />
              <span className="text-2xs text-ink-faint">in</span>
              <span className="truncate rounded-full border border-border px-1.5 py-0.5 text-2xs text-ink-muted">
                {item.repoName}
              </span>
            </div>
            <div className="flex items-center gap-1.5 pl-0.5 text-2xs text-ink-faint">
              <span className="truncate">{detailFor(item)}</span>
              <span>·</span>
              <span className="shrink-0">{formatRelative(item.timestamp)}</span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
