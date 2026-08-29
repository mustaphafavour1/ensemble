import { Rng } from "@/lib/mock/rng";

export interface HexCloudSource {
  id: string;
  lon: number;
  lat: number;
  value: number;
}

export interface HexCloudPoint {
  position: [number, number];
  weight: number;
  sourceId: string;
}

const METERS_PER_DEG_LAT = 110_574;

function metersPerDegLon(latDeg: number): number {
  return 111_320 * Math.cos((latDeg * Math.PI) / 180);
}

/**
 * deck.gl's HexagonLayer aggregates many raw points into bins — feeding it a
 * handful of pre-aggregated summary values directly would light up one
 * isolated hexagon per source. This scatters a seeded, radially-biased
 * jitter cloud around each source instead (dense at the center, sparse at
 * the edge), so the aggregator produces a multi-hexagon cluster whose
 * combined SUM recovers the source's original value.
 */
export function generateHexCloud(sources: readonly HexCloudSource[], seed: number): HexCloudPoint[] {
  const rng = new Rng(seed);
  const maxValue = Math.max(...sources.map((s) => s.value), 1);
  const points: HexCloudPoint[] = [];

  for (const source of sources) {
    const intensity = source.value / maxValue;
    const count = Math.max(18, Math.min(70, Math.round(source.value / 3)));
    const maxRadiusM = 85_000 + intensity * 150_000;
    const lonScale = metersPerDegLon(source.lat);
    const weight = source.value / count;

    for (let i = 0; i < count; i++) {
      const r = maxRadiusM * rng.float(0, 1) ** 2;
      const angle = rng.float(0, Math.PI * 2);
      const dNorthM = r * Math.sin(angle);
      const dEastM = r * Math.cos(angle);
      points.push({
        position: [source.lon + dEastM / lonScale, source.lat + dNorthM / METERS_PER_DEG_LAT],
        weight,
        sourceId: source.id,
      });
    }
  }

  return points;
}
