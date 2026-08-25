import { AGENTS } from "./catalog";
import { RUNS } from "./runs";
import { daysAgo } from "./time";

export interface AgentStats {
  agentId: string;
  activeRuns: number;
  loadPct: number;
  successRate: number;
  costThisMonth: number;
  totalRuns: number;
  avgDurationMs: number;
}

const MAX_CONCURRENCY = 6;

function computeStats(agentId: string): AgentStats {
  const monthStart = daysAgo(30);
  const all = RUNS.filter((r) => r.agentId === agentId);
  const thisMonth = all.filter((r) => r.startedAt >= monthStart);
  const terminal = all.filter((r) => r.status === "merged" || r.status === "failed");
  const merged = terminal.filter((r) => r.status === "merged").length;
  const active = all.filter((r) => r.status === "running" || r.status === "queued").length;
  const durations = all.filter((r) => r.durationMs != null).map((r) => r.durationMs as number);

  return {
    agentId,
    activeRuns: active,
    loadPct: Math.min(100, Math.round((active / MAX_CONCURRENCY) * 100)),
    successRate: terminal.length ? Math.round((merged / terminal.length) * 1000) / 10 : 0,
    costThisMonth: Math.round(thisMonth.reduce((s, r) => s + r.costUsd, 0) * 100) / 100,
    totalRuns: all.length,
    avgDurationMs: durations.length ? durations.reduce((a, b) => a + b, 0) / durations.length : 0,
  };
}

const STATS_BY_AGENT = new Map(AGENTS.map((a) => [a.id, computeStats(a.id)]));

export function getAgentStats(agentId: string): AgentStats {
  return STATS_BY_AGENT.get(agentId)!;
}

export function getAllAgentStats(): AgentStats[] {
  return AGENTS.map((a) => getAgentStats(a.id));
}
