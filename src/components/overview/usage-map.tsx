"use client";

import dynamic from "next/dynamic";
import { USAGE_HOTSPOTS, type UsageHotspot } from "@/lib/mock/global-usage";
import { generateHexCloud, type HexCloudPoint } from "@/lib/geo/hex-cloud";

const WorldHexbinMap = dynamic(() => import("@/lib/geo/hexbin-map").then((m) => m.WorldHexbinMap), {
  ssr: false,
});

const HEX_CLOUD = generateHexCloud(
  USAGE_HOTSPOTS.map((h) => ({ id: h.id, lon: h.lon, lat: h.lat, value: h.activeUsersM })),
  6203,
);

const HOTSPOT_BY_ID = new Map(USAGE_HOTSPOTS.map((h) => [h.id, h]));

function formatTooltip(points: HexCloudPoint[]): string | null {
  const ids = Array.from(new Set(points.map((p) => p.sourceId)));
  const hotspots = ids.map((id) => HOTSPOT_BY_ID.get(id)).filter((h): h is UsageHotspot => Boolean(h));
  if (!hotspots.length) return null;

  return hotspots
    .map((h) =>
      [
        `<strong>${h.city}, ${h.country}</strong>`,
        `${h.activeUsersM}M active users`,
        `${h.avgLatencyMs}ms avg latency · ${h.errorRatePct}% error rate`,
        `Status: ${h.status}`,
      ].join("<br/>"),
    )
    .join("<br/><br/>");
}

export function UsageMap() {
  return <WorldHexbinMap points={HEX_CLOUD} getTooltip={formatTooltip} />;
}
