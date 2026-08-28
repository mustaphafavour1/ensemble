import { Rng } from "./rng";
import { AGENTS, REPOS, STACKS } from "./catalog";
import { RUNS } from "./runs";
import { DEPLOYMENTS } from "./delivery";
import { REFERENCE_NOW, daysAgo } from "./time";

export interface DayMetric {
  timestamp: number;
  aiAuthoredPct: number;
  runSuccessRate: number;
  costUsd: number;
  tokens: number;
  deployments: number;
  totalRuns: number;
  merged: number;
  failed: number;
}

function dayBounds(daysBack: number): [number, number] {
  const end = daysAgo(daysBack);
  const start = daysAgo(daysBack + 1);
  return [start, end];
}

function generateDailyMetrics(days: number): DayMetric[] {
  const rng = new Rng(3391);
  const out: DayMetric[] = [];
  let aiPct = 38;

  for (let d = days - 1; d >= 0; d--) {
    const [start, end] = dayBounds(d);
    const dayRuns = RUNS.filter((r) => r.startedAt >= start && r.startedAt < end);
    const terminal = dayRuns.filter((r) => r.status === "merged" || r.status === "failed");
    const merged = terminal.filter((r) => r.status === "merged").length;
    const failed = terminal.length - merged;
    const dayDeploys = DEPLOYMENTS.filter(
      (dep) => dep.deployedAt >= start && dep.deployedAt < end && dep.status === "success",
    ).length;

    aiPct = Math.min(79, Math.max(32, aiPct + rng.float(-1.6, 2.1)));

    out.push({
      timestamp: end,
      aiAuthoredPct: Math.round(aiPct * 10) / 10,
      runSuccessRate: terminal.length > 0 ? Math.round((merged / terminal.length) * 1000) / 10 : 0,
      costUsd: Math.round(dayRuns.reduce((s, r) => s + r.costUsd, 0) * 100) / 100,
      tokens: dayRuns.reduce((s, r) => s + r.tokens, 0),
      deployments: dayDeploys,
      totalRuns: dayRuns.length,
      merged,
      failed,
    });
  }

  return out;
}

export const DAILY_METRICS_90D: DayMetric[] = generateDailyMetrics(90);
export const DAILY_METRICS_30D: DayMetric[] = DAILY_METRICS_90D.slice(-30);
export const DAILY_METRICS_7D: DayMetric[] = DAILY_METRICS_90D.slice(-7);

export interface WeekMetric {
  label: string;
  merged: number;
  failed: number;
  deployments: number;
  tokens: number;
}

export function getWeeklyMetrics(): WeekMetric[] {
  const weeks: WeekMetric[] = [];
  for (let i = 0; i < DAILY_METRICS_90D.length; i += 7) {
    const chunk = DAILY_METRICS_90D.slice(i, i + 7);
    if (!chunk.length) continue;
    weeks.push({
      label: new Date(chunk[0].timestamp).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      merged: chunk.reduce((s, d) => s + d.merged, 0),
      failed: chunk.reduce((s, d) => s + d.failed, 0),
      deployments: chunk.reduce((s, d) => s + d.deployments, 0),
      tokens: chunk.reduce((s, d) => s + d.tokens, 0),
    });
  }
  return weeks;
}

export function sum(nums: number[]): number {
  return nums.reduce((a, b) => a + b, 0);
}

export function avg(nums: number[]): number {
  return nums.length ? sum(nums) / nums.length : 0;
}

export interface LanguageBreakdown {
  language: string;
  color: string;
  runs: number;
  pct: number;
}

export function getLanguageBreakdown(): LanguageBreakdown[] {
  const counts = new Map<string, { count: number; color: string }>();
  for (const run of RUNS) {
    const repo = REPOS.find((r) => r.id === run.repoId)!;
    const stack = STACKS[repo.stackId];
    const entry = counts.get(stack.language) ?? { count: 0, color: stack.color };
    entry.count++;
    counts.set(stack.language, entry);
  }
  const total = RUNS.length;
  return Array.from(counts.entries())
    .map(([language, { count, color }]) => ({
      language,
      color,
      runs: count,
      pct: Math.round((count / total) * 1000) / 10,
    }))
    .sort((a, b) => b.runs - a.runs);
}

export interface AgentCost {
  agentId: string;
  agentName: string;
  costUsd: number;
  runs: number;
}

export function getCostByAgent(sinceDaysAgo = 30): AgentCost[] {
  const since = daysAgo(sinceDaysAgo);
  const map = new Map<string, { cost: number; runs: number }>();
  for (const run of RUNS) {
    if (run.startedAt < since) continue;
    const entry = map.get(run.agentId) ?? { cost: 0, runs: 0 };
    entry.cost += run.costUsd;
    entry.runs++;
    map.set(run.agentId, entry);
  }
  return AGENTS.map((agent) => ({
    agentId: agent.id,
    agentName: agent.name,
    costUsd: Math.round((map.get(agent.id)?.cost ?? 0) * 100) / 100,
    runs: map.get(agent.id)?.runs ?? 0,
  })).sort((a, b) => b.costUsd - a.costUsd);
}

