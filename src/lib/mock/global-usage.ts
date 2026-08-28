import { Rng } from "./rng";

export type UsageStatus = "normal" | "elevated" | "degraded";

export interface UsageHotspot {
  id: string;
  city: string;
  country: string;
  region: string;
  lat: number;
  lon: number;
  activeUsersM: number;
  avgLatencyMs: number;
  errorRatePct: number;
  status: UsageStatus;
}

const HOTSPOT_DEFS: { id: string; city: string; country: string; region: string; lat: number; lon: number; weight: number }[] = [
  { id: "us-east", city: "New York", country: "United States", region: "North America", lat: 40.71, lon: -74.01, weight: 34 },
  { id: "us-west", city: "San Francisco", country: "United States", region: "North America", lat: 37.77, lon: -122.42, weight: 26 },
  { id: "brazil", city: "São Paulo", country: "Brazil", region: "Latin America", lat: -23.55, lon: -46.63, weight: 22 },
  { id: "mexico", city: "Mexico City", country: "Mexico", region: "Latin America", lat: 19.43, lon: -99.13, weight: 12 },
  { id: "uk", city: "London", country: "United Kingdom", region: "Europe", lat: 51.51, lon: -0.13, weight: 24 },
  { id: "germany", city: "Berlin", country: "Germany", region: "Europe", lat: 52.52, lon: 13.4, weight: 17 },
  { id: "france", city: "Paris", country: "France", region: "Europe", lat: 48.85, lon: 2.35, weight: 15 },
  { id: "spain", city: "Madrid", country: "Spain", region: "Europe", lat: 40.42, lon: -3.7, weight: 10 },
  { id: "nigeria", city: "Lagos", country: "Nigeria", region: "Middle East & Africa", lat: 6.52, lon: 3.38, weight: 9 },
  { id: "south-africa", city: "Johannesburg", country: "South Africa", region: "Middle East & Africa", lat: -26.2, lon: 28.05, weight: 7 },
  { id: "india-mumbai", city: "Mumbai", country: "India", region: "South Asia", lat: 19.08, lon: 72.88, weight: 30 },
  { id: "india-bengaluru", city: "Bengaluru", country: "India", region: "South Asia", lat: 12.97, lon: 77.59, weight: 21 },
  { id: "china", city: "Shanghai", country: "China", region: "East Asia", lat: 31.23, lon: 121.47, weight: 28 },
  { id: "japan", city: "Tokyo", country: "Japan", region: "East Asia", lat: 35.68, lon: 139.65, weight: 20 },
  { id: "south-korea", city: "Seoul", country: "South Korea", region: "East Asia", lat: 37.57, lon: 126.98, weight: 16 },
  { id: "singapore", city: "Singapore", country: "Singapore", region: "Southeast Asia", lat: 1.35, lon: 103.82, weight: 14 },
  { id: "indonesia", city: "Jakarta", country: "Indonesia", region: "Southeast Asia", lat: -6.2, lon: 106.85, weight: 13 },
  { id: "australia", city: "Sydney", country: "Australia", region: "Oceania", lat: -33.87, lon: 151.21, weight: 11 },
  { id: "canada", city: "Toronto", country: "Canada", region: "North America", lat: 43.65, lon: -79.38, weight: 13 },
  { id: "uae", city: "Dubai", country: "United Arab Emirates", region: "Middle East & Africa", lat: 25.2, lon: 55.27, weight: 8 },
];

function generateHotspots(): UsageHotspot[] {
  const rng = new Rng(4471);
  return HOTSPOT_DEFS.map((h) => {
    const hasIssue = rng.bool(0.22);
    const avgLatencyMs = hasIssue ? rng.int(340, 780) : rng.int(90, 260);
    const errorRatePct = hasIssue ? Math.round(rng.float(0.8, 3.2) * 100) / 100 : Math.round(rng.float(0.02, 0.35) * 100) / 100;
    const status: UsageStatus = errorRatePct > 1.5 || avgLatencyMs > 600 ? "degraded" : errorRatePct > 0.5 || avgLatencyMs > 300 ? "elevated" : "normal";

    return {
      id: h.id,
      city: h.city,
      country: h.country,
      region: h.region,
      lat: h.lat,
      lon: h.lon,
      activeUsersM: Math.round(h.weight * rng.float(0.85, 1.15) * 10) / 10,
      avgLatencyMs,
      errorRatePct,
      status,
    };
  });
}

export const USAGE_HOTSPOTS: UsageHotspot[] = generateHotspots();

export interface RegionSummary {
  region: string;
  activeUsersM: number;
  avgLatencyMs: number;
  errorRatePct: number;
  status: UsageStatus;
}

/** Rolls city-level hotspots up to their broader region for the ranked list. */
export function getRegionSummaries(): RegionSummary[] {
  const byRegion = new Map<string, UsageHotspot[]>();
  for (const h of USAGE_HOTSPOTS) {
    const list = byRegion.get(h.region) ?? [];
    list.push(h);
    byRegion.set(h.region, list);
  }

  return Array.from(byRegion.entries())
    .map(([region, hotspots]) => {
      const activeUsersM = Math.round(hotspots.reduce((s, h) => s + h.activeUsersM, 0) * 10) / 10;
      const avgLatencyMs = Math.round(hotspots.reduce((s, h) => s + h.avgLatencyMs, 0) / hotspots.length);
      const errorRatePct = Math.round((hotspots.reduce((s, h) => s + h.errorRatePct, 0) / hotspots.length) * 100) / 100;
      const status: UsageStatus = hotspots.some((h) => h.status === "degraded")
        ? "degraded"
        : hotspots.some((h) => h.status === "elevated")
          ? "elevated"
          : "normal";
      return { region, activeUsersM, avgLatencyMs, errorRatePct, status };
    })
    .sort((a, b) => b.activeUsersM - a.activeUsersM);
}

export function getOverallUsageStatus(): UsageStatus {
  if (USAGE_HOTSPOTS.some((h) => h.status === "degraded")) return "degraded";
  if (USAGE_HOTSPOTS.some((h) => h.status === "elevated")) return "elevated";
  return "normal";
}
