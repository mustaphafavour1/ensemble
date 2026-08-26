"use client";

import { ResponsiveLine } from "@nivo/line";
import { DAILY_METRICS_90D } from "@/lib/mock/analytics";
import { nivoDarkTheme } from "@/lib/nivo-theme";
import { brand } from "@/lib/palette";
import { sparseTicks } from "@/lib/chart-utils";

export function AiAdoptionChart() {
  const labels = DAILY_METRICS_90D.map((d) => new Date(d.timestamp).toISOString().slice(0, 10));
  const data = [
    {
      id: "AI-authored",
      data: DAILY_METRICS_90D.map((d, i) => ({
        x: labels[i],
        y: d.aiAuthoredPct,
      })),
    },
  ];

  return (
    <ResponsiveLine
      data={data}
      theme={nivoDarkTheme}
      margin={{ top: 12, right: 20, bottom: 36, left: 44 }}
      xScale={{ type: "point" }}
      yScale={{ type: "linear", min: 0, max: 100 }}
      curve="monotoneX"
      enableArea
      areaOpacity={0.16}
      lineWidth={2}
      colors={[brand[500]]}
      axisBottom={{
        tickValues: sparseTicks(labels, 7),
        format: (v: string) =>
          new Date(v).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      }}
      axisLeft={{ tickValues: 5, format: (v) => `${v}%` }}
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
            AI-authored: {point.data.y}%
          </p>
        </div>
      )}
    />
  );
}
