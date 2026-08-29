"use client";

import { useState } from "react";
import { ResponsiveBar } from "@nivo/bar";
import { nivoDarkTheme } from "@/lib/nivo-theme";
import { brand } from "@/lib/palette";
import type { TeamUsage } from "@/lib/mock/teams";

export function TeamRequestsChart({ usage }: { usage: TeamUsage[] }) {
  const [hovered, setHovered] = useState<string | null>(null);
  const data = usage.map((u) => ({ label: u.team.name, requests: u.requests30d }));

  return (
    <ResponsiveBar
      data={data}
      keys={["requests"]}
      indexBy="label"
      theme={nivoDarkTheme}
      margin={{ top: 12, right: 16, bottom: 56, left: 44 }}
      padding={0.35}
      borderRadius={2}
      colors={(bar) => (bar.indexValue === hovered ? brand[100] : brand[500])}
      defs={[
        {
          id: "teamReqGradient",
          type: "linearGradient",
          colors: [
            { offset: 0, color: brand[300] },
            { offset: 100, color: brand[700] },
          ],
        },
      ]}
      fill={[{ match: (bar) => bar.data.indexValue !== hovered, id: "teamReqGradient" }]}
      onMouseEnter={(bar) => setHovered(String(bar.indexValue))}
      onMouseLeave={() => setHovered(null)}
      axisBottom={{ tickRotation: -20 }}
      axisLeft={{ tickValues: 4 }}
      enableGridY
      enableLabel={false}
      tooltip={({ value, indexValue }) => (
        <div className="rounded-md border border-neutral-700 bg-neutral-800 px-2.5 py-1.5 text-2xs">
          <p className="text-ink-faint">{indexValue}</p>
          <p className="mt-0.5 font-medium text-ink-em">{value} runs</p>
        </div>
      )}
    />
  );
}
