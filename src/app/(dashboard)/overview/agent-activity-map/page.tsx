"use client";

import { Network } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AgentGraph } from "@/components/overview/agent-graph";
import { useAppStore } from "@/lib/store";

export default function AgentActivityMapPage() {
  const seeded = useAppStore((s) => s.seeded);

  return (
    <div>
      <PageHeader
        title="Agent Activity Map"
        description="Which coding agents are touching which repos, right now."
      />

      {!seeded ? (
        <EmptyState
          icon={Network}
          title="No activity yet"
          description="Turn on demo data in Settings to see the fleet in motion."
        />
      ) : (
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Fleet activity map</CardTitle>
            <div className="flex items-center gap-3 text-2xs text-ink-muted">
              <span className="flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-agent-500" />
                Agent
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-brand-500" />
                Repository
              </span>
            </div>
          </CardHeader>
          <CardContent className="h-[640px] pt-2">
            <AgentGraph />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
