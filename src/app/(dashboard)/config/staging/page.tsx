"use client";

import { useState } from "react";
import { toast } from "sonner";
import { FlaskConical, ArrowUpCircle } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { StatusBadge } from "@/components/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MODEL_VERSIONS } from "@/lib/mock/models";
import { formatDate } from "@/lib/mock/time";

interface StagingEntry {
  modelId: string;
  testerGroup: string;
  feedbackScorePct: number;
  promoted: boolean;
}

const TESTER_GROUPS = ["Internal QA", "Research Team", "Beta Partners"];

function buildInitialStaging(): StagingEntry[] {
  return MODEL_VERSIONS.filter((m) => m.visibility === "staged").map((m, i) => ({
    modelId: m.id,
    testerGroup: TESTER_GROUPS[i % TESTER_GROUPS.length],
    feedbackScorePct: Math.round(m.benchmarkScore),
    promoted: false,
  }));
}

export default function InternalStagingPage() {
  const [entries, setEntries] = useState<StagingEntry[]>(buildInitialStaging);

  function promote(modelId: string) {
    const model = MODEL_VERSIONS.find((m) => m.id === modelId);
    setEntries((prev) => prev.map((e) => (e.modelId === modelId ? { ...e, promoted: true } : e)));
    toast.success(`${model?.name} promoted to public`, {
      description: "It will appear as Public in Model Fleet → Public vs Internal Availability.",
    });
  }

  const active = entries.filter((e) => !e.promoted);
  const promoted = entries.filter((e) => e.promoted);

  return (
    <div>
      <PageHeader
        title="Internal Testing & Staging"
        description="Models currently in staged rollout — who's testing them, and whether they're ready for public promotion."
      />

      {active.length === 0 && promoted.length === 0 ? (
        <EmptyState
          icon={FlaskConical}
          title="Nothing in staging"
          description="No models are currently in the staged rollout queue."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {active.map((entry) => {
            const model = MODEL_VERSIONS.find((m) => m.id === entry.modelId)!;
            return (
              <Card key={entry.modelId}>
                <CardContent className="flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <StatusBadge tone="brand" label="Staged" />
                      <p className="font-mono text-xs text-ink-em">{model.name}</p>
                    </div>
                    <p className="mt-1.5 text-2xs text-ink-muted">{model.description}</p>
                    <div className="mt-2 flex items-center gap-3 text-2xs text-ink-faint">
                      <span>Tester group: {entry.testerGroup}</span>
                      <span>Staged since {formatDate(model.releasedAt)}</span>
                      <span className={entry.feedbackScorePct >= 80 ? "text-success-300" : "text-warning-300"}>
                        {entry.feedbackScorePct}% tester approval
                      </span>
                    </div>
                  </div>
                  <Button onClick={() => promote(entry.modelId)}>
                    <ArrowUpCircle className="size-3.5" />
                    Promote to public
                  </Button>
                </CardContent>
              </Card>
            );
          })}

          {promoted.length > 0 && (
            <>
              <p className="mt-2 text-2xs font-medium tracking-[0.08em] text-ink-faint uppercase">
                Promoted this session
              </p>
              {promoted.map((entry) => {
                const model = MODEL_VERSIONS.find((m) => m.id === entry.modelId)!;
                return (
                  <Card key={entry.modelId} className="opacity-70">
                    <CardContent className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <StatusBadge tone="success" label="Public" />
                        <p className="font-mono text-xs text-ink-em">{model.name}</p>
                      </div>
                      <span className="text-2xs text-ink-faint">Promoted from {entry.testerGroup}</span>
                    </CardContent>
                  </Card>
                );
              })}
            </>
          )}
        </div>
      )}
    </div>
  );
}
