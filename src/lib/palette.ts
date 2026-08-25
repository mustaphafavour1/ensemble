/**
 * Chart-facing mirror of the CSS design tokens in globals.css.
 * Nivo/ECharts consume literal hex values, so this stays in sync by hand
 * with the @theme block — the single visual source of truth is the palette
 * documented in the build prompt (brand #00E5A0, agent #D946EF).
 */

export const neutral = {
  50: "#F8FAFC",
  100: "#F1F5F9",
  200: "#E2E8F0",
  300: "#CBD5E1",
  400: "#94A3B8",
  500: "#64748B",
  600: "#475569",
  700: "#334155",
  800: "#1E293B",
  900: "#0F172A",
  950: "#020617",
} as const;

export const brand = {
  25: "#F1FDFA",
  50: "#E6FCF5",
  100: "#CCFAEC",
  200: "#9BF8DC",
  300: "#5EF7C9",
  400: "#22F9B8",
  500: "#00E5A0",
  600: "#03B982",
  700: "#069369",
  800: "#087151",
  900: "#094E39",
} as const;

/** Reserved exclusively to mark AI-agent-authored content. */
export const agent = {
  25: "#FBF2FC",
  50: "#F8E7FB",
  100: "#F2CFF7",
  200: "#E7A1F2",
  300: "#DC68ED",
  400: "#D330EB",
  500: "#D946EF",
  600: "#CB18E5",
  700: "#A219B6",
  800: "#7C198B",
  900: "#571560",
} as const;

export const success = {
  100: "#E1EFE3",
  300: "#9BD4A3",
  500: "#3FB950",
  700: "#2A6F34",
  900: "#18381C",
} as const;

export const warning = {
  100: "#F7ECD9",
  300: "#F2C77D",
  500: "#F59E0B",
  700: "#95610A",
  900: "#493109",
} as const;

export const danger = {
  100: "#F6DADA",
  300: "#ED8383",
  500: "#EF4444",
  700: "#AB1414",
  900: "#530F0F",
} as const;

/** Extra hue for categorical chart series beyond brand/agent/semantic. */
export const sky500 = "#38BDF8";

/** Ordered categorical sequence for multi-series charts (language/stack breakdowns, etc). */
export const categorical = [
  brand[500],
  agent[500],
  warning[500],
  sky500,
  success[500],
  neutral[400],
  brand[300],
  agent[300],
];

/** Gradient stop pairs for Nivo area/bar fills, brightest at the top. */
export const gradients = {
  brand: [brand[400], brand[700]],
  agent: [agent[400], agent[800]],
  warning: [warning[300], warning[700]],
  sky: ["#7DD3FC", "#0369A1"],
  success: [success[300], success[700]],
};
