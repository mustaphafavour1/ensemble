"use client";

import { ResponsivePie } from "@nivo/pie";
import { getTaskWeightBreakdown } from "@/lib/mock/analytics";
import { nivoDarkTheme } from "@/lib/nivo-theme";
import { neutral } from "@/lib/palette";

export function TaskWeightChart() {
  const data = getTaskWeightBreakdown().map((w) => ({
    id: w.weight,
    label: w.weight,
    value: w.runs,
    color: w.color,
  }));

  return (
    <ResponsivePie
      data={data}
      theme={nivoDarkTheme}
      margin={{ top: 16, right: 16, bottom: 56, left: 16 }}
      innerRadius={0.62}
      padAngle={1.5}
      cornerRadius={3}
      colors={{ datum: "data.color" }}
      borderWidth={0}
      enableArcLinkLabels={false}
      arcLabelsSkipAngle={10}
      arcLabelsTextColor={neutral[950]}
      valueFormat={(v) => `${v}`}
      legends={[
        {
          anchor: "bottom",
          direction: "row",
          translateY: 46,
          itemWidth: 66,
          itemHeight: 14,
          symbolShape: "circle",
          symbolSize: 8,
          itemTextColor: neutral[300],
        },
      ]}
      tooltip={({ datum }) => (
        <div className="rounded-md border border-neutral-700 bg-neutral-800 px-2.5 py-1.5 text-2xs">
          <p className="font-medium text-ink-em">
            {datum.label}: {datum.value} runs
          </p>
        </div>
      )}
    />
  );
}
