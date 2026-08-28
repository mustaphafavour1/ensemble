"use client";

import { useMemo } from "react";
import ReactECharts from "echarts-for-react";
import { DATA_CENTERS } from "@/lib/mock/datacenters";
import { brand, warning, danger, neutral } from "@/lib/palette";
import { inter } from "@/lib/fonts";
import { ensureWorldMapRegistered, WORLD_GEO_OPTION } from "@/lib/geo/world-map";

const FONT = inter.style.fontFamily;
const MAX_CAPACITY = Math.max(...DATA_CENTERS.map((dc) => dc.capacityAccelerators));

// Dublin, London, and Frankfurt sit close enough together that stacked
// top-labels collide — spread this one cluster's labels around its point.
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
      geo: {
        ...WORLD_GEO_OPTION,
        roam: true,
        scaleLimit: { min: 1, max: 8 },
      },
      visualMap: {
        show: false,
        seriesIndex: 0,
        min: 0,
        max: MAX_CAPACITY,
        inRange: {
          color: ["rgba(0,0,0,0)", brand[500], warning[500], danger[500]],
        },
      },
      tooltip: {
        show: true,
        backgroundColor: neutral[900],
        borderColor: neutral[700],
        borderWidth: 1,
        padding: 8,
        textStyle: { color: "#F1F5F9", fontFamily: FONT, fontSize: 12.5 },
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
          name: "Capacity intensity",
          type: "heatmap",
          coordinateSystem: "geo",
          geoIndex: 0,
          data: DATA_CENTERS.map((dc) => [dc.lon, dc.lat, dc.capacityAccelerators]),
          pointSize: 34,
          blurSize: 48,
          silent: true,
          z: 1,
        },
        {
          // Invisible hit-targets carrying the persistent name labels — the
          // heatmap layer above is silent and can't be hovered directly.
          name: "Data centers",
          type: "scatter",
          coordinateSystem: "geo",
          geoIndex: 0,
          data: DATA_CENTERS.map((dc) => ({
            value: [dc.lon, dc.lat],
            name: dc.name,
            dc,
            label: LABEL_POSITION_OVERRIDES[dc.id]
              ? { position: LABEL_POSITION_OVERRIDES[dc.id] }
              : undefined,
          })),
          symbolSize: 14,
          itemStyle: { color: "transparent" },
          label: {
            show: true,
            formatter: "{b}",
            position: "top",
            distance: 6,
            fontFamily: FONT,
            fontSize: 11,
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
