"use client";

import { useMemo, useState } from "react";
import { Activity } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Pagination } from "@/components/pagination";
import { ActivityFeed, TYPE_META } from "@/components/overview/activity-feed";
import { ActivityDetailsDialog } from "@/components/overview/activity-details-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppStore } from "@/lib/store";
import { usePagination } from "@/lib/use-pagination";
import { getActivityFeed, type ActivityItem } from "@/lib/mock/activity";
import { AGENTS, REPOS } from "@/lib/mock/catalog";
import { REFERENCE_NOW } from "@/lib/mock/time";

const PAGE_SIZE = 20;

function startOfDay(timestamp: number): number {
  const d = new Date(timestamp);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

function dateGroupLabel(timestamp: number): string {
  const diffDays = Math.round((startOfDay(REFERENCE_NOW) - startOfDay(timestamp)) / 86_400_000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return new Date(timestamp).toLocaleDateString("en-US", { month: "long", day: "numeric" });
}

function groupByDate(items: ActivityItem[]): { label: string; items: ActivityItem[] }[] {
  const groups: { label: string; items: ActivityItem[] }[] = [];
  for (const item of items) {
    const label = dateGroupLabel(item.timestamp);
    const last = groups[groups.length - 1];
    if (last && last.label === label) {
      last.items.push(item);
    } else {
      groups.push({ label, items: [item] });
    }
  }
  return groups;
}

export default function LiveActivityFeedPage() {
  const seeded = useAppStore((s) => s.seeded);
  const [repoFilter, setRepoFilter] = useState("all");
  const [agentFilter, setAgentFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selected, setSelected] = useState<ActivityItem | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const feed = useMemo(() => (seeded ? getActivityFeed(500) : []), [seeded]);

  const filtered = useMemo(
    () =>
      feed.filter((item) => {
        if (repoFilter !== "all" && item.repoName !== repoFilter) return false;
        if (agentFilter !== "all" && item.agentId !== agentFilter) return false;
        if (typeFilter !== "all" && item.type !== typeFilter) return false;
        return true;
      }),
    [feed, repoFilter, agentFilter, typeFilter],
  );

  const { page, setPage, pageSize, setPageSize, pageCount, pageItems } = usePagination(filtered, PAGE_SIZE);
  const grouped = useMemo(() => groupByDate(pageItems), [pageItems]);
  const hasFilters = repoFilter !== "all" || agentFilter !== "all" || typeFilter !== "all";

  return (
    <div>
      <PageHeader
        title="Live Activity Feed"
        description="Every commit, approval, review, deploy, and everything in between, across the agent fleet — as it happens."
        actions={
          <span className="flex items-center gap-1.5 rounded-full border border-brand-500/25 bg-brand-500/10 px-2.5 py-1 text-2xs font-medium text-brand-400">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand-500/60" />
              <span className="relative inline-flex size-1.5 rounded-full bg-brand-500" />
            </span>
            Live
          </span>
        }
      />

      {!seeded ? (
        <EmptyState
          icon={Activity}
          title="No activity yet"
          description="Turn on demo data in Settings to see the live feed."
        />
      ) : (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <Select
              value={repoFilter}
              onValueChange={(v) => {
                if (!v) return;
                setRepoFilter(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-44">
                <SelectValue>{(v: string) => (v === "all" ? "All repos" : v)}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All repos</SelectItem>
                {REPOS.map((r) => (
                  <SelectItem key={r.id} value={r.name}>
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={agentFilter}
              onValueChange={(v) => {
                if (!v) return;
                setAgentFilter(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-44">
                <SelectValue>
                  {(v: string) => (v === "all" ? "All agents" : (AGENTS.find((a) => a.id === v)?.name ?? v))}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All agents</SelectItem>
                {AGENTS.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={typeFilter}
              onValueChange={(v) => {
                if (!v) return;
                setTypeFilter(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-44">
                <SelectValue>
                  {(v: string) => (v === "all" ? "All event types" : (TYPE_META[v as ActivityItem["type"]]?.label ?? v))}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All event types</SelectItem>
                {Object.entries(TYPE_META).map(([type, meta]) => (
                  <SelectItem key={type} value={type}>
                    {meta.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {hasFilters && (
              <button
                type="button"
                onClick={() => {
                  setRepoFilter("all");
                  setAgentFilter("all");
                  setTypeFilter("all");
                  setPage(1);
                }}
                className="text-2xs font-medium text-ink-faint hover:text-ink-em"
              >
                Clear filters
              </button>
            )}

            <span className="ml-auto text-2xs text-ink-faint">{filtered.length} events</span>
          </div>

          <div>
            {grouped.map((group) => (
              <div key={group.label} className="mb-5">
                <p className="mb-2 text-2xs font-medium tracking-[0.08em] text-ink-faint uppercase">
                  {group.label}
                </p>
                <ActivityFeed
                  items={group.items}
                  onSelect={(item) => {
                    setSelected(item);
                    setDetailsOpen(true);
                  }}
                />
              </div>
            ))}

            {filtered.length === 0 && (
              <EmptyState
                icon={Activity}
                title="Nothing matches these filters"
                description="Try clearing a filter to see more activity."
              />
            )}
          </div>

          <Pagination
            page={page}
            pageCount={pageCount}
            total={filtered.length}
            pageSize={pageSize}
            noun="events"
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />

          <ActivityDetailsDialog item={selected} open={detailsOpen} onOpenChange={setDetailsOpen} />
        </>
      )}
    </div>
  );
}
