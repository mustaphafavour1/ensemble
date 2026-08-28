"use client";

import { useState } from "react";
import { Sparkles, KanbanSquare } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { AgentTag } from "@/components/agent-tag";
import { useAppStore } from "@/lib/store";
import { SPECS, type Spec, type SpecStatus } from "@/lib/mock/trust";
import { AGENTS, REPOS } from "@/lib/mock/catalog";
import { formatRelative } from "@/lib/mock/time";
import { cn } from "@/lib/utils";

const COLUMNS: { status: SpecStatus; label: string }[] = [
  { status: "proposed", label: "Proposed" },
  { status: "approved", label: "Approved" },
  { status: "in-progress", label: "In Progress" },
  { status: "needs-changes", label: "Needs Changes" },
];

const RISK_CLASSES: Record<Spec["riskLevel"], string> = {
  low: "text-success-300 bg-success-500/10 border-success-500/25",
  medium: "text-warning-300 bg-warning-500/10 border-warning-500/25",
  high: "text-danger-300 bg-danger-500/10 border-danger-500/25",
};

function SpecCard({
  spec,
  onDragStart,
}: {
  spec: Spec;
  onDragStart: (e: React.DragEvent, id: string) => void;
}) {
  const agent = AGENTS.find((a) => a.id === spec.agentId)!;
  const repo = REPOS.find((r) => r.id === spec.repoId)!;

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, spec.id)}
      className="cursor-grab rounded-md border border-border bg-surface p-3 shadow-sm transition-colors active:cursor-grabbing hover:border-neutral-700"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium text-ink-em">{spec.title}</p>
        <span
          className={cn(
            "shrink-0 rounded-full border px-1.5 py-px text-[9px] font-medium uppercase",
            RISK_CLASSES[spec.riskLevel],
          )}
        >
          {spec.riskLevel}
        </span>
      </div>
      <p className="mt-1.5 line-clamp-2 text-2xs leading-relaxed text-ink-muted">
        {spec.summary}
      </p>
      <div className="mt-2.5 flex items-center justify-between text-2xs text-ink-faint">
        <AgentTag name={agent.name} className="text-2xs" />
        <span className="font-mono">{repo.name}</span>
      </div>
      <div className="mt-2.5 flex items-start gap-1.5 rounded border border-brand-500/15 bg-brand-500/[0.04] px-2 py-1.5">
        <Sparkles className="mt-0.5 size-2.5 shrink-0 text-brand-400" />
        <p className="text-[9.5px] leading-relaxed text-ink-muted">{spec.qualityNote}</p>
      </div>
      <p className="mt-2 text-[9px] text-ink-faint">
        {formatRelative(spec.createdAt)}
      </p>
    </div>
  );
}

export default function SpecPlanReviewPage() {
  const seeded = useAppStore((s) => s.seeded);
  const [specs, setSpecs] = useState<Spec[]>(SPECS);
  const [dragOverCol, setDragOverCol] = useState<SpecStatus | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDrop = (e: React.DragEvent, status: SpecStatus) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain");
    setSpecs((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
    setDragOverCol(null);
  };

  const list = seeded ? specs : [];

  return (
    <div>
      <PageHeader
        title="Spec & Plan Review"
        description="Approve intent before an agent executes — drag a card to move it through review."
      />

      {!seeded ? (
        <EmptyState
          icon={KanbanSquare}
          title="No specs to review"
          description="Turn on demo data in Settings to see the review board."
        />
      ) : (
        <div className="grid grid-cols-4 gap-4">
          {COLUMNS.map((col) => {
            const items = list.filter((s) => s.status === col.status);
            return (
              <div
                key={col.status}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverCol(col.status);
                }}
                onDragLeave={() => setDragOverCol((c) => (c === col.status ? null : c))}
                onDrop={(e) => handleDrop(e, col.status)}
                className={cn(
                  "flex flex-col rounded-lg border border-border bg-surface/40 p-2.5 transition-colors",
                  dragOverCol === col.status && "border-brand-500/40 bg-brand-500/[0.03]",
                )}
              >
                <div className="mb-2.5 flex items-center justify-between px-1">
                  <h2 className="text-2xs font-medium tracking-wide text-ink-em uppercase">
                    {col.label}
                  </h2>
                  <span className="text-2xs text-ink-faint">{items.length}</span>
                </div>
                <div className="flex max-h-[calc(100dvh-var(--header-height)-var(--content-offset)-8rem)] flex-col gap-2.5 overflow-y-auto">
                  {items.map((spec) => (
                    <SpecCard key={spec.id} spec={spec} onDragStart={handleDragStart} />
                  ))}
                  {items.length === 0 && (
                    <div className="rounded-md border border-dashed border-border py-8 text-center text-2xs text-ink-faint">
                      Drop here
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
