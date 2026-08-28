"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ThumbsUp, ThumbsDown, Flag, CheckCircle2, MessageSquareText } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { EmptyState } from "@/components/empty-state";
import { DataTable, type DataTableColumn } from "@/components/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useAppStore } from "@/lib/store";
import { ROLES } from "@/lib/roles";
import { getModelById } from "@/lib/mock/models";
import { FEEDBACK_ITEMS, type FeedbackItem, type FeedbackRating } from "@/lib/mock/feedback";
import { formatRelative } from "@/lib/mock/time";
import { cn } from "@/lib/utils";

export default function HumanFeedbackQueuePage() {
  const seeded = useAppStore((s) => s.seeded);
  const role = useAppStore((s) => s.role);
  const [items, setItems] = useState<FeedbackItem[]>(FEEDBACK_ITEMS);
  const [rating, setRating] = useState<FeedbackRating>(null);
  const [flagged, setFlagged] = useState(false);
  const [correction, setCorrection] = useState("");

  const current = items.find((i) => i.rating === null) ?? null;
  const graded = items.filter((i) => i.rating !== null);

  const stats = useMemo(
    () => ({
      remaining: items.length - graded.length,
      gradedTotal: graded.length,
      flagged: graded.filter((i) => i.flaggedForTraining).length,
    }),
    [items, graded],
  );

  function submitGrade() {
    if (!current || !rating) return;
    const grader = ROLES.find((r) => r.id === role)?.name ?? "You";
    setItems((prev) =>
      prev.map((i) =>
        i.id === current.id
          ? {
              ...i,
              rating,
              flaggedForTraining: flagged,
              correction: correction.trim() || null,
              gradedBy: grader,
              gradedAt: Date.now(),
            }
          : i,
      ),
    );
    toast.success(rating === "good" ? "Graded as good" : "Graded as needs work", {
      description: flagged ? "Flagged as a training example." : undefined,
    });
    setRating(null);
    setFlagged(false);
    setCorrection("");
  }

  const columns: DataTableColumn<FeedbackItem>[] = [
    {
      key: "rating",
      label: "Rating",
      render: (i) =>
        i.rating === "good" ? (
          <span className="flex items-center gap-1.5 text-2xs font-medium text-success-300">
            <ThumbsUp className="size-3" /> Good
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-2xs font-medium text-danger-300">
            <ThumbsDown className="size-3" /> Needs work
          </span>
        ),
    },
    { key: "category", label: "Category", className: "text-xs text-ink-muted", render: (i) => i.category },
    {
      key: "prompt",
      label: "Prompt",
      render: (i) => <p className="max-w-[320px] truncate text-xs text-ink-em">{i.prompt}</p>,
    },
    {
      key: "flagged",
      label: "Flagged",
      render: (i) =>
        i.flaggedForTraining ? (
          <span className="flex items-center gap-1 text-2xs text-brand-400">
            <Flag className="size-3" /> Training example
          </span>
        ) : (
          <span className="text-2xs text-ink-faint">—</span>
        ),
    },
    { key: "gradedBy", label: "Graded by", className: "text-xs text-ink-muted", render: (i) => i.gradedBy ?? "—" },
    {
      key: "gradedAt",
      label: "Graded",
      align: "right",
      className: "text-right text-2xs text-ink-faint tabular-nums",
      render: (i) => (i.gradedAt ? formatRelative(i.gradedAt) : "—"),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Human Feedback Queue"
        description="Grade agent output, correct it when it's wrong, and flag the good corrections as training examples."
      />

      {!seeded ? (
        <EmptyState
          icon={MessageSquareText}
          title="No feedback items yet"
          description="Turn on demo data in Settings to see the review queue."
        />
      ) : (
        <>
          <div className="mb-6 grid grid-cols-3 gap-4">
            <StatCard label="Remaining in queue" value={stats.remaining} />
            <StatCard label="Graded" value={stats.gradedTotal} hint={`of ${items.length} total`} />
            <StatCard label="Flagged for training" value={stats.flagged} />
          </div>

          {current ? (
            <Card className="mb-6">
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <CardTitle>Reviewing</CardTitle>
                <span className="rounded-full border border-border px-2 py-0.5 text-2xs text-ink-muted">
                  {current.category}
                </span>
              </CardHeader>
              <CardContent>
                <p className="text-2xs text-ink-faint">
                  {getModelById(current.modelId)?.name ?? current.modelId}
                </p>
                <div className="mt-3 rounded-md border border-border bg-surface/60 p-3">
                  <p className="text-2xs font-medium tracking-wide text-ink-faint uppercase">Prompt</p>
                  <p className="mt-1.5 text-xs whitespace-pre-wrap text-ink-em">{current.prompt}</p>
                </div>
                <div className="mt-3 rounded-md border border-border bg-surface/60 p-3">
                  <p className="text-2xs font-medium tracking-wide text-ink-faint uppercase">Model output</p>
                  <p className="mt-1.5 font-mono text-xs whitespace-pre-wrap text-ink-em">{current.output}</p>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setRating("good")}
                    className={cn(
                      "flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors",
                      rating === "good"
                        ? "border-success-500/30 bg-success-500/10 text-success-300"
                        : "border-border text-ink-muted hover:border-neutral-700 hover:text-ink-em",
                    )}
                  >
                    <ThumbsUp className="size-3.5" />
                    Good
                  </button>
                  <button
                    type="button"
                    onClick={() => setRating("bad")}
                    className={cn(
                      "flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors",
                      rating === "bad"
                        ? "border-danger-500/30 bg-danger-500/10 text-danger-300"
                        : "border-border text-ink-muted hover:border-neutral-700 hover:text-ink-em",
                    )}
                  >
                    <ThumbsDown className="size-3.5" />
                    Needs work
                  </button>

                  <div className="ml-4 flex items-center gap-2">
                    <Switch id="flag-training" checked={flagged} onCheckedChange={setFlagged} />
                    <Label htmlFor="flag-training" className="text-xs text-ink-muted">
                      Flag as training example
                    </Label>
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-1.5">
                  <Label htmlFor="correction">Correction (optional)</Label>
                  <Textarea
                    id="correction"
                    placeholder="Provide the corrected response, if the output needs one…"
                    value={correction}
                    onChange={(e) => setCorrection(e.target.value)}
                    rows={2}
                  />
                </div>

                <Button className="mt-4" disabled={!rating} onClick={submitGrade}>
                  Submit grade &amp; next
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="mb-6">
              <CardContent>
                <div className="flex flex-col items-center py-10 text-center">
                  <CheckCircle2 className="size-8 text-success-400" strokeWidth={1.5} />
                  <p className="mt-3 text-sm text-ink-em">Queue clear</p>
                  <p className="mt-1 text-2xs text-ink-muted">Every item has been graded.</p>
                </div>
              </CardContent>
            </Card>
          )}

          {graded.length > 0 && <DataTable columns={columns} data={graded} getRowKey={(i) => i.id} />}
        </>
      )}
    </div>
  );
}
