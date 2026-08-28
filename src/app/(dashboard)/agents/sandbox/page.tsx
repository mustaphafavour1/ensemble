"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Boxes, Plus, ArrowUpRight } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { TableCount } from "@/components/table-count";
import { Pagination } from "@/components/pagination";
import { EmptyState } from "@/components/empty-state";
import { StatusBadge, type Tone } from "@/components/status-badge";
import { StackTag } from "@/components/stack-tag";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { NewEnvironmentDialog } from "@/components/agents/new-environment-dialog";
import { useAppStore } from "@/lib/store";
import { usePagination } from "@/lib/use-pagination";
import { ENVIRONMENTS, stackForRepo, type EnvironmentStatus } from "@/lib/mock/delivery";
import { STACK_TEMPLATES, STACKS } from "@/lib/mock/catalog";
import { formatCountdown } from "@/lib/mock/time";
import { cn } from "@/lib/utils";

const STATUS_META: Record<EnvironmentStatus, { tone: Tone; label: string }> = {
  running: { tone: "success", label: "Running" },
  idle: { tone: "neutral", label: "Idle" },
  provisioning: { tone: "brand", label: "Provisioning" },
  expired: { tone: "danger", label: "Expired" },
};

const PAGE_SIZE = 10;

export default function SandboxPlaygroundPage() {
  const seeded = useAppStore((s) => s.seeded);
  const [filter, setFilter] = useState<EnvironmentStatus | "all">("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [defaultTemplateId, setDefaultTemplateId] = useState<string | undefined>();

  const filtered = useMemo(() => {
    if (!seeded) return [];
    return filter === "all" ? ENVIRONMENTS : ENVIRONMENTS.filter((e) => e.status === filter);
  }, [filter, seeded]);

  const { page, setPage, pageSize, setPageSize, pageCount, pageItems } = usePagination(filtered, PAGE_SIZE);

  const filters: { value: EnvironmentStatus | "all"; label: string }[] = [
    { value: "all", label: "All" },
    { value: "running", label: "Running" },
    { value: "idle", label: "Idle" },
    { value: "provisioning", label: "Provisioning" },
    { value: "expired", label: "Expired" },
  ];

  function openDialog(templateId?: string) {
    setDefaultTemplateId(templateId);
    setDialogOpen(true);
  }

  return (
    <div>
      <PageHeader
        title="Sandbox Playground"
        description="Spin up an isolated environment from a template, watch it run, and tear it down when you're done."
        actions={
          <Button onClick={() => openDialog(undefined)}>
            <Plus className="size-3.5" />
            New Environment
          </Button>
        }
      />

      {!seeded ? (
        <EmptyState
          icon={Boxes}
          title="No environments yet"
          description="Turn on demo data in Settings, or spin up your first environment from a template."
        />
      ) : (
        <>
          <h2 className="mb-3 text-2xs font-medium tracking-[0.08em] text-ink-faint uppercase">
            Templates
          </h2>
          <div className="mb-8 grid grid-cols-4 gap-4">
            {STACK_TEMPLATES.map((tpl) => {
              const stack = STACKS[tpl.stackId];
              return (
                <Card key={tpl.id} className="transition-colors hover:border-neutral-700">
                  <CardContent className="flex h-full flex-col">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="size-2.5 shrink-0 rounded-full"
                        style={{ background: stack.color }}
                      />
                      <p className="text-sm text-ink-em">{stack.language}</p>
                    </div>
                    <p className="mt-0.5 text-2xs text-ink-faint">{stack.framework}</p>
                    <p className="mt-3 flex-1 text-2xs leading-relaxed text-ink-muted">
                      {tpl.tagline}
                    </p>
                    <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                      <p className="text-2xs text-ink-faint">
                        <span className="text-ink-muted tabular-nums">
                          {tpl.usageCount}
                        </span>{" "}
                        environments spun up
                      </p>
                      <button
                        type="button"
                        onClick={() => openDialog(tpl.id)}
                        className="flex items-center gap-1 text-2xs font-medium text-brand-400 hover:underline"
                      >
                        Use template
                        <ArrowUpRight className="size-3" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <h2 className="mb-3 text-2xs font-medium tracking-[0.08em] text-ink-faint uppercase">
            Environments
          </h2>

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
                      : "border-border text-ink-muted hover:border-neutral-700 hover:text-ink-em",
                  )}
                >
                  {f.label}
                  <span className="tabular-nums opacity-70">{count}</span>
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
                    <TableCell className="text-xs text-ink-em">
                      {env.name}
                    </TableCell>
                    <TableCell>
                      <StackTag stack={stack} className="text-2xs text-ink-muted" />
                    </TableCell>
                    <TableCell className="text-2xs text-ink-muted tabular-nums">
                      {env.status === "expired" ? (
                        "—"
                      ) : (
                        <>
                          CPU {env.cpuPct}% · Mem {env.memPct}%
                        </>
                      )}
                    </TableCell>
                    <TableCell className="text-2xs text-ink-faint">
                      {env.linkedRunId ? (
                        <Link
                          href={`/agents/runs/${env.linkedRunId}`}
                          className="hover:text-brand-400 hover:underline"
                        >
                          {env.branch}
                        </Link>
                      ) : (
                        env.branch
                      )}
                    </TableCell>
                    <TableCell className="text-right text-2xs text-ink-muted tabular-nums">
                      {env.persistent ? (
                        <span className="text-ink-faint">persistent</span>
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
            pageSize={pageSize}
            noun="environments"
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        </>
      )}

      <NewEnvironmentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        defaultTemplateId={defaultTemplateId}
      />
    </div>
  );
}
