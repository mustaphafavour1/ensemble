"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Boxes } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { TableCount } from "@/components/table-count";
import { Pagination } from "@/components/pagination";
import { EmptyState } from "@/components/empty-state";
import { StatusBadge, type Tone } from "@/components/status-badge";
import { StackTag } from "@/components/stack-tag";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAppStore } from "@/lib/store";
import { usePagination } from "@/lib/use-pagination";
import { ENVIRONMENTS, stackForRepo, type EnvironmentStatus } from "@/lib/mock/delivery";
import { formatCountdown } from "@/lib/mock/time";
import { cn } from "@/lib/utils";

const STATUS_META: Record<EnvironmentStatus, { tone: Tone; label: string }> = {
  running: { tone: "success", label: "Running" },
  idle: { tone: "neutral", label: "Idle" },
  provisioning: { tone: "brand", label: "Provisioning" },
  expired: { tone: "danger", label: "Expired" },
};

const PAGE_SIZE = 10;

export default function EnvironmentsPage() {
  const seeded = useAppStore((s) => s.seeded);
  const [filter, setFilter] = useState<EnvironmentStatus | "all">("all");

  const filtered = useMemo(() => {
    if (!seeded) return [];
    return filter === "all" ? ENVIRONMENTS : ENVIRONMENTS.filter((e) => e.status === filter);
  }, [filter, seeded]);

  const { page, setPage, pageCount, pageItems } = usePagination(filtered, PAGE_SIZE);

  const filters: { value: EnvironmentStatus | "all"; label: string }[] = [
    { value: "all", label: "All" },
    { value: "running", label: "Running" },
    { value: "idle", label: "Idle" },
    { value: "provisioning", label: "Provisioning" },
    { value: "expired", label: "Expired" },
  ];

  return (
    <div>
      <PageHeader
        title="Environments"
        description="Active and ephemeral environments, with resource usage and expiry."
      />

      {!seeded ? (
        <EmptyState
          icon={Boxes}
          title="No environments yet"
          description="Turn on demo data in Settings to see active environments."
        />
      ) : (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-1.5">
            {filters.map((f) => {
              const count =
                f.value === "all"
                  ? ENVIRONMENTS.length
                  : ENVIRONMENTS.filter((e) => e.status === f.value).length;
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
                      : "border-border text-ink-300 hover:border-neutral-700 hover:text-ink-100",
                  )}
                >
                  {f.label}
                  <span className="font-mono tabular-nums opacity-70">{count}</span>
                </button>
              );
            })}
          </div>

          <TableCount count={filtered.length} label="environments" />

          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Status</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Stack</TableHead>
                <TableHead>Resources</TableHead>
                <TableHead>Linked branch</TableHead>
                <TableHead className="text-right">Expires</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageItems.map((env, i) => {
                const stack = stackForRepo(env.repoId);
                const meta = STATUS_META[env.status];
                return (
                  <TableRow
                    key={env.id}
                    className={i % 2 === 1 ? "bg-white/[0.012]" : undefined}
                  >
                    <TableCell>
                      <StatusBadge
                        tone={meta.tone}
                        label={meta.label}
                        pulse={env.status === "provisioning"}
                      />
                    </TableCell>
                    <TableCell className="font-mono text-xs text-ink-100">
                      {env.name}
                    </TableCell>
                    <TableCell>
                      <StackTag stack={stack} className="text-2xs text-ink-300" />
                    </TableCell>
                    <TableCell className="font-mono text-2xs text-ink-300 tabular-nums">
                      {env.status === "expired" ? (
                        "—"
                      ) : (
                        <>
                          CPU {env.cpuPct}% · Mem {env.memPct}%
                        </>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-2xs text-ink-500">
                      {env.linkedRunId ? (
                        <Link
                          href={`/runs/${env.linkedRunId}`}
                          className="hover:text-brand-400 hover:underline"
                        >
                          {env.branch}
                        </Link>
                      ) : (
                        env.branch
                      )}
                    </TableCell>
                    <TableCell className="text-right font-mono text-2xs text-ink-300 tabular-nums">
                      {env.persistent ? (
                        <span className="text-ink-500">persistent</span>
                      ) : (
                        formatCountdown(env.expiresAt!)
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {pageItems.length === 0 && (
            <EmptyState
              icon={Boxes}
              title="No environments match this filter"
              description="Try a different status filter."
            />
          )}

          <Pagination
            page={page}
            pageCount={pageCount}
            total={filtered.length}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}
