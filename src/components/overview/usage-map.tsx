"use client";

import { useMemo } from "react";
import ReactECharts from "echarts-for-react";
import { USAGE_HOTSPOTS, type UsageStatus } from "@/lib/mock/global-usage";
import { brand, warning, danger, neutral } from "@/lib/palette";
import { inter } from "@/lib/fonts";
import { ensureWorldMapRegistered, WORLD_GEO_OPTION } from "@/lib/geo/world-map";

const FONT = inter.style.fontFamily;

const STATUS_COLOR: Record<UsageStatus, string> = {
  normal: brand[500],
  elevated: warning[500],
  degraded: danger[500],
};

export function UsageMap() {
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
        formatter: (params: { data?: { hotspot?: (typeof USAGE_HOTSPOTS)[number] } }) => {
          const h = params.data?.hotspot;
          if (!h) return "";
          return [
            `${h.city}, ${h.country}`,
            `${h.activeUsersM}M active users`,
            `Status: ${h.status}`,
          ].join("<br/>");
        },
      },
      series: [
        {
          name: "Usage",
          type: "effectScatter",
          coordinateSystem: "geo",
          geoIndex: 0,
          data: USAGE_HOTSPOTS.map((h) => ({
            value: [h.lon, h.lat],
            name: h.city,
            hotspot: h,
            itemStyle: {
              color: STATUS_COLOR[h.status],
              shadowColor: STATUS_COLOR[h.status],
              shadowBlur: h.status === "normal" ? 4 : 10,
            },
          })),
          symbolSize: (_: unknown, p: { data: { hotspot: (typeof USAGE_HOTSPOTS)[number] } }) =>
            5 + p.data.hotspot.activeUsersM / 4.5,
          showEffectOn: "render",
          rippleEffect: { scale: 2, brushType: "stroke" },
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
