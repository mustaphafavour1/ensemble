"use client";

import { useState } from "react";
import { ResponsiveBar } from "@nivo/bar";
import { getWeeklyMetrics } from "@/lib/mock/analytics";
import { nivoDarkTheme } from "@/lib/nivo-theme";
import { brand } from "@/lib/palette";
import { sparseTicks } from "@/lib/chart-utils";

export function DeploymentFrequencyChart() {
  const [hovered, setHovered] = useState<string | null>(null);
  const data = getWeeklyMetrics().map((w) => ({
    label: w.label,
    deployments: w.deployments,
  }));
  const labels = data.map((d) => d.label);

  return (
    <ResponsiveBar
      data={data}
      keys={["deployments"]}
      indexBy="label"
      theme={nivoDarkTheme}
      margin={{ top: 12, right: 16, bottom: 32, left: 40 }}
      padding={0.35}
      borderRadius={2}
      colors={(bar) => (bar.indexValue === hovered ? brand[100] : brand[500])}
      defs={[
        {
          id: "deployGradient",
          type: "linearGradient",
          colors: [
            { offset: 0, color: brand[300] },
            { offset: 100, color: brand[700] },
          ],
        },
      ]}
      fill={[{ match: (bar) => bar.data.indexValue !== hovered, id: "deployGradient" }]}
      onMouseEnter={(bar) => setHovered(String(bar.indexValue))}
      onMouseLeave={() => setHovered(null)}
      axisBottom={{ tickValues: sparseTicks(labels, 7) }}
      axisLeft={{ tickValues: 4 }}
      enableGridY
      enableLabel={false}
      tooltip={({ value, indexValue }) => (
        <div className="rounded-md border border-neutral-700 bg-neutral-800 px-2.5 py-1.5 text-2xs">
          <p className="text-ink-500">Week of {indexValue}</p>
          <p className="mt-0.5 font-medium text-ink-100">{value} deployments</p>
        </div>
      )}
    />
  );
}
