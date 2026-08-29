"use client";

import { useMemo, useState } from "react";
import { Lightbulb } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { StatusBadge, type Tone } from "@/components/status-badge";
import { AgentTag } from "@/components/agent-tag";
import { Card, CardContent } from "@/components/ui/card";
import { useAppStore } from "@/lib/store";
import { TEAM_RECOMMENDATIONS, TEAMS, type TeamRecStatus, type TeamRecCategory } from "@/lib/mock/teams";
import { formatRelative } from "@/lib/mock/time";
import { cn } from "@/lib/utils";

const STATUS_META: Record<TeamRecStatus, { tone: Tone; label: string }> = {
  new: { tone: "brand", label: "New" },
  acknowledged: { tone: "warning", label: "Acknowledged" },
  actioned: { tone: "success", label: "Actioned" },
};

const CATEGORY_CLASSES: Record<TeamRecCategory, string> = {
  Adoption: "border-brand-500/25 bg-brand-500/10 text-brand-400",
  Efficiency: "border-success-500/25 bg-success-500/10 text-success-300",
  Training: "border-warning-500/25 bg-warning-500/10 text-warning-300",
  Risk: "border-danger-500/25 bg-danger-500/10 text-danger-300",
};

const FILTERS: { value: TeamRecStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "new", label: "New" },
  { value: "acknowledged", label: "Acknowledged" },
  { value: "actioned", label: "Actioned" },
];

export default function TeamInsightsPage() {
  const seeded = useAppStore((s) => s.seeded);
  const [filter, setFilter] = useState<TeamRecStatus | "all">("all");

  const filtered = useMemo(() => {
    if (!seeded) return [];
    return filter === "all" ? TEAM_RECOMMENDATIONS : TEAM_RECOMMENDATIONS.filter((r) => r.status === filter);
  }, [filter, seeded]);

  return (
    <div>
      <PageHeader
        title="Team Recommendations & Insights"
        description="EnsembleAI's read on how each internal team is adopting and benefiting from the agent fleet."
      />

      {!seeded ? (
        <EmptyState
          icon={Lightbulb}
          title="No insights yet"
          description="Turn on demo data in Settings to see team insights."
        />
      ) : (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-1.5">
            {FILTERS.map((f) => {
              const active = filter === f.value;
              return (
                <button
                  key={f.value}
                  type="button"
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
            {filtered.map((rec) => {
              const team = TEAMS.find((t) => t.id === rec.teamId)!;
              return (
                <Card key={rec.id}>
                  <CardContent>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <StatusBadge tone={STATUS_META[rec.status].tone} label={STATUS_META[rec.status].label} />
                      <span
                        className={cn(
                          "rounded-full border px-2 py-0.5 text-2xs font-medium",
                          CATEGORY_CLASSES[rec.category],
                        )}
                      >
                        {rec.category}
                      </span>
                      <span className="text-2xs text-ink-faint">{team.name}</span>
                    </div>
                    <p className="mt-2 text-[13px] text-ink-em">{rec.title}</p>
                    <p className="mt-1 text-2xs leading-relaxed text-ink-muted">{rec.description}</p>
                    <div className="mt-2.5 flex items-center gap-3 text-2xs text-ink-faint">
                      <AgentTag name="EnsembleAI" className="text-2xs" />
                      <span>{rec.confidencePct}% confidence</span>
                      <span>{formatRelative(rec.generatedAt)}</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {filtered.length === 0 && (
              <EmptyState icon={Lightbulb} title="Nothing here" description="No insights match this filter." />
            )}
          </div>
        </>
      )}
    </div>
  );
}
