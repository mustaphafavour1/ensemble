"use client";

import Link from "next/link";
import { FileText, ShieldAlert, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { EmptyState } from "@/components/empty-state";
import { EnsembleAINote } from "@/components/ensemble-ai";
import { StatusBadge, type Tone } from "@/components/status-badge";
import { AgentTag } from "@/components/agent-tag";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SystemStatusMeters } from "@/components/overview/system-status-meters";
import { useAppStore } from "@/lib/store";
import { getOverviewKpis, getDailyDigest, getCostAnomaly } from "@/lib/mock/analytics";
import { INCIDENTS, type IncidentSeverity } from "@/lib/mock/incidents";
import { OPTIMIZATION_BACKLOG } from "@/lib/mock/optimization";
import { DEPLOYMENTS } from "@/lib/mock/delivery";
import { getOverallModelStatus } from "@/lib/mock/sla";
import { getTotalDailyRequestsB } from "@/lib/mock/models";
import { daysAgo, formatRelative } from "@/lib/mock/time";

const SEVERITY_META: Record<IncidentSeverity, { tone: Tone; label: string }> = {
  critical: { tone: "danger", label: "Critical" },
  major: { tone: "warning", label: "Major" },
  minor: { tone: "neutral", label: "Minor" },
};

const MODEL_STATUS_META: Record<ReturnType<typeof getOverallModelStatus>, { tone: Tone; label: string }> = {
  operational: { tone: "success", label: "all models operational" },
  degraded: { tone: "warning", label: "degraded performance on one or more models" },
  outage: { tone: "danger", label: "an active outage in the model fleet" },
};

export default function ExecutiveDigestPage() {
  const seeded = useAppStore((s) => s.seeded);

  if (!seeded) {
    return (
      <div>
        <PageHeader
          title="Executive Digest"
          description="A daily, auto-generated summary of engineering health — written for a five-minute read, not a dashboard deep-dive."
        />
        <EmptyState
          icon={FileText}
          title="No digest yet"
          description="Turn on demo data in Settings to see today's digest."
        />
      </div>
    );
  }

  const kpis = getOverviewKpis();
  const dailyNarrative = getDailyDigest();
  const anomaly = getCostAnomaly();
  const modelStatus = getOverallModelStatus();

  const ongoingIncidents = INCIDENTS.filter((i) => i.status !== "resolved");
  const criticalOngoing = ongoingIncidents.filter((i) => i.severity === "critical");

  const since = daysAgo(1);
  const deploysToday = DEPLOYMENTS.filter((d) => d.deployedAt >= since && d.status === "success");
  const failedDeploysToday = DEPLOYMENTS.filter((d) => d.deployedAt >= since && d.status === "failed");

  const aiFlaggedBacklog = OPTIMIZATION_BACKLOG.filter(
    (i) => i.flaggedByAi && i.status !== "shipped" && i.status !== "wont-fix",
  ).slice(0, 4);

  const openingLine = `${dailyNarrative} System status: ${MODEL_STATUS_META[modelStatus].label}${
    ongoingIncidents.length > 0
      ? `, with ${ongoingIncidents.length} open incident${ongoingIncidents.length === 1 ? "" : "s"}${
          criticalOngoing.length > 0 ? ` (${criticalOngoing.length} critical)` : ""
        }`
      : ", with no open incidents"
  }.`;

  return (
    <div>
      <PageHeader
        title="Executive Digest"
        description="A daily, auto-generated summary of engineering health — written for a five-minute read, not a dashboard deep-dive."
      />

      <EnsembleAINote label="EnsembleAI — Today's Digest">{openingLine}</EnsembleAINote>

      <div className="mt-4 grid grid-cols-4 gap-4">
        <StatCard label="Daily requests, worldwide" value={`${getTotalDailyRequestsB()}B`} hint="across every production model" />
        <StatCard label="Active runs right now" value={kpis.activeRunsNow} hint="queued + running" />
        <StatCard
          label="Deployments today"
          value={deploysToday.length}
          hint={failedDeploysToday.length > 0 ? `${failedDeploysToday.length} failed` : "all succeeded"}
        />
        <StatCard label="AI-authored code this week" value={`${kpis.aiAuthoredPctThisWeek}%`} hint="share of all commits" />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4">
        <Card className="col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="size-3.5 text-brand-400" strokeWidth={2} />
              <CardTitle>What changed today</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-3 text-xs text-ink-em">
              <li className="flex gap-2">
                <span className="text-ink-faint">—</span>
                <span>
                  {deploysToday.length} successful deploy{deploysToday.length === 1 ? "" : "s"} shipped across{" "}
                  {new Set(deploysToday.map((d) => d.repoId)).size} repos
                  {failedDeploysToday.length > 0 && (
                    <span className="text-warning-300"> ({failedDeploysToday.length} failed and rolled back)</span>
                  )}
                  .
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-ink-faint">—</span>
                <span>
                  Compute cost anomaly:{" "}
                  <AgentTag name={anomaly.agentName} className="inline-flex text-xs" /> spent $
                  {anomaly.thisWeekCost.toFixed(2)} this week on {anomaly.repoName} — {anomaly.ratio}× its recent
                  average.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-ink-faint">—</span>
                <span>
                  Model fleet is {MODEL_STATUS_META[modelStatus].label}, tracked against a 99.9% uptime SLA.
                </span>
              </li>
              {ongoingIncidents.length > 0 ? (
                <li className="flex gap-2">
                  <span className="text-ink-faint">—</span>
                  <span>
                    {ongoingIncidents.length} incident{ongoingIncidents.length === 1 ? "" : "s"} still open — see
                    below for the full list.
                  </span>
                </li>
              ) : (
                <li className="flex gap-2">
                  <span className="text-ink-faint">—</span>
                  <span>No open incidents — every prior incident this period has been resolved.</span>
                </li>
              )}
            </ul>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Model uptime</CardTitle>
          </CardHeader>
          <CardContent>
            <SystemStatusMeters />
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-2">
              <ShieldAlert className="size-3.5 text-ink-faint" />
              <CardTitle>Open incidents</CardTitle>
            </div>
            <Link href="/reliability/incidents" className="text-2xs font-medium text-brand-400 hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent>
            {ongoingIncidents.length === 0 ? (
              <p className="py-2 text-xs text-ink-faint">Nothing open right now.</p>
            ) : (
              <ul className="flex flex-col divide-y divide-border">
                {ongoingIncidents.slice(0, 5).map((incident) => (
                  <li key={incident.id} className="flex items-start justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <StatusBadge tone={SEVERITY_META[incident.severity].tone} label={SEVERITY_META[incident.severity].label} />
                      </div>
                      <p className="mt-1.5 truncate text-xs text-ink-em">{incident.title}</p>
                    </div>
                    <span className="shrink-0 text-2xs text-ink-faint">{formatRelative(incident.startedAt)}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-2">
              <Sparkles className="size-3.5 text-brand-400" strokeWidth={2} />
              <CardTitle>Flagged by EnsembleAI</CardTitle>
            </div>
            <Link href="/optimization/backlog" className="text-2xs font-medium text-brand-400 hover:underline">
              View backlog
            </Link>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col divide-y divide-border">
              {aiFlaggedBacklog.map((item) => (
                <li key={item.id} className="flex items-start justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="truncate text-xs text-ink-em">{item.title}</p>
                    <p className="mt-0.5 text-2xs text-ink-faint">{item.category}</p>
                  </div>
                  <span className="shrink-0 text-2xs font-medium text-brand-400">{item.estimatedImpact}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
