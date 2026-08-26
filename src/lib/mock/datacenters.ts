import { Rng } from "./rng";

export type DcStatus = "healthy" | "degraded" | "critical";

export interface DataCenter {
  id: string;
  name: string;
  country: string;
  region: string;
  lat: number;
  lon: number;
  status: DcStatus;
  loadPct: number;
  capacityAccelerators: number;
  powerMw: number;
}

const DC_DEFS: Omit<DataCenter, "status" | "loadPct">[] = [
  { id: "dc-ashburn", name: "Ashburn", country: "United States", region: "us-east-1", lat: 39.04, lon: -77.49, capacityAccelerators: 5200, powerMw: 78 },
  { id: "dc-dalles", name: "The Dalles", country: "United States", region: "us-west-1", lat: 45.6, lon: -121.18, capacityAccelerators: 4100, powerMw: 62 },
  { id: "dc-council-bluffs", name: "Council Bluffs", country: "United States", region: "us-central-1", lat: 41.26, lon: -95.86, capacityAccelerators: 3600, powerMw: 55 },
  { id: "dc-toronto", name: "Toronto", country: "Canada", region: "ca-central-1", lat: 43.65, lon: -79.38, capacityAccelerators: 1800, powerMw: 28 },
  { id: "dc-sao-paulo", name: "São Paulo", country: "Brazil", region: "sa-east-1", lat: -23.55, lon: -46.63, capacityAccelerators: 1400, powerMw: 21 },
  { id: "dc-dublin", name: "Dublin", country: "Ireland", region: "eu-west-1", lat: 53.35, lon: -6.26, capacityAccelerators: 3900, powerMw: 58 },
  { id: "dc-london", name: "London", country: "United Kingdom", region: "eu-west-2", lat: 51.51, lon: -0.13, capacityAccelerators: 2600, powerMw: 40 },
  { id: "dc-frankfurt", name: "Frankfurt", country: "Germany", region: "eu-central-1", lat: 50.11, lon: 8.68, capacityAccelerators: 3200, powerMw: 48 },
  { id: "dc-johannesburg", name: "Johannesburg", country: "South Africa", region: "af-south-1", lat: -26.2, lon: 28.05, capacityAccelerators: 900, powerMw: 14 },
  { id: "dc-mumbai", name: "Mumbai", country: "India", region: "ap-south-1", lat: 19.08, lon: 72.88, capacityAccelerators: 2200, powerMw: 34 },
  { id: "dc-singapore", name: "Singapore", country: "Singapore", region: "ap-southeast-1", lat: 1.35, lon: 103.82, capacityAccelerators: 2900, powerMw: 44 },
  { id: "dc-tokyo", name: "Tokyo", country: "Japan", region: "ap-northeast-1", lat: 35.68, lon: 139.65, capacityAccelerators: 3300, powerMw: 50 },
  { id: "dc-seoul", name: "Seoul", country: "South Korea", region: "ap-northeast-2", lat: 37.57, lon: 126.98, capacityAccelerators: 1700, powerMw: 26 },
  { id: "dc-sydney", name: "Sydney", country: "Australia", region: "ap-southeast-2", lat: -33.87, lon: 151.21, capacityAccelerators: 1600, powerMw: 24 },
];

const STATUS_WEIGHTS: [DcStatus, number][] = [
  ["healthy", 80],
  ["degraded", 15],
  ["critical", 5],
];

function generateDataCenters(): DataCenter[] {
  const rng = new Rng(3387);
  return DC_DEFS.map((dc) => ({
    ...dc,
    status: rng.pickWeighted(STATUS_WEIGHTS),
    loadPct: rng.int(38, 91),
  }));
}

export const DATA_CENTERS: DataCenter[] = generateDataCenters();
