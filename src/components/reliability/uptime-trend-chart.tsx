"use client";

import { ResponsiveLine } from "@nivo/line";
import { UPTIME_TREND, SLA_TARGET } from "@/lib/mock/sla";
import { nivoDarkTheme } from "@/lib/nivo-theme";
import { sparseTicks } from "@/lib/chart-utils";
import { brand } from "@/lib/palette";

export function UptimeTrendChart() {
  const labels = UPTIME_TREND.map((d) => new Date(d.timestamp).toISOString().slice(0, 10));
  const minUptime = Math.min(...UPTIME_TREND.map((d) => d.uptimePct), SLA_TARGET);
  const data = [
    {
      id: "uptime",
      data: UPTIME_TREND.map((d, i) => ({ x: labels[i], y: d.uptimePct })),
    },
  ];

  return (
    <ResponsiveLine
      data={data}
      theme={nivoDarkTheme}
      margin={{ top: 12, right: 16, bottom: 32, left: 52 }}
      xScale={{ type: "point" }}
      yScale={{ type: "linear", min: Math.floor(minUptime * 10) / 10 - 0.1, max: 100.02 }}
      curve="monotoneX"
      enableArea
      areaOpacity={0.12}
      lineWidth={2}
      colors={[brand[500]]}
      axisBottom={{
        tickValues: sparseTicks(labels, 6),
        format: (v: string) => new Date(v).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      }}
      axisLeft={{ tickValues: 4, format: (v) => `${v}%` }}
      enableGridX={false}
      enablePoints={false}
      enableCrosshair
      useMesh
      markers={[
        {
          axis: "y",
          value: SLA_TARGET,
          lineStyle: { stroke: "#94A3B8", strokeWidth: 1, strokeDasharray: "4 4" },
          legend: `SLA target ${SLA_TARGET}%`,
          legendPosition: "top-left",
          textStyle: { fill: "#94A3B8", fontSize: 10 },
        },
      ]}
      tooltip={({ point }) => (
        <div className="rounded-md border border-neutral-700 bg-neutral-800 px-2.5 py-1.5 text-2xs">
          <p className="text-ink-faint">
            {new Date(point.data.x as string).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </p>
          <p className="mt-0.5 font-medium text-ink-em">{Number(point.data.y).toFixed(3)}% uptime</p>
        </div>
      )}
    />
  );
}
