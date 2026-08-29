"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Lightbulb } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Pagination } from "@/components/pagination";
import { EmptyState } from "@/components/empty-state";
import { StatusBadge, type Tone } from "@/components/status-badge";
import { AgentTag } from "@/components/agent-tag";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";
import { usePagination } from "@/lib/use-pagination";
import { RECOMMENDATIONS, type Recommendation, type RecStatus, type RecCategory } from "@/lib/mock/recommendations";
import { formatRelative } from "@/lib/mock/time";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 10;

const STATUS_META: Record<RecStatus, { tone: Tone; label: string }> = {
  new: { tone: "brand", label: "New" },
  "in-review": { tone: "warning", label: "In Review" },
  actioned: { tone: "success", label: "Actioned" },
  dismissed: { tone: "neutral", label: "Dismissed" },
};

const FILTERS: { value: RecStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "new", label: "New" },
  { value: "in-review", label: "In Review" },
  { value: "actioned", label: "Actioned" },
  { value: "dismissed", label: "Dismissed" },
];

const CATEGORY_CLASSES: Record<RecCategory, string> = {
  Latency: "border-warning-500/25 text-warning-300",
  Cost: "border-brand-500/25 text-brand-400",
  Reliability: "border-danger-500/25 text-danger-300",
  Capability: "border-agent-500/25 text-agent-400",
  Quality: "border-border text-ink-muted",
};

export default function AiRecommendationsPage() {
  const seeded = useAppStore((s) => s.seeded);
  const [recs, setRecs] = useState<Recommendation[]>(RECOMMENDATIONS);
  const [filter, setFilter] = useState<RecStatus | "all">("all");

  const filtered = useMemo(() => {
    if (!seeded) return [];
    return filter === "all" ? recs : recs.filter((r) => r.status === filter);
  }, [recs, filter, seeded]);

  const { page, setPage, pageSize, setPageSize, pageCount, pageItems } = usePagination(filtered, PAGE_SIZE);

  const counts = useMemo(
    () => ({
      new: recs.filter((r) => r.status === "new").length,
      inReview: recs.filter((r) => r.status === "in-review").length,
      actioned: recs.filter((r) => r.status === "actioned").length,
    }),
    [recs],
  );

  function setStatus(id: string, status: RecStatus) {
    const rec = recs.find((r) => r.id === id);
    if (!rec) return;
    setRecs((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    toast.success(`Marked ${STATUS_META[status].label.toLowerCase()}`, { description: rec.title });
  }

  return (
    <div>
      <PageHeader
        title="AI-Generated Recommendations"
        description="Findings EnsembleAI surfaced across evaluation, optimization, and reliability — triage them here."
      />

      {!seeded ? (
        <EmptyState
          icon={Lightbulb}
          title="No recommendations yet"
          description="Turn on demo data in Settings to see EnsembleAI's findings."
        />
      ) : (
        <>
          <div className="mb-6 grid grid-cols-3 gap-4">
            <StatCard label="New" value={counts.new} hint="awaiting triage" />
            <StatCard label="In review" value={counts.inReview} />
            <StatCard label="Actioned" value={counts.actioned} hint="all time" />
          </div>

          <div className="mb-4 flex flex-wrap items-center gap-1.5">
            {FILTERS.map((f) => {
              const count = f.value === "all" ? recs.length : recs.filter((r) => r.status === f.value).length;
              const active = filter === f.value;
              return (
                <button
                  key={f.value}
                  onClick={() => {
                    setFilter(f.value);
                    setPage(1);
                  }}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-2xs font-medium transition-colors",
                    active
                      ? "border-brand-500/30 bg-brand-500/10 text-brand-400"
                      : "border-border text-ink-muted hover:border-neutral-700 hover:text-ink-em",
                  )}
                >
                  {f.label}
                  <span className="tabular-nums opacity-70">{count}</span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-col gap-3">
            {pageItems.map((rec) => (
              <Card key={rec.id}>
                <CardContent>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex-1">
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
                        <span className="text-2xs text-ink-faint">{rec.affectedSystem}</span>
                      </div>
                      <p className="mt-2 text-[13px] text-ink-em">{rec.title}</p>
                      <p className="mt-1 text-2xs leading-relaxed text-ink-muted">{rec.description}</p>
                      <div className="mt-2.5 flex items-center gap-3 text-2xs text-ink-faint">
                        <AgentTag name="EnsembleAI" className="text-2xs" />
                        <span>{rec.confidencePct}% confidence</span>
                        <span>{formatRelative(rec.generatedAt)}</span>
                      </div>
                    </div>

                    {(rec.status === "new" || rec.status === "in-review") && (
                      <div className="flex shrink-0 items-center gap-2">
                        {rec.status === "new" && (
                          <Button variant="outline" size="sm" onClick={() => setStatus(rec.id, "in-review")}>
                            Review
                          </Button>
                        )}
                        {rec.status === "in-review" && (
                          <Button size="sm" onClick={() => setStatus(rec.id, "actioned")}>
                            Mark actioned
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => setStatus(rec.id, "dismissed")}>
                          Dismiss
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

            {filtered.length === 0 && (
              <EmptyState icon={Lightbulb} title="Nothing here" description="No recommendations match this filter." />
            )}
          </div>

          <Pagination
            page={page}
            pageCount={pageCount}
            total={filtered.length}
            pageSize={pageSize}
            noun="recommendations"
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        </>
      )}
    </div>
  );
}
