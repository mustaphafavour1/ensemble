import { neutral } from "@/lib/palette";

/** Shared dark theme for every Nivo chart — SVG rendering needs literal
 * hex, not CSS custom properties, so this mirrors the design tokens by hand. */
export const nivoDarkTheme = {
  background: "transparent",
  text: { fill: neutral[400], fontSize: 11, fontFamily: "var(--font-sans)" },
  axis: {
    domain: { line: { stroke: neutral[800], strokeWidth: 1 } },
    ticks: {
      line: { stroke: neutral[800], strokeWidth: 1 },
      text: { fill: neutral[500], fontSize: 10.5 },
    },
    legend: { text: { fill: neutral[400], fontSize: 11.5 } },
  },
  grid: { line: { stroke: neutral[800], strokeWidth: 1 } },
  legends: { text: { fill: neutral[300], fontSize: 11 } },
  tooltip: {
    container: {
      background: neutral[800],
      color: neutral[50],
      fontSize: 12.5,
      borderRadius: 6,
      border: `1px solid ${neutral[700]}`,
      boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
    },
  },
  crosshair: {
    line: { stroke: neutral[500], strokeWidth: 1, strokeOpacity: 0.5 },
  },
};
