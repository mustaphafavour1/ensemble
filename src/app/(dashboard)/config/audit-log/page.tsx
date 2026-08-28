"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  GitCommitHorizontal,
  CheckCircle2,
  MessageSquareWarning,
  Rocket,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { TableCount } from "@/components/table-count";
import { Pagination } from "@/components/pagination";
import { EmptyState } from "@/components/empty-state";
import { AgentTag } from "@/components/agent-tag";
import { useAppStore } from "@/lib/store";
import { usePagination } from "@/lib/use-pagination";
import { PROVENANCE, type ProvenanceEventType } from "@/lib/mock/trust";
import { messageFor } from "@/lib/mock/activity";
import { AGENTS, REPOS } from "@/lib/mock/catalog";
import { formatDateTime } from "@/lib/mock/time";
import { cn } from "@/lib/utils";

const ICONS: Record<ProvenanceEventType, LucideIcon> = {
  commit: GitCommitHorizontal,
  approval: CheckCircle2,
  review: MessageSquareWarning,
  deploy: Rocket,
};

const FILTERS: { value: ProvenanceEventType | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "commit", label: "Commits" },
  { value: "approval", label: "Approvals" },
  { value: "review", label: "Review requests" },
  { value: "deploy", label: "Deploys" },
];

const PAGE_SIZE = 12;

export default function AuditLogPage() {
  const seeded = useAppStore((s) => s.seeded);
  const [filter, setFilter] = useState<ProvenanceEventType | "all">("all");

  const filtered = useMemo(() => {
    if (!seeded) return [];
    return filter === "all" ? PROVENANCE : PROVENANCE.filter((e) => e.type === filter);
  }, [filter, seeded]);

  const { page, setPage, pageSize, setPageSize, pageCount, pageItems } = usePagination(filtered, PAGE_SIZE);

  return (
    <div>
      <PageHeader
        title="Audit Log"
        description="A chronological record of who — human or agent — touched what, and how confident the system was."
      />

      {!seeded ? (
        <EmptyState
          icon={ShieldCheck}
          title="No provenance events yet"
          description="Turn on demo data in Settings to see the trust timeline."
        />
      ) : (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-1.5">
            {FILTERS.map((f) => {
              const count =
                f.value === "all"
                  ? PROVENANCE.length
                  : PROVENANCE.filter((e) => e.type === f.value).length;
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

          <TableCount count={filtered.length} label="events" />

          {pageItems.length === 0 ? (
            <EmptyState
              icon={ShieldCheck}
              title="No events match this filter"
              description="Try a different event type."
            />
          ) : (
            <div className="relative">
              <div className="absolute top-1 bottom-1 left-[15px] w-px bg-border" />
              <ul className="flex flex-col gap-5">
                {pageItems.map((event) => {
                  const Icon = ICONS[event.type];
                  const agent = AGENTS.find((a) => a.id === event.agentId)!;
                  const repo = REPOS.find((r) => r.id === event.repoId)!;
                  return (
                    <li key={event.id} className="relative flex gap-4">
                      <div className="relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-canvas text-ink-muted">
                        <Icon className="size-3.5" strokeWidth={1.75} />
                      </div>
                      <div className="flex-1 pt-1 pb-1">
                        <p className="text-xs text-ink-em">{messageFor(event)}</p>
                        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-2xs text-ink-faint">
                          <span className="">{formatDateTime(event.timestamp)}</span>
                          <AgentTag name={agent.name} className="text-2xs" />
                          <span className="font-mono">{repo.name}</span>
                          {event.confidencePct != null && (
                            <span className="text-ink-muted">
                              {event.confidencePct}% confidence
                            </span>
                          )}
                          {event.runId && (
                            <Link
                              href={`/agents/runs/${event.runId}`}
                              className="text-brand-400 hover:underline"
                            >
                              View run →
                            </Link>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          <Pagination
            page={page}
            pageCount={pageCount}
            total={filtered.length}
            pageSize={pageSize}
            noun="events"
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        </>
      )}
    </div>
  );
}
