"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ListTodo, Send } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { TableCount } from "@/components/table-count";
import { Pagination } from "@/components/pagination";
import { EmptyState } from "@/components/empty-state";
import { StatusBadge, type Tone } from "@/components/status-badge";
import { DataTable, type DataTableColumn } from "@/components/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppStore } from "@/lib/store";
import { usePagination } from "@/lib/use-pagination";
import { TASKS, type EngTask, type TaskPriority, type TaskStatus } from "@/lib/mock/tasks";
import { AGENTS, REPOS, MODELS, type AgentKind } from "@/lib/mock/catalog";
import { ROLES } from "@/lib/roles";
import { formatRelative } from "@/lib/mock/time";
import { cn } from "@/lib/utils";

const AGENT_KINDS: AgentKind[] = Array.from(new Set(AGENTS.map((a) => a.kind)));

const STATUS_META: Record<TaskStatus, { tone: Tone; label: string }> = {
  pending: { tone: "neutral", label: "Pending" },
  assigned: { tone: "brand", label: "Assigned" },
  "in-progress": { tone: "brand", label: "In Progress" },
  completed: { tone: "success", label: "Completed" },
  failed: { tone: "danger", label: "Failed" },
};

const PRIORITY_META: Record<TaskPriority, { label: string; className: string }> = {
  low: { label: "Low", className: "text-ink-faint" },
  medium: { label: "Medium", className: "text-ink-muted" },
  high: { label: "High", className: "font-medium text-warning-300" },
  urgent: { label: "Urgent", className: "font-medium text-danger-300" },
};

const STATUS_FILTERS: { value: TaskStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "assigned", label: "Assigned" },
  { value: "in-progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "failed", label: "Failed" },
];

const PAGE_SIZE = 10;

export default function ActiveTasksPage() {
  const seeded = useAppStore((s) => s.seeded);
  const role = useAppStore((s) => s.role);
  const [tasks, setTasks] = useState<EngTask[]>(TASKS);
  const [filter, setFilter] = useState<TaskStatus | "all">("all");

  const [title, setTitle] = useState("");
  const [repoId, setRepoId] = useState(REPOS[0].id);
  const [agentKind, setAgentKind] = useState<AgentKind>(AGENT_KINDS[0]);
  const [model, setModel] = useState(`${MODELS[0].provider} — ${MODELS[0].name}`);
  const [priority, setPriority] = useState<TaskPriority>("medium");

  const filtered = useMemo(() => {
    if (!seeded) return [];
    return filter === "all" ? tasks : tasks.filter((t) => t.status === filter);
  }, [tasks, filter, seeded]);

  const { page, setPage, pageSize, setPageSize, pageCount, pageItems } = usePagination(filtered, PAGE_SIZE);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    const requester = ROLES.find((r) => r.id === role)?.name ?? "You";
    const task: EngTask = {
      id: `task_${Math.random().toString(36).slice(2, 9)}`,
      title: title.trim(),
      description: "Submitted from Active Tasks.",
      repoId,
      agentKind,
      targetModel: model,
      priority,
      status: "pending",
      requestedBy: requester,
      createdAt: Date.now(),
    };
    setTasks((prev) => [task, ...prev]);
    setFilter("all");
    setPage(1);
    setTitle("");
    toast.success("Task queued", {
      description: `${agentKind} agent will pick it up from the queue shortly.`,
    });
  }

  const columns: DataTableColumn<EngTask>[] = [
    {
      key: "status",
      label: "Status",
      render: (t) => (
        <StatusBadge
          tone={STATUS_META[t.status].tone}
          label={STATUS_META[t.status].label}
          pulse={t.status === "in-progress"}
        />
      ),
    },
    {
      key: "task",
      label: "Task",
      render: (t) => (
        <div className="max-w-[320px]">
          <p className="truncate text-xs text-ink-em">{t.title}</p>
          <p className="mt-0.5 truncate text-2xs text-ink-faint">{t.description}</p>
        </div>
      ),
    },
    {
      key: "agent",
      label: "Agent type",
      className: "text-xs text-ink-muted",
      render: (t) => t.agentKind,
    },
    {
      key: "repo",
      label: "Repo",
      className: "font-mono text-xs text-ink-em",
      render: (t) => REPOS.find((r) => r.id === t.repoId)?.name ?? t.repoId,
    },
    {
      key: "model",
      label: "Target model",
      className: "text-2xs text-ink-faint",
      render: (t) => t.targetModel,
    },
    {
      key: "priority",
      label: "Priority",
      render: (t) => (
        <span className={cn("text-xs", PRIORITY_META[t.priority].className)}>
          {PRIORITY_META[t.priority].label}
        </span>
      ),
    },
    {
      key: "requester",
      label: "Requested by",
      className: "text-xs text-ink-muted",
      render: (t) => t.requestedBy,
    },
    {
      key: "created",
      label: "Created",
      align: "right",
      className: "text-right text-2xs text-ink-faint tabular-nums",
      render: (t) => formatRelative(t.createdAt),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Active Tasks"
        description="Describe what needs doing — an agent picks it up from the queue below."
      />

      {!seeded ? (
        <EmptyState
          icon={ListTodo}
          title="No tasks yet"
          description="Turn on demo data in Settings to see the task queue."
        />
      ) : (
        <>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>New task</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="task-title">Description</Label>
                  <Textarea
                    id="task-title"
                    placeholder="e.g. Add retry logic to the payment webhook handler"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    rows={2}
                    required
                  />
                </div>

                <div className="grid grid-cols-4 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="task-repo">Repo</Label>
                    <Select value={repoId} onValueChange={(v) => v && setRepoId(v)}>
                      <SelectTrigger id="task-repo" className="w-full">
                        <SelectValue>
                          {(v: string) => REPOS.find((r) => r.id === v)?.name ?? v}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {REPOS.map((r) => (
                          <SelectItem key={r.id} value={r.id}>
                            {r.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="task-agent">Agent type</Label>
                    <Select value={agentKind} onValueChange={(v) => v && setAgentKind(v as AgentKind)}>
                      <SelectTrigger id="task-agent" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {AGENT_KINDS.map((k) => (
                          <SelectItem key={k} value={k}>
                            {k}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="task-model">Target model</Label>
                    <Select value={model} onValueChange={(v) => v && setModel(v)}>
                      <SelectTrigger id="task-model" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {MODELS.map((m) => (
                          <SelectItem key={m.name} value={`${m.provider} — ${m.name}`}>
                            {m.provider} — {m.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="task-priority">Priority</Label>
                    <Select value={priority} onValueChange={(v) => v && setPriority(v as TaskPriority)}>
                      <SelectTrigger id="task-priority" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(Object.keys(PRIORITY_META) as TaskPriority[]).map((p) => (
                          <SelectItem key={p} value={p}>
                            {PRIORITY_META[p].label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button type="submit" className="self-start">
                  <Send className="size-3.5" />
                  Queue task
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="mb-4 flex flex-wrap items-center gap-1.5">
            {STATUS_FILTERS.map((f) => {
              const count = f.value === "all" ? tasks.length : tasks.filter((t) => t.status === f.value).length;
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

          <TableCount count={filtered.length} label="tasks" />

          <DataTable columns={columns} data={pageItems} getRowKey={(t) => t.id} />

          {pageItems.length === 0 && (
            <EmptyState
              icon={ListTodo}
              title="No tasks match this filter"
              description="Try a different status filter."
            />
          )}

          <Pagination
            page={page}
            pageCount={pageCount}
            total={filtered.length}
            pageSize={pageSize}
            noun="tasks"
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        </>
      )}
    </div>
  );
}