export interface RepoCost {
  repoId: string;
  repoName: string;
  costUsd: number;
  runs: number;
}

export function getCostByRepo(sinceDaysAgo = 30): RepoCost[] {
  const since = daysAgo(sinceDaysAgo);
  const map = new Map<string, { cost: number; runs: number }>();
  for (const run of RUNS) {
    if (run.startedAt < since) continue;
    const entry = map.get(run.repoId) ?? { cost: 0, runs: 0 };
    entry.cost += run.costUsd;
    entry.runs++;
    map.set(run.repoId, entry);
  }
  return REPOS.map((repo) => ({
    repoId: repo.id,
    repoName: repo.name,
    costUsd: Math.round((map.get(repo.id)?.cost ?? 0) * 100) / 100,
    runs: map.get(repo.id)?.runs ?? 0,
  })).sort((a, b) => b.costUsd - a.costUsd);
}

export interface CostAnomaly {
  agentName: string;
  repoName: string;
  thisWeekCost: number;
  avgWeekCost: number;
  ratio: number;
}

export function getCostAnomaly(): CostAnomaly {
  const rng = new Rng(5510);
  const weekCostByAgent = (weekIndex: number) => {
    const start = daysAgo((weekIndex + 1) * 7);
    const end = daysAgo(weekIndex * 7);
    const map = new Map<string, number>();
    for (const run of RUNS) {
      if (run.startedAt < start || run.startedAt >= end) continue;
      map.set(run.agentId, (map.get(run.agentId) ?? 0) + run.costUsd);
    }
    return map;
  };

  const thisWeek = weekCostByAgent(0);
  const priorWeeks = [1, 2, 3].map(weekCostByAgent);

  let best: CostAnomaly | null = null;
  for (const agent of AGENTS) {
    const thisWeekCost = thisWeek.get(agent.id) ?? 0;
    const priorAvg =
      avg(priorWeeks.map((w) => w.get(agent.id) ?? 0)) || thisWeekCost * 0.6 || 1;
    const ratio = thisWeekCost / Math.max(priorAvg, 8);
    if (thisWeekCost < 15) continue;
    if (!best || ratio > best.ratio) {
      const agentRuns = RUNS.filter(
        (r) => r.agentId === agent.id && r.startedAt >= daysAgo(7),
      );
      const repoId = agentRuns.length ? rng.pick(agentRuns).repoId : REPOS[0].id;
      best = {
        agentName: agent.name,
        repoName: REPOS.find((r) => r.id === repoId)!.name,
        thisWeekCost: Math.round(thisWeekCost * 100) / 100,
        avgWeekCost: Math.round(priorAvg * 100) / 100,
        ratio: Math.round(ratio * 10) / 10,
      };
    }
  }

  return (
    best ?? {
      agentName: AGENTS[0].name,
      repoName: REPOS[0].name,
      thisWeekCost: 0,
      avgWeekCost: 0,
      ratio: 1,
    }
  );
}

export function getDailyDigest(): string {
  const today = DAILY_METRICS_30D[DAILY_METRICS_30D.length - 1];
  const since = daysAgo(1);
  const todayRuns = RUNS.filter((r) => r.startedAt >= since);
  const merged = todayRuns.filter((r) => r.status === "merged").length;
  const failed = todayRuns.filter((r) => r.status === "failed").length;
  const inFlight = todayRuns.length - merged - failed;

  const byAgent = new Map<string, number>();
  for (const r of todayRuns) byAgent.set(r.agentId, (byAgent.get(r.agentId) ?? 0) + 1);
  const topAgentId = Array.from(byAgent.entries()).sort((a, b) => b[1] - a[1])[0];
  const topAgent = topAgentId ? AGENTS.find((a) => a.id === topAgentId[0]) : null;

  const parts: string[] = [];
  parts.push(
    `${merged + failed} runs finished today — ${merged} merged, ${failed} failed (${today.runSuccessRate}% success rate)${inFlight > 0 ? `, ${inFlight} more still in flight` : ""}.`,
  );
  if (topAgent) {
    parts.push(`${topAgent.name} was the busiest, closing ${byAgent.get(topAgent.id)} of them.`);
  }
  parts.push(`Compute spend for the day landed at $${today.costUsd.toFixed(2)}.`);
  return parts.join(" ");
}

export interface OverviewKpis {
  activeRunsNow: number;
  deploymentsToday: number;
  aiAuthoredPctThisWeek: number;
}

export function getOverviewKpis(): OverviewKpis {
  const today = DAILY_METRICS_30D[DAILY_METRICS_30D.length - 1];
  return {
    activeRunsNow: RUNS.filter((r) => r.status === "running" || r.status === "queued").length,
    deploymentsToday: today.deployments,
    aiAuthoredPctThisWeek: Math.round(avg(DAILY_METRICS_7D.map((d) => d.aiAuthoredPct)) * 10) / 10,
  };
}

export const REFERENCE_TIMESTAMP = REFERENCE_NOW;
