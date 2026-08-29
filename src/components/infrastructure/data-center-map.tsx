"use client";

import dynamic from "next/dynamic";
import { DATA_CENTERS, type DataCenter } from "@/lib/mock/datacenters";
import { generateHexCloud, type HexCloudPoint } from "@/lib/geo/hex-cloud";

const WorldHexbinMap = dynamic(() => import("@/lib/geo/hexbin-map").then((m) => m.WorldHexbinMap), {
  ssr: false,
});

const HEX_CLOUD = generateHexCloud(
  DATA_CENTERS.map((dc) => ({ id: dc.id, lon: dc.lon, lat: dc.lat, value: dc.capacityAccelerators })),
  6511,
);

const DC_BY_ID = new Map(DATA_CENTERS.map((dc) => [dc.id, dc]));

function formatTooltip(points: HexCloudPoint[]): string | null {
  const ids = Array.from(new Set(points.map((p) => p.sourceId)));
  const centers = ids.map((id) => DC_BY_ID.get(id)).filter((dc): dc is DataCenter => Boolean(dc));
  if (!centers.length) return null;

  return centers
    .map((dc) =>
      [
        `<strong>${dc.name}, ${dc.country}</strong>`,
        `${dc.region} · ${dc.status}`,
        `Load ${dc.loadPct}% · ${dc.capacityAccelerators.toLocaleString()} accelerators`,
        `${dc.powerMw} MW`,
      ].join("<br/>"),
    )
    .join("<br/><br/>");
}

export function DataCenterMap() {
  return <WorldHexbinMap points={HEX_CLOUD} getTooltip={formatTooltip} />;
}
