import { RUNS } from "./runs";
import { DEPLOYMENTS } from "./delivery";
import { AGENTS } from "./catalog";
import { INCIDENTS } from "./incidents";
import { SLA_RECORDS, SLA_TARGET, getOverallModelStatus } from "./sla";
import { OPTIMIZATION_BACKLOG } from "./optimization";
import { MODEL_VERSIONS, getModelById } from "./models";
import { avg } from "./analytics";
import { daysAgo, formatDate, formatDuration, REFERENCE_NOW } from "./time";

export interface DigestSection {
  heading: string;
  paragraphs: string[];
}

export function getDigestDateRange(): string {
  return `${formatDate(daysAgo(7))} – ${formatDate(REFERENCE_NOW)}`;
}

/** "A" / "A and B" / "A, B, and C" — never the ungrammatical "A and B and C". */
function joinList(items: string[]): string {
  if (items.length <= 1) return items[0] ?? "";
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

export function getExecutiveDigest(): DigestSection[] {
  const since = daysAgo(7);

  const weekRuns = RUNS.filter((r) => r.startedAt >= since);
  const merged = weekRuns.filter((r) => r.status === "merged");
  const weekDeploys = DEPLOYMENTS.filter((d) => d.deployedAt >= since && d.status === "success");
  const reposTouched = new Set(merged.map((r) => r.repoId)).size;

  const byAgent = new Map<string, number>();
  for (const r of merged) byAgent.set(r.agentId, (byAgent.get(r.agentId) ?? 0) + 1);
  const topEntry = [...byAgent.entries()].sort((a, b) => b[1] - a[1])[0];
  const topAgent = topEntry ? AGENTS.find((a) => a.id === topEntry[0]) : null;

  const resolvedThisWeek = INCIDENTS.filter((i) => i.status === "resolved" && i.resolvedAt !== null && i.resolvedAt >= since);
  const ongoingCritical = INCIDENTS.filter((i) => i.severity === "critical" && i.status !== "resolved");
  const avgResolutionMs = resolvedThisWeek.length
    ? avg(resolvedThisWeek.map((i) => i.resolvedAt! - i.startedAt))
    : 0;

  const bySla = SLA_RECORDS.slice().sort((a, b) => b.uptimePct30d - a.uptimePct30d);
  const best = bySla[0];
  const worst = bySla[bySla.length - 1];
  const stagedModels = MODEL_VERSIONS.filter((m) => m.status === "staged");
  const overallStatus = getOverallModelStatus();

  const inProgress = OPTIMIZATION_BACKLOG.filter((i) => i.status === "in-progress").slice(0, 2);

  const sections: DigestSection[] = [];

  sections.push({
    heading: "This Week in Engineering",
    paragraphs: [
      `The agent fleet closed ${merged.length} runs across ${reposTouched} repos this week and shipped ${weekDeploys.length} changes to production, staging, and preview combined.` +
        (topAgent
          ? ` ${topAgent.name} was the standout contributor, closing ${topEntry![1]} of those runs on its own.`
          : ""),
      `That volume continues to free the team from the kind of routine, well-scoped work agents now handle by default — refactors, test coverage, dependency bumps, and the like — so engineers can spend their attention on the changes that actually need human judgment.`,
    ],
  });

  sections.push({
    heading: "Incidents & Resolution",
    paragraphs: [
      resolvedThisWeek.length > 0
        ? `${resolvedThisWeek.length} incident${resolvedThisWeek.length === 1 ? "" : "s"} opened and closed within the week, with an average time to resolution of ${formatDuration(avgResolutionMs)}.`
        : `No incidents were opened and fully resolved within the week.`,
      ongoingCritical.length > 0
        ? `One item still needs attention going into next week: ${ongoingCritical[0].title.toLowerCase()}. It's tracked as critical and remains the team's top priority until closed.`
        : `Nothing critical is open right now — the incident queue is clear heading into next week.`,
    ],
  });

  sections.push({
    heading: "Model Performance",
    paragraphs: [
      (overallStatus === "operational"
        ? `The model fleet operated within its ${SLA_TARGET}% SLA target across the board this period.`
        : overallStatus === "degraded"
          ? `The model fleet mostly held its ${SLA_TARGET}% SLA target, with one model running below target.`
          : `The model fleet saw an outage-level breach of its ${SLA_TARGET}% SLA target that needs follow-up.`) +
        (best ? ` ${getModelById(best.modelId)?.name ?? best.modelId} led on reliability at ${best.uptimePct30d.toFixed(3)}% uptime.` : "") +
        (worst && worst.uptimePct30d < worst.slaTargetPct
          ? ` ${getModelById(worst.modelId)?.name ?? worst.modelId} was the outlier, dipping to ${worst.uptimePct30d.toFixed(3)}%.`
          : ""),
      stagedModels.length > 0
        ? `${joinList(stagedModels.map((m) => m.name))} remain in internal testing ahead of a staged rollout — early numbers are promising but it's still too soon to call.`
        : `No new models are currently in internal testing.`,
    ],
  });

  sections.push({
    heading: "Looking Ahead",
    paragraphs: [
      inProgress.length > 0
        ? `In progress for next week: ${joinList(inProgress.map((i) => i.title.toLowerCase()))}.` +
          (inProgress[0].flaggedByAi ? ` EnsembleAI flagged the first of these as a high-confidence opportunity worth prioritizing.` : "")
        : `No major optimization work is in flight right now — the backlog is caught up, which is a good moment to look for the next thing worth automating.`,
    ],
  });

  return sections;
}
