"use client";

import { useState } from "react";
import { ResponsiveBar } from "@nivo/bar";
import { DAILY_METRICS_30D } from "@/lib/mock/analytics";
import { nivoDarkTheme } from "@/lib/nivo-theme";
import { warning } from "@/lib/palette";
import { sparseTicks } from "@/lib/chart-utils";

export function TokenChart() {
  const [hovered, setHovered] = useState<string | null>(null);
  const data = DAILY_METRICS_30D.map((d) => ({
    label: new Date(d.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    tokens: Math.round(d.tokens / 1000),
  }));
  const labels = data.map((d) => d.label);

  return (
    <ResponsiveBar
      data={data}
      keys={["tokens"]}
      indexBy="label"
      theme={nivoDarkTheme}
      margin={{ top: 12, right: 16, bottom: 32, left: 44 }}
      padding={0.45}
      borderRadius={2}
      colors={(bar) => (bar.indexValue === hovered ? warning[100] : warning[500])}
      defs={[
        {
          id: "tokenGradient",
          type: "linearGradient",
          colors: [
            { offset: 0, color: warning[300] },
            { offset: 100, color: warning[700] },
          ],
        },
      ]}
      fill={[{ match: (bar) => bar.data.indexValue !== hovered, id: "tokenGradient" }]}
      onMouseEnter={(bar) => setHovered(String(bar.indexValue))}
      onMouseLeave={() => setHovered(null)}
      axisBottom={{ tickValues: sparseTicks(labels, 6) }}
      axisLeft={{ tickValues: 4, format: (v) => `${v}K` }}
      enableGridY
      enableLabel={false}
      tooltip={({ value, indexValue }) => (
        <div className="rounded-md border border-neutral-700 bg-neutral-800 px-2.5 py-1.5 text-2xs">
          <p className="text-ink-500">{indexValue}</p>
          <p className="mt-0.5 font-medium text-ink-100">{value}K tokens</p>
        </div>
      )}
    />
  );
}
