"use client";

import { useMemo } from "react";
import { Users } from "lucide-react";
import { HexWorldMap } from "@/lib/geo/hex-world-map";
import { USAGE_HOTSPOTS, type UsageHotspot } from "@/lib/mock/global-usage";

type UsagePoint = UsageHotspot & { value: number };

export function UsageMap() {
  const points = useMemo<UsagePoint[]>(
    () => USAGE_HOTSPOTS.map((h) => ({ ...h, value: h.activeUsersM })),
    [],
  );

  return (
    <HexWorldMap
      points={points}
      icon={Users}
      formatCallout={(p) => ({
        title: p.city,
        metric: Math.round(p.activeUsersM * 1_000_000).toLocaleString(),
      })}
      formatTooltip={(p) => ({
        title: `${p.city}, ${p.country}`,
        lines: [
          `${p.activeUsersM}M active users`,
          `${p.avgLatencyMs}ms avg latency · ${p.errorRatePct}% error rate`,
          `Status: ${p.status}`,
        ],
      })}
    />
  );
}
