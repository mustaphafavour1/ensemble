"use client";

import { useMemo, useState } from "react";
import { ShieldAlert } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { EmptyState } from "@/components/empty-state";
import { StatusBadge, type Tone } from "@/components/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { useAppStore } from "@/lib/store";
import { INCIDENTS, type IncidentSeverity, type IncidentStatus } from "@/lib/mock/incidents";
import { formatDuration, formatRelative } from "@/lib/mock/time";
import { cn } from "@/lib/utils";

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

const FILTERS: { value: IncidentStatus | "ongoing" | "all"; label: string }[] = [
  { value: "ongoing", label: "Ongoing" },
  { value: "all", label: "All" },
  { value: "resolved", label: "Resolved" },
];

export default function LiveIncidentsPage() {
  const seeded = useAppStore((s) => s.seeded);
  const [filter, setFilter] = useState<IncidentStatus | "ongoing" | "all">("ongoing");

  const ongoing = INCIDENTS.filter((i) => i.status !== "resolved");
  const resolved = INCIDENTS.filter((i) => i.status === "resolved");
  const avgResolutionMs =
    resolved.length > 0
      ? resolved.reduce((sum, i) => sum + (i.resolvedAt! - i.startedAt), 0) / resolved.length
      : 0;

  const filtered = useMemo(() => {
    if (!seeded) return [];
    if (filter === "all") return INCIDENTS;
    if (filter === "ongoing") return ongoing;
    return INCIDENTS.filter((i) => i.status === filter);
  }, [filter, seeded, ongoing]);

  return (
    <div>
      <PageHeader
        title="Live Incidents"
        description="Every ongoing and recent incident across models and infrastructure, with live status updates."
      />

      {!seeded ? (
        <EmptyState
          icon={ShieldAlert}
          title="No incidents on record"
          description="Turn on demo data in Settings to see incident history."
        />
      ) : (
        <>
          <div className="mb-6 grid grid-cols-4 gap-4">
            <StatCard
              label="Ongoing"
              value={ongoing.length}
              hint={`${ongoing.filter((i) => i.severity === "critical").length} critical`}
            />
            <StatCard label="Resolved this period" value={resolved.length} />
            <StatCard label="Avg. resolution time" value={formatDuration(avgResolutionMs)} />
            <StatCard label="Critical (all time)" value={INCIDENTS.filter((i) => i.severity === "critical").length} />
          </div>

          <div className="mb-4 flex flex-wrap items-center gap-1.5">
            {FILTERS.map((f) => {
              const active = filter === f.value;
              return (
                <button
                  key={f.value}
                  onClick={() => setFilter(f.value)}
                  className={cn(
                    "rounded-full border px-2.5 py-1 text-2xs font-medium transition-colors",
                    active
                      ? "border-brand-500/30 bg-brand-500/10 text-brand-400"
                      : "border-border text-ink-muted hover:border-neutral-700 hover:text-ink-em",
                  )}
                >
                  {f.label}
                </button>
              );
            })}
          </div>

          <div className="flex flex-col gap-3">
            {filtered.map((incident) => {
              const latestUpdate = incident.updates[incident.updates.length - 1];
              return (
                <Card
                  key={incident.id}
                  className={cn(incident.status !== "resolved" && "border-l-2 border-l-danger-500/50")}
                >
                  <CardContent>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <StatusBadge tone={SEVERITY_META[incident.severity].tone} label={SEVERITY_META[incident.severity].label} />
                          <StatusBadge
                            tone={STATUS_META[incident.status].tone}
                            label={STATUS_META[incident.status].label}
                            pulse={incident.status !== "resolved"}
                          />
                        </div>
                        <p className="mt-2 text-xs text-ink-em">{incident.title}</p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {incident.affectedSystems.map((sys) => (
                            <span
                              key={sys}
                              className="rounded-full border border-border px-2 py-0.5 font-mono text-2xs text-ink-muted"
                            >
                              {sys}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="text-right text-2xs text-ink-faint">
                        <p>Started {formatRelative(incident.startedAt)}</p>
                        {incident.resolvedAt && (
                          <p className="mt-0.5">Resolved in {formatDuration(incident.resolvedAt - incident.startedAt)}</p>
                        )}
                      </div>
                    </div>

                    {latestUpdate && (
                      <p className="mt-3 border-t border-border pt-2.5 text-2xs text-ink-muted">
                        <span className="font-medium text-ink-em">{formatRelative(latestUpdate.timestamp)} — </span>
                        {latestUpdate.message}
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}

            {filtered.length === 0 && (
              <EmptyState icon={ShieldAlert} title="Nothing here" description="No incidents match this filter." />
            )}
          </div>
        </>
      )}
    </div>
  );
}
