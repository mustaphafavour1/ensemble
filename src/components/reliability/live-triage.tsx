"use client";

import { useState } from "react";
import { Bot, Zap, MessageSquare, Flag, type LucideIcon } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { StatusBadge, type Tone } from "@/components/status-badge";
import { Switch } from "@/components/ui/switch";
import { INCIDENTS, type IncidentStatus } from "@/lib/mock/incidents";
import { getInvestigation, TRIAGE_INTAKE_PATHS, ESCALATION_RULES, type TriageIntakeKind } from "@/lib/mock/oncall";
import { formatRelative } from "@/lib/mock/time";
import { cn } from "@/lib/utils";

const STATUS_META: Record<IncidentStatus, { tone: Tone; label: string }> = {
  investigating: { tone: "danger", label: "Investigating" },
  identified: { tone: "warning", label: "Identified" },
  monitoring: { tone: "brand", label: "Monitoring" },
  resolved: { tone: "success", label: "Resolved" },
};

const INTAKE_ICON: Record<TriageIntakeKind, LucideIcon> = {
  alert: Zap,
  channel: MessageSquare,
  filed: Flag,
};

function TriageCard({ incidentId }: { incidentId: string }) {
  const incident = INCIDENTS.find((i) => i.id === incidentId)!;
  const investigation = getInvestigation(incident.id);

  return (
    <Card className="transition-colors hover:border-neutral-700">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex size-8 items-center justify-center rounded-md border border-agent-500/25 bg-agent-500/10 text-agent-400">
            <Bot className="size-4" strokeWidth={1.75} />
          </div>
          <StatusBadge tone={STATUS_META[incident.status].tone} label={STATUS_META[incident.status].label} pulse />
        </div>
        <div className="pt-2">
          <p className="line-clamp-1 text-[13px] text-ink-em">{incident.title}</p>
          <p className="mt-0.5 truncate text-2xs text-ink-faint">{incident.affectedSystems.join(" · ")}</p>
        </div>
      </CardHeader>
      <CardContent>
        <p className="line-clamp-2 text-2xs leading-relaxed text-ink-muted">
          {investigation?.thread[0]?.body ?? "Investigation starting…"}
        </p>

        <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border pt-3">
          <div>
            <p className="text-[10.5px] tracking-wide text-ink-faint uppercase">Severity</p>
            <p className="mt-0.5 text-xs text-ink-em capitalize">{incident.severity}</p>
          </div>
          <div>
            <p className="text-[10.5px] tracking-wide text-ink-faint uppercase">Started</p>
            <p className="mt-0.5 text-xs text-ink-em tabular-nums">{formatRelative(incident.startedAt)}</p>
          </div>
          <div>
            <p className="text-[10.5px] tracking-wide text-ink-faint uppercase">Diagnosis</p>
            <p className={cn("mt-0.5 text-xs", investigation?.hasLikelyCause ? "text-agent-400" : "text-ink-muted")}>
              {investigation?.hasLikelyCause ? "Found" : "In progress"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function IntakePaths() {
  return (
    <div className="flex flex-col gap-2">
      {TRIAGE_INTAKE_PATHS.map((path) => {
        const Icon = INTAKE_ICON[path.kind];
        return (
          <div key={path.id} className="flex items-start gap-2.5 rounded-lg border border-border bg-surface/40 p-3">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-md border border-border bg-surface text-ink-muted">
              <Icon className="size-3.5" strokeWidth={1.75} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-ink-em">{path.label}</p>
              <p className="mt-0.5 text-2xs leading-relaxed text-ink-muted">{path.description}</p>
            </div>
          </div>
        );
      })}
      <p className="mt-1 text-center text-2xs text-ink-faint">All three converge into the same triage decision.</p>
    </div>
  );
}

function EscalationRules() {
  const [rules, setRules] = useState(ESCALATION_RULES);

  return (
    <div className="flex flex-col divide-y divide-border">
      {rules.map((rule) => (
        <div key={rule.id} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-ink-em">{rule.condition}</p>
            <p className="mt-0.5 text-2xs text-ink-faint">
              {rule.action === "page" ? "Pages on-call immediately" : "Logged for the next daily review"}
            </p>
          </div>
          <Switch
            checked={rule.enabled}
            onCheckedChange={(checked) =>
              setRules((prev) => prev.map((r) => (r.id === rule.id ? { ...r, enabled: checked } : r)))
            }
          />
        </div>
      ))}
    </div>
  );
}

export function LiveTriage() {
  const active = INCIDENTS.filter((i) => i.status !== "resolved");

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="font-heading text-base font-semibold text-ink-em">Live Triage</h2>
        <p className="mt-1 text-xs text-ink-muted">
          Every incident the agent is actively investigating right now, in parallel.
        </p>
      </div>

      {active.length > 0 ? (
        <div className="grid grid-cols-3 gap-4">
          {active.map((incident) => (
            <TriageCard key={incident.id} incidentId={incident.id} />
          ))}
        </div>
      ) : (
        <p className="rounded-lg border border-dashed border-border py-10 text-center text-2xs text-ink-faint">
          Nothing active right now — a quiet stretch.
        </p>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <p className="text-sm font-medium text-ink-em">How incidents reach the agent</p>
          </CardHeader>
          <CardContent>
            <IntakePaths />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <p className="text-sm font-medium text-ink-em">Escalation criteria</p>
            <p className="mt-0.5 text-2xs text-ink-muted">
              Exactly what pages a human versus what just gets logged — inspect and tune it here.
            </p>
          </CardHeader>
          <CardContent>
            <EscalationRules />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
