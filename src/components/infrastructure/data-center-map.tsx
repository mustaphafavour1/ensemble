"use client";

import { useMemo } from "react";
import { Server } from "lucide-react";
import { HexWorldMap } from "@/lib/geo/hex-world-map";
import { DATA_CENTERS, type DataCenter } from "@/lib/mock/datacenters";

type DcPoint = DataCenter & { value: number };

export function DataCenterMap() {
  const points = useMemo<DcPoint[]>(
    () => DATA_CENTERS.map((dc) => ({ ...dc, value: dc.capacityAccelerators })),
    [],
  );

  return (
    <HexWorldMap
      points={points}
      icon={Server}
      formatCallout={(dc) => ({
        title: dc.name,
        metric: dc.capacityAccelerators.toLocaleString(),
      })}
      formatTooltip={(dc) => ({
        title: `${dc.name}, ${dc.country}`,
        lines: [
          `${dc.region} · ${dc.status}`,
          `Load ${dc.loadPct}% · ${dc.capacityAccelerators.toLocaleString()} accelerators`,
          `${dc.powerMw} MW`,
        ],
      })}
    />
  );
}
