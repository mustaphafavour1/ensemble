"use client";

import { useState } from "react";
import { ResponsiveBar } from "@nivo/bar";
import { getCostByAgent } from "@/lib/mock/analytics";
import { nivoDarkTheme } from "@/lib/nivo-theme";
import { brand } from "@/lib/palette";

export function CostByAgentChart() {
  const [hovered, setHovered] = useState<string | null>(null);
  const data = getCostByAgent()
    .slice()
    .sort((a, b) => a.costUsd - b.costUsd)
    .map((a) => ({ label: a.agentName, cost: a.costUsd, runs: a.runs }));

  return (
    <ResponsiveBar
      data={data}
      keys={["cost"]}
      indexBy="label"
      layout="horizontal"
      theme={nivoDarkTheme}
      margin={{ top: 4, right: 24, bottom: 24, left: 110 }}
      padding={0.35}
      borderRadius={2}
      colors={(bar) => (bar.indexValue === hovered ? brand[300] : brand[500])}
      onMouseEnter={(bar) => setHovered(String(bar.indexValue))}
      onMouseLeave={() => setHovered(null)}
      axisBottom={{ tickValues: 4, format: (v) => `$${v}` }}
      axisLeft={{ tickSize: 0, tickPadding: 8 }}
      enableGridY={false}
      enableGridX
      enableLabel={false}
      tooltip={({ data }) => (
        <div className="rounded-md border border-neutral-700 bg-neutral-800 px-2.5 py-1.5 text-2xs">
          <p className="font-medium text-ink-em">{data.label}</p>
          <p className="mt-0.5 text-ink-faint">
            ${(data.cost as number).toFixed(2)} · {data.runs as number} runs
          </p>
        </div>
      )}
    />
  );
}
