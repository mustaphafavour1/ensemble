import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AgentTag } from "@/components/agent-tag";
import { TONE_CLASSES } from "@/components/status-badge";
import { TYPE_META } from "@/components/overview/activity-feed";
import type { ActivityItem } from "@/lib/mock/activity";
import { formatDateTime } from "@/lib/mock/time";
import { cn } from "@/lib/utils";

export function ActivityDetailsDialog({
  item,
  open,
  onOpenChange,
}: {
  item: ActivityItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const meta = item ? TYPE_META[item.type] : null;
  const Icon = meta?.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {item && meta && Icon && (
          <>
            <DialogHeader>
              <span
                className={cn(
                  "inline-flex w-fit items-center gap-1 rounded-full border px-1.5 py-0.5 text-2xs font-medium",
                  TONE_CLASSES[meta.tone],
                )}
              >
                <Icon className="size-2.5 shrink-0" strokeWidth={2} />
                {meta.label}
              </span>
              <DialogTitle className="mt-1">{item.message}</DialogTitle>
            </DialogHeader>

            <dl className="grid grid-cols-2 gap-y-3 border-t border-border pt-3 text-xs">
              <dt className="text-ink-faint">Agent</dt>
              <dd className="text-right">
                <AgentTag name={item.agentName} className="justify-end text-ink-em" />
              </dd>

              <dt className="text-ink-faint">Repo</dt>
              <dd className="text-right text-ink-em">{item.repoName}</dd>

              <dt className="text-ink-faint">Time</dt>
              <dd className="text-right text-ink-em">{formatDateTime(item.timestamp)}</dd>

              {item.commitSha && (
                <>
                  <dt className="text-ink-faint">Commit</dt>
                  <dd className="text-right text-ink-em">{item.commitSha}</dd>
                </>
              )}
              {item.confidencePct != null && (
                <>
                  <dt className="text-ink-faint">Confidence</dt>
                  <dd className="text-right text-ink-em">{item.confidencePct}%</dd>
                </>
              )}
              {item.reviewer && (
                <>
                  <dt className="text-ink-faint">Reviewer</dt>
                  <dd className="text-right text-ink-em">{item.reviewer}</dd>
                </>
              )}
              {item.environment && (
                <>
                  <dt className="text-ink-faint">Environment</dt>
                  <dd className="text-right text-ink-em">{item.environment}</dd>
                </>
              )}
            </dl>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
