"use client";

import { useState } from "react";
import { ResponsiveBar } from "@nivo/bar";
import { getWeeklyMetrics } from "@/lib/mock/analytics";
import { nivoDarkTheme } from "@/lib/nivo-theme";
import { success, danger, neutral } from "@/lib/palette";
import { sparseTicks } from "@/lib/chart-utils";

type Hovered = { id: string; indexValue: string } | null;

export function SuccessFailureChart() {
  const [hovered, setHovered] = useState<Hovered>(null);
  const data = getWeeklyMetrics().map((w) => ({
    label: w.label,
    merged: w.merged,
    failed: w.failed,
  }));
  const labels = data.map((d) => d.label);

  const isHovered = (id: string, indexValue: unknown) =>
    hovered?.id === id && hovered?.indexValue === String(indexValue);

  return (
    <ResponsiveBar
      data={data}
      keys={["merged", "failed"]}
      indexBy="label"
      theme={nivoDarkTheme}
      margin={{ top: 16, right: 20, bottom: 36, left: 40 }}
      padding={0.35}
      innerPadding={1}
      groupMode="stacked"
      borderRadius={2}
      colors={(bar) =>
        isHovered(String(bar.id), bar.indexValue)
          ? bar.id === "merged"
            ? success[100]
            : danger[100]
          : bar.id === "merged"
            ? success[500]
            : danger[500]
      }
      defs={[
        {
          id: "mergedGradient",
          type: "linearGradient",
          colors: [
            { offset: 0, color: success[300] },
            { offset: 100, color: success[700] },
          ],
        },
        {
          id: "failedGradient",
          type: "linearGradient",
          colors: [
            { offset: 0, color: danger[300] },
            { offset: 100, color: danger[700] },
          ],
        },
      ]}
      fill={[
        { match: (bar) => bar.data.id === "merged" && !isHovered("merged", bar.data.indexValue), id: "mergedGradient" },
        { match: (bar) => bar.data.id === "failed" && !isHovered("failed", bar.data.indexValue), id: "failedGradient" },
      ]}
      onMouseEnter={(bar) => setHovered({ id: String(bar.id), indexValue: String(bar.indexValue) })}
      onMouseLeave={() => setHovered(null)}
      axisBottom={{ tickRotation: 0, tickValues: sparseTicks(labels, 7) }}
      axisLeft={{ tickValues: 5 }}
      enableGridY
      enableLabel={false}
      tooltip={({ id, value, indexValue }) => (
        <div className="rounded-md border border-neutral-700 bg-neutral-800 px-2.5 py-1.5 text-2xs">
          <p className="text-ink-500">Week of {indexValue}</p>
          <p className="mt-0.5 font-medium text-ink-100 capitalize">
            {id}: {value}
          </p>
        </div>
      )}
      legends={[
        {
          dataFrom: "keys",
          anchor: "top-left",
          direction: "row",
          translateY: -16,
          itemWidth: 70,
          itemHeight: 14,
          symbolShape: "circle",
          symbolSize: 8,
          itemTextColor: neutral[300],
        },
      ]}
    />
  );
}
