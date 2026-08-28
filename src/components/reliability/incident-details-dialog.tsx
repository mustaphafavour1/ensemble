import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StatusBadge, type Tone } from "@/components/status-badge";
import type { Incident, IncidentSeverity, IncidentStatus } from "@/lib/mock/incidents";
import { formatDuration, formatRelative } from "@/lib/mock/time";

const SEVERITY_META: Record<IncidentSeverity, { tone: Tone; label: string }> = {
  critical: { tone: "danger", label: "Critical" },
  major: { tone: "warning", label: "Major" },
  minor: { tone: "neutral", label: "Minor" },
};

const STATUS_META: Record<IncidentStatus, { tone: Tone; label: string }> = {
  investigating: { tone: "danger", label: "Investigating" },
  identified: { tone: "warning", label: "Identified" },
  monitoring: { tone: "brand", label: "Monitoring" },
  resolved: { tone: "success", label: "Resolved" },
};

export function IncidentDetailsDialog({
  incident,
  open,
  onOpenChange,
}: {
  incident: Incident | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        {incident && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-1.5">
                <StatusBadge tone={SEVERITY_META[incident.severity].tone} label={SEVERITY_META[incident.severity].label} />
                <StatusBadge
                  tone={STATUS_META[incident.status].tone}
                  label={STATUS_META[incident.status].label}
                  pulse={incident.status !== "resolved"}
                />
              </div>
              <DialogTitle className="mt-1">{incident.title}</DialogTitle>
            </DialogHeader>

            <div className="flex flex-wrap gap-1.5">
              {incident.affectedSystems.map((sys) => (
                <span key={sys} className="rounded-full border border-border px-2 py-0.5 text-2xs text-ink-muted">
                  {sys}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between border-t border-border pt-3 text-2xs text-ink-faint">
              <span>Started {formatRelative(incident.startedAt)}</span>
              {incident.resolvedAt && (
                <span>Resolved in {formatDuration(incident.resolvedAt - incident.startedAt)}</span>
              )}
            </div>

            <div className="flex max-h-[320px] flex-col gap-4 overflow-y-auto border-t border-border pt-3">
              {incident.updates
                .slice()
                .reverse()
                .map((update, i) => (
                  <div key={i} className="flex gap-2.5">
                    <div className="mt-1 flex flex-col items-center self-stretch">
                      <span className="size-1.5 shrink-0 rounded-full bg-brand-500" />
                      {i < incident.updates.length - 1 && (
                        <span className="mt-1 w-px flex-1 bg-border" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1 pb-1">
                      <div className="flex items-center gap-1.5">
                        <StatusBadge tone={STATUS_META[update.status].tone} label={STATUS_META[update.status].label} />
                        <span className="text-2xs text-ink-faint">{formatRelative(update.timestamp)}</span>
                      </div>
                      <p className="mt-1 text-xs text-ink-em">{update.message}</p>
                    </div>
                  </div>
                ))}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
