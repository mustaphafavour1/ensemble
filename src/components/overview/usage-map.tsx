"use client";

import { useMemo } from "react";
import ReactECharts from "echarts-for-react";
import { USAGE_HOTSPOTS } from "@/lib/mock/global-usage";
import { neutral } from "@/lib/palette";
import { inter } from "@/lib/fonts";
import { ensureWorldMapRegistered, WORLD_GEO_OPTION } from "@/lib/geo/world-map";
import { createHexHeatSeries } from "@/lib/geo/hex-grid";

const FONT = inter.style.fontFamily;

export function UsageMap() {
  ensureWorldMapRegistered();

  const option = useMemo(
    () => ({
      backgroundColor: "transparent",
      geo: {
        ...WORLD_GEO_OPTION,
        roam: true,
        scaleLimit: { min: 1, max: 8 },
      },
      tooltip: {
        show: true,
        backgroundColor: neutral[900],
        borderColor: neutral[700],
        borderWidth: 1,
        padding: 8,
        textStyle: { color: "#F1F5F9", fontFamily: FONT, fontSize: 12.5 },
        formatter: (params: { data?: { hotspot?: (typeof USAGE_HOTSPOTS)[number] } }) => {
          const h = params.data?.hotspot;
          if (!h) return "";
          return [
            `${h.city}, ${h.country}`,
            `${h.activeUsersM}M active users`,
            `${h.avgLatencyMs}ms avg latency · ${h.errorRatePct}% error rate`,
            `Status: ${h.status}`,
          ].join("<br/>");
        },
      },
      series: [
        createHexHeatSeries(
          USAGE_HOTSPOTS.map((h) => ({ lon: h.lon, lat: h.lat, value: h.activeUsersM })),
          { boundingCoords: WORLD_GEO_OPTION.boundingCoords, hexRadiusPx: 12, sigmaPx: 32 },
        ),
        {
          // Invisible hit-targets so hovering a hotspot still shows its tooltip —
          // the hex layer above is silent and can't be hovered directly.
          name: "Usage",
          type: "scatter",
          coordinateSystem: "geo",
          geoIndex: 0,
          data: USAGE_HOTSPOTS.map((h) => ({
            value: [h.lon, h.lat],
            hotspot: h,
          })),
          symbolSize: 16,
          itemStyle: { color: "transparent" },
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
