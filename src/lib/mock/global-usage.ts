import { Rng } from "./rng";

export type UsageStatus = "normal" | "elevated" | "degraded";

export interface UsageHotspot {
  id: string;
  city: string;
  country: string;
  lat: number;
  lon: number;
  activeUsersM: number;
  status: UsageStatus;
}

const HOTSPOT_DEFS: { id: string; city: string; country: string; lat: number; lon: number; weight: number }[] = [
  { id: "us-east", city: "New York", country: "United States", lat: 40.71, lon: -74.01, weight: 34 },
  { id: "us-west", city: "San Francisco", country: "United States", lat: 37.77, lon: -122.42, weight: 26 },
  { id: "brazil", city: "São Paulo", country: "Brazil", lat: -23.55, lon: -46.63, weight: 22 },
  { id: "mexico", city: "Mexico City", country: "Mexico", lat: 19.43, lon: -99.13, weight: 12 },
  { id: "uk", city: "London", country: "United Kingdom", lat: 51.51, lon: -0.13, weight: 24 },
  { id: "germany", city: "Berlin", country: "Germany", lat: 52.52, lon: 13.4, weight: 17 },
  { id: "france", city: "Paris", country: "France", lat: 48.85, lon: 2.35, weight: 15 },
  { id: "spain", city: "Madrid", country: "Spain", lat: 40.42, lon: -3.7, weight: 10 },
  { id: "nigeria", city: "Lagos", country: "Nigeria", lat: 6.52, lon: 3.38, weight: 9 },
  { id: "south-africa", city: "Johannesburg", country: "South Africa", lat: -26.2, lon: 28.05, weight: 7 },
  { id: "india-mumbai", city: "Mumbai", country: "India", lat: 19.08, lon: 72.88, weight: 30 },
  { id: "india-bengaluru", city: "Bengaluru", country: "India", lat: 12.97, lon: 77.59, weight: 21 },
  { id: "china", city: "Shanghai", country: "China", lat: 31.23, lon: 121.47, weight: 28 },
  { id: "japan", city: "Tokyo", country: "Japan", lat: 35.68, lon: 139.65, weight: 20 },
  { id: "south-korea", city: "Seoul", country: "South Korea", lat: 37.57, lon: 126.98, weight: 16 },
  { id: "singapore", city: "Singapore", country: "Singapore", lat: 1.35, lon: 103.82, weight: 14 },
  { id: "indonesia", city: "Jakarta", country: "Indonesia", lat: -6.2, lon: 106.85, weight: 13 },
  { id: "australia", city: "Sydney", country: "Australia", lat: -33.87, lon: 151.21, weight: 11 },
  { id: "canada", city: "Toronto", country: "Canada", lat: 43.65, lon: -79.38, weight: 13 },
  { id: "uae", city: "Dubai", country: "United Arab Emirates", lat: 25.2, lon: 55.27, weight: 8 },
];

const STATUS_WEIGHTS: [UsageStatus, number][] = [
  ["normal", 78],
  ["elevated", 16],
  ["degraded", 6],
];

function generateHotspots(): UsageHotspot[] {
  const rng = new Rng(4471);
  return HOTSPOT_DEFS.map((h) => ({
    id: h.id,
    city: h.city,
    country: h.country,
    lat: h.lat,
    lon: h.lon,
    activeUsersM: Math.round(h.weight * rng.float(0.85, 1.15) * 10) / 10,
    status: rng.pickWeighted(STATUS_WEIGHTS),
  }));
}

export const USAGE_HOTSPOTS: UsageHotspot[] = generateHotspots();

export function getOverallUsageStatus(): UsageStatus {
  if (USAGE_HOTSPOTS.some((h) => h.status === "degraded")) return "degraded";
  if (USAGE_HOTSPOTS.some((h) => h.status === "elevated")) return "elevated";
  return "normal";
}
