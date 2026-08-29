"use client";

import { Bot } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { useAppStore } from "@/lib/store";
import { LiveTriage } from "@/components/reliability/live-triage";
import { LessonsLearned } from "@/components/reliability/lessons-learned";
import { InvestigationPlaybooks } from "@/components/reliability/investigation-playbooks";
import { CiWeatherReport } from "@/components/reliability/ci-weather-report";
import { HandoffReports } from "@/components/reliability/handoff-reports";

export default function OnCallAgentPage() {
  const seeded = useAppStore((s) => s.seeded);

  return (
    <div>
      <PageHeader
        title="On-Call Agent"
        description="The standing AI system behind incident response — what it's investigating right now, what it's learned, and what it knows about the current state of CI."
      />

      {!seeded ? (
        <EmptyState
          icon={Bot}
          title="No on-call activity yet"
          description="Turn on demo data in Settings to see the on-call agent in action."
        />
      ) : (
        <div className="flex flex-col gap-10">
          <LiveTriage />
          <LessonsLearned />
          <InvestigationPlaybooks />
          <CiWeatherReport />
          <HandoffReports />
        </div>
      )}
    </div>
  );
}
