"use client";

import { Bot } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAppStore } from "@/lib/store";
import { LiveTriage } from "@/components/reliability/live-triage";
import { LessonsLearned } from "@/components/reliability/lessons-learned";
import { InvestigationPlaybooks } from "@/components/reliability/investigation-playbooks";
import { CiWeatherReport } from "@/components/reliability/ci-weather-report";
import { HandoffReports } from "@/components/reliability/handoff-reports";

const TAB_TRIGGER_CLASS = "px-1 pb-3 text-sm font-medium data-active:text-brand-400 after:bg-brand-500";

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
        <Tabs defaultValue="overview">
          <TabsList variant="line" className="mb-6 w-full justify-start gap-6 border-b border-border">
            <TabsTrigger value="overview" className={TAB_TRIGGER_CLASS}>
              Overview
            </TabsTrigger>
            <TabsTrigger value="lessons" className={TAB_TRIGGER_CLASS}>
              Lessons Learned
            </TabsTrigger>
            <TabsTrigger value="playbooks" className={TAB_TRIGGER_CLASS}>
              Investigation Playbooks
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="flex flex-col gap-10">
              <LiveTriage />
              <CiWeatherReport />
              <HandoffReports />
            </div>
          </TabsContent>

          <TabsContent value="lessons">
            <LessonsLearned />
          </TabsContent>

          <TabsContent value="playbooks">
            <InvestigationPlaybooks />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
