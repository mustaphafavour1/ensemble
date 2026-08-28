"use client";

import { useMemo } from "react";
import ReactECharts from "echarts-for-react";
import { DATA_CENTERS, type DcStatus } from "@/lib/mock/datacenters";
import { brand, warning, danger, neutral } from "@/lib/palette";
import { inter } from "@/lib/fonts";
import { ensureWorldMapRegistered, WORLD_GEO_OPTION } from "@/lib/geo/world-map";

const FONT = inter.style.fontFamily;

const STATUS_COLOR: Record<DcStatus, string> = {
  healthy: brand[500],
  degraded: warning[500],
  critical: danger[500],
};

// Dublin, London, and Frankfurt sit close enough together that stacked
// top-labels collide — spread this one cluster's labels around its dots.
const LABEL_POSITION_OVERRIDES: Record<string, "left" | "right" | "top" | "bottom"> = {
  "dc-dublin": "left",
  "dc-london": "bottom",
  "dc-frankfurt": "right",
  "dc-toronto": "right",
  "dc-ashburn": "bottom",
  "dc-council-bluffs": "left",
};

export function DataCenterMap() {
  ensureWorldMapRegistered();

  const option = useMemo(
    () => ({
      backgroundColor: "transparent",
      geo: WORLD_GEO_OPTION,
      tooltip: {
        show: true,
        backgroundColor: neutral[900],
        borderColor: neutral[700],
        borderWidth: 1,
        padding: 8,
        textStyle: { color: "#F1F5F9", fontFamily: FONT, fontSize: 11 },
        formatter: (params: { data?: { dc?: (typeof DATA_CENTERS)[number] } }) => {
          const dc = params.data?.dc;
          if (!dc) return "";
          return [
            `${dc.name}, ${dc.country}`,
            `${dc.region} · ${dc.status}`,
            `Load ${dc.loadPct}% · ${dc.capacityAccelerators.toLocaleString()} accelerators`,
            `${dc.powerMw} MW`,
          ].join("<br/>");
        },
      },
      series: [
        {
          name: "Data centers",
          type: "effectScatter",
          coordinateSystem: "geo",
          geoIndex: 0,
          data: DATA_CENTERS.map((dc) => ({
            value: [dc.lon, dc.lat],
            name: dc.name,
            dc,
            itemStyle: {
              color: STATUS_COLOR[dc.status],
              shadowColor: STATUS_COLOR[dc.status],
              shadowBlur: dc.status === "healthy" ? 4 : 10,
            },
            label: LABEL_POSITION_OVERRIDES[dc.id]
              ? { position: LABEL_POSITION_OVERRIDES[dc.id] }
              : undefined,
          })),
          symbolSize: (_: unknown, p: { data: { dc: (typeof DATA_CENTERS)[number] } }) =>
            6 + p.data.dc.capacityAccelerators / 1100,
          showEffectOn: "render",
          rippleEffect: { scale: 2, brushType: "stroke" },
          label: {
            show: true,
            formatter: "{b}",
            position: "top",
            distance: 6,
            fontFamily: FONT,
            fontSize: 9.5,
            color: neutral[300],
          },
          z: 2,
        },
      ],
    }),
    [],
  );

  return (
    <ReactECharts
      option={option}
      style={{ height: "100%", width: "100%" }}
      opts={{ renderer: "canvas" }}
      notMerge
    />
  );
}
