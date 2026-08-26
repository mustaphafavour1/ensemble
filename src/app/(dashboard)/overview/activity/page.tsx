"use client";

import { Activity } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { ActivityFeed } from "@/components/overview/activity-feed";
import { useAppStore } from "@/lib/store";
import { getActivityFeed } from "@/lib/mock/activity";

export default function LiveActivityFeedPage() {
  const seeded = useAppStore((s) => s.seeded);
  const feed = seeded ? getActivityFeed(80) : [];

  return (
    <div>
      <PageHeader
        title="Live Activity Feed"
        description="Every commit, approval, review, and deploy across the agent fleet, as it happens."
      />

      {!seeded ? (
        <EmptyState
          icon={Activity}
          title="No activity yet"
          description="Turn on demo data in Settings to see the live feed."
        />
      ) : (
        <div className="mx-auto max-w-2xl">
          <ActivityFeed items={feed} />
        </div>
      )}
    </div>
  );
}
