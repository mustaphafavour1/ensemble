"use client";

import { useMemo } from "react";
import ReactECharts from "echarts-for-react";
import { DATA_CENTERS, type DcStatus } from "@/lib/mock/datacenters";
import { brand, warning, danger, neutral } from "@/lib/palette";
import { inter } from "@/lib/fonts";

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
};

const REGION_LABELS = [
  { label: "NORTH AMERICA", lon: -100, lat: 48 },
  { label: "SOUTH AMERICA", lon: -58, lat: -8 },
  { label: "EUROPE", lon: 12, lat: 58 },
  { label: "AFRICA", lon: 21, lat: -2 },
  { label: "ASIA", lon: 95, lat: 40 },
  { label: "OCEANIA", lon: 142, lat: -32 },
];

export function DataCenterMap() {
  const option = useMemo(
    () => ({
      backgroundColor: "transparent",
      grid: {
        left: 24,
        right: 24,
        top: 24,
        bottom: 24,
        backgroundColor: "rgba(255,255,255,0.015)",
        show: true,
        borderColor: "transparent",
      },
      xAxis: {
        type: "value",
        min: -170,
        max: 170,
        show: false,
      },
      yAxis: {
        type: "value",
        min: -58,
        max: 75,
        show: false,
      },
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
          name: "regions",
          type: "scatter",
          data: REGION_LABELS.map((r) => ({ value: [r.lon, r.lat], name: r.label })),
          symbolSize: 0,
          silent: true,
          tooltip: { show: false },
          label: {
            show: true,
            formatter: "{b}",
            color: neutral[700],
            fontFamily: FONT,
            fontSize: 10,
          },
          z: 1,
        },
        {
          name: "equator",
          type: "line",
          data: [
            [-170, 0],
            [170, 0],
          ],
          lineStyle: { color: neutral[800], width: 1, type: "dashed" },
          symbol: "none",
          silent: true,
          tooltip: { show: false },
          z: 1,
        },
        {
          name: "Data centers",
          type: "effectScatter",
          data: DATA_CENTERS.map((dc) => ({
            value: [dc.lon, dc.lat],
            name: dc.name,
            dc,
            itemStyle: {
              color: STATUS_COLOR[dc.status],
              shadowColor: STATUS_COLOR[dc.status],
              shadowBlur: dc.status === "healthy" ? 6 : 14,
            },
            label: LABEL_POSITION_OVERRIDES[dc.id]
              ? { position: LABEL_POSITION_OVERRIDES[dc.id] }
              : undefined,
          })),
          symbolSize: (_: unknown, p: { data: { dc: (typeof DATA_CENTERS)[number] } }) =>
            14 + p.data.dc.capacityAccelerators / 700,
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
