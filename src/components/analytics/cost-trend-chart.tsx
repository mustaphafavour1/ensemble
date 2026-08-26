"use client";

import { ResponsiveLine } from "@nivo/line";
import { DAILY_METRICS_30D } from "@/lib/mock/analytics";
import { nivoDarkTheme } from "@/lib/nivo-theme";
import { sparseTicks } from "@/lib/chart-utils";

const SKY = "#38BDF8";

export function CostTrendChart() {
  const labels = DAILY_METRICS_30D.map((d) => new Date(d.timestamp).toISOString().slice(0, 10));
  const data = [
    {
      id: "cost",
      data: DAILY_METRICS_30D.map((d, i) => ({
        x: labels[i],
        y: d.costUsd,
      })),
    },
  ];

  return (
    <ResponsiveLine
      data={data}
      theme={nivoDarkTheme}
      margin={{ top: 12, right: 16, bottom: 32, left: 48 }}
      xScale={{ type: "point" }}
      yScale={{ type: "linear", min: 0, max: "auto" }}
      curve="monotoneX"
      enableArea
      areaOpacity={0.14}
      lineWidth={2}
      colors={[SKY]}
      axisBottom={{
        tickValues: sparseTicks(labels, 6),
        format: (v: string) =>
          new Date(v).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      }}
      axisLeft={{ tickValues: 4, format: (v) => `$${v}` }}
      enableGridX={false}
      enablePoints={false}
      enableCrosshair
      useMesh
      tooltip={({ point }) => (
        <div className="rounded-md border border-neutral-700 bg-neutral-800 px-2.5 py-1.5 text-2xs">
          <p className="text-ink-faint">
            {new Date(point.data.x as string).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </p>
          <p className="mt-0.5 font-medium text-ink-em">
            ${Number(point.data.y).toFixed(2)}
          </p>
        </div>
      )}
    />
  );
}
