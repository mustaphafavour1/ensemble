"use client";

import { useState } from "react";
import {
  Wand2,
  FlaskConical,
  Bug,
  BookOpen,
  ArrowRightLeft,
  ShieldCheck,
  Gauge,
  Package,
  type LucideIcon,
  Bot,
  Plus,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { NewAgentDialog } from "@/components/agents/new-agent-dialog";
import { useAppStore } from "@/lib/store";
import { AGENTS, type AgentKind } from "@/lib/mock/catalog";
import { getAgentStats } from "@/lib/mock/agent-stats";
import { formatDuration } from "@/lib/mock/time";

const AGENT_ICONS: Record<AgentKind, LucideIcon> = {
  Refactor: Wand2,
  "Test-Writer": FlaskConical,
  "Bug-Fix": Bug,
  Docs: BookOpen,
  Migration: ArrowRightLeft,
  Security: ShieldCheck,
  Performance: Gauge,
  Dependency: Package,
};

export default function AgentFleetPage() {
  const seeded = useAppStore((s) => s.seeded);
  const [newAgentOpen, setNewAgentOpen] = useState(false);

  return (
    <div>
      <PageHeader
        title="Code Agent Fleet"
        description="Every configured coding agent, its permission boundary, and how it's performing this month."
        actions={
          <Button onClick={() => setNewAgentOpen(true)}>
            <Plus className="size-3.5" />
            New Agent
          </Button>
        }
      />

      {!seeded ? (
        <EmptyState
          icon={Bot}
          title="No agents configured"
          description="Turn on demo data in Settings, or create your first agent to get started."
        />
      ) : (
        <div className="grid grid-cols-4 gap-4">
          {AGENTS.map((agent) => {
            const Icon = AGENT_ICONS[agent.kind];
            const stats = getAgentStats(agent.id);
            const isActive = stats.activeRuns > 0;

            return (
              <Card key={agent.id} className="transition-colors hover:border-neutral-700">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex size-8 items-center justify-center rounded-md border border-border bg-surface text-brand-500">
                      <Icon className="size-4" strokeWidth={1.75} />
                    </div>
                    <StatusBadge
                      tone={isActive ? "brand" : "neutral"}
                      label={isActive ? "Active" : "Idle"}
                      pulse={isActive}
                    />
                  </div>
                  <div className="pt-2">
                    <p className="font-mono text-sm text-ink-em">{agent.name}</p>
                    <p className="mt-0.5 text-2xs text-ink-faint">
                      {agent.model.name} · {agent.model.provider}
                    </p>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-2 text-2xs leading-relaxed text-ink-muted">
                    {agent.scope}
                  </p>

                  <div className="mt-4">
                    <div className="mb-1 flex items-center justify-between text-2xs">
                      <span className="text-ink-faint">Load</span>
                      <span className="font-mono text-ink-muted tabular-nums">
                        {stats.loadPct}%
                      </span>
                    </div>
                    <Progress value={stats.loadPct} className="h-1" />
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border pt-3">
                    <div>
                      <p className="text-[9px] text-ink-faint uppercase tracking-wide">
                        Success
                      </p>
                      <p className="mt-0.5 font-mono text-xs text-ink-em tabular-nums">
                        {stats.successRate}%
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] text-ink-faint uppercase tracking-wide">
                        Avg time
                      </p>
                      <p className="mt-0.5 font-mono text-xs text-ink-em tabular-nums">
                        {stats.avgDurationMs ? formatDuration(stats.avgDurationMs) : "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] text-ink-faint uppercase tracking-wide">
                        Cost / mo
                      </p>
                      <p className="mt-0.5 font-mono text-xs text-ink-em tabular-nums">
                        ${stats.costThisMonth.toFixed(0)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <NewAgentDialog open={newAgentOpen} onOpenChange={setNewAgentOpen} />
    </div>
  );
}
