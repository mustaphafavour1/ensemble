"use client";

import { useMemo, useState } from "react";
import { Activity } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Pagination } from "@/components/pagination";
import { ActivityFeed } from "@/components/overview/activity-feed";
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
import { REPOS } from "@/lib/mock/catalog";
import { TEAMS, REPO_TEAM, type TeamId } from "@/lib/mock/teams";

const PAGE_SIZE = 20;

function teamIdForRepoName(repoName: string): TeamId | null {
  const repo = REPOS.find((r) => r.name === repoName);
  return repo ? (REPO_TEAM[repo.id] ?? null) : null;
}

export default function TeamActivityPage() {
  const seeded = useAppStore((s) => s.seeded);
  const [teamFilter, setTeamFilter] = useState<TeamId | "all">("all");
  const [selected, setSelected] = useState<ActivityItem | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const feed = useMemo(() => (seeded ? getActivityFeed(500) : []), [seeded]);

  const filtered = useMemo(() => {
    if (teamFilter === "all") return feed;
    return feed.filter((item) => teamIdForRepoName(item.repoName) === teamFilter);
  }, [feed, teamFilter]);

  const { page, setPage, pageSize, setPageSize, pageCount, pageItems } = usePagination(filtered, PAGE_SIZE);

  return (
    <div>
      <PageHeader
        title="Team Activity"
        description="What every internal team's agents are doing right now, and everything they've shipped before that."
      />

      {!seeded ? (
        <EmptyState
          icon={Activity}
          title="No activity yet"
          description="Turn on demo data in Settings to see team activity."
        />
      ) : (
        <>
          <div className="mb-4 flex items-center gap-2">
            <Select
              value={teamFilter}
              onValueChange={(v) => {
                if (!v) return;
                setTeamFilter(v as TeamId | "all");
                setPage(1);
              }}
            >
              <SelectTrigger className="w-56">
                <SelectValue>
                  {(v: string) => (v === "all" ? "All teams" : (TEAMS.find((t) => t.id === v)?.name ?? v))}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All teams</SelectItem>
                {TEAMS.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="ml-auto text-2xs text-ink-faint">{filtered.length} events</span>
          </div>

          <ActivityFeed
            items={pageItems}
            onSelect={(item) => {
              setSelected(item);
              setDetailsOpen(true);
            }}
          />

          {filtered.length === 0 && (
            <EmptyState icon={Activity} title="Nothing here" description="No activity for this team yet." />
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

          <ActivityDetailsDialog item={selected} open={detailsOpen} onOpenChange={setDetailsOpen} />
        </>
      )}
    </div>
  );
}
