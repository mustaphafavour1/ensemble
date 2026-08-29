import type { CustomSeriesOption, CustomSeriesRenderItemAPI, CustomSeriesRenderItemParams } from "echarts";
import { brand, warning, danger } from "@/lib/palette";

/**
 * A "beehive" hex-grid heat overlay for an ECharts geo map: every cell in a
 * touching hexagon tiling gets a Gaussian-weighted glow from nearby points,
 * so activity reads as lit-up hexagons rather than discrete dots or a blur.
 *
 * The grid is built in pixel space (via api.coord) rather than lon/lat, so
 * hexagons stay regular regardless of the geo projection's lon/lat aspect —
 * this also means the tiling is computed fresh on every render, including
 * roam/zoom, since api.coord always reflects the current transform.
 */

export interface HexHeatPoint {
  lon: number;
  lat: number;
  value: number;
}

interface HexCell {
  cx: number;
  cy: number;
  t: number;
}

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

const BRAND_RGB = hexToRgb(brand[500]);
const WARNING_RGB = hexToRgb(warning[500]);
const DANGER_RGB = hexToRgb(danger[500]);

function colorForIntensity(t: number): string {
  if (t <= 0.015) return "rgba(255,255,255,0.02)";
  const alpha = Math.min(0.9, 0.18 + t * 0.78);
  let rgb: [number, number, number];
  if (t < 0.45) {
    const lt = t / 0.45;
    rgb = [
      lerp(BRAND_RGB[0] * 0.55, BRAND_RGB[0], lt),
      lerp(BRAND_RGB[1] * 0.55, BRAND_RGB[1], lt),
      lerp(BRAND_RGB[2] * 0.55, BRAND_RGB[2], lt),
    ];
  } else if (t < 0.75) {
    const lt = (t - 0.45) / 0.3;
    rgb = [
      lerp(BRAND_RGB[0], WARNING_RGB[0], lt),
      lerp(BRAND_RGB[1], WARNING_RGB[1], lt),
      lerp(BRAND_RGB[2], WARNING_RGB[2], lt),
    ];
  } else {
    const lt = (t - 0.75) / 0.25;
    rgb = [
      lerp(WARNING_RGB[0], DANGER_RGB[0], lt),
      lerp(WARNING_RGB[1], DANGER_RGB[1], lt),
      lerp(WARNING_RGB[2], DANGER_RGB[2], lt),
    ];
  }
  return `rgba(${Math.round(rgb[0])},${Math.round(rgb[1])},${Math.round(rgb[2])},${alpha.toFixed(2)})`;
}

function hexagonPoints(cx: number, cy: number, r: number): number[][] {
  const pts: number[][] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 180) * (60 * i - 30);
    pts.push([cx + r * Math.cos(angle), cy + r * Math.sin(angle)]);
  }
  return pts;
}

export function createHexHeatSeries(
  points: HexHeatPoint[],
  opts: {
    boundingCoords: [[number, number], [number, number]];
    hexRadiusPx?: number;
    sigmaPx?: number;
    maxValue?: number;
    geoIndex?: number;
  },
): CustomSeriesOption {
  const { boundingCoords, hexRadiusPx = 13, sigmaPx = 65, geoIndex = 0 } = opts;
  const maxValue = opts.maxValue ?? Math.max(...points.map((p) => p.value), 1);
  const [[lonMin, latMax], [lonMax, latMin]] = boundingCoords;
  const MAX_CELLS = 2600;

  let cache: HexCell[] | null = null;

  function buildGrid(api: CustomSeriesRenderItemAPI): HexCell[] {
    const topLeft = api.coord([lonMin, latMax]) as unknown as number[];
    const bottomRight = api.coord([lonMax, latMin]) as unknown as number[];
    const pxPerDegLon = (bottomRight[0] - topLeft[0]) / (lonMax - lonMin);
    const pxPerDegLat = (bottomRight[1] - topLeft[1]) / (latMin - latMax);

    const hexW = Math.sqrt(3) * hexRadiusPx;
    const vertSpacing = 1.5 * hexRadiusPx;

    const lonStep = hexW / Math.abs(pxPerDegLon);
    const latStep = vertSpacing / Math.abs(pxPerDegLat);

    const cols = Math.min(120, Math.ceil((lonMax - lonMin) / lonStep) + 2);
    const rows = Math.min(80, Math.ceil((latMax - latMin) / latStep) + 2);

    const hotspotsPx = points.map((p) => {
      const c = api.coord([p.lon, p.lat]) as unknown as number[];
      return { x: c[0], y: c[1], value: p.value };
    });

    const cells: HexCell[] = [];
    for (let row = 0; row < rows; row++) {
      const lat = latMax - row * latStep;
      const rowOffset = row % 2 === 1 ? lonStep / 2 : 0;
      for (let col = 0; col < cols; col++) {
        const lon = lonMin - lonStep + rowOffset + col * lonStep;
        const c = api.coord([lon, lat]) as unknown as number[];
        const cx = c[0];
        const cy = c[1];

        // Max, not sum — with ~20 points, summing overlapping Gaussian tails
        // washes the whole map out to full intensity; each cell should glow
        // from its single nearest/strongest hotspot, not accumulate all of them.
        let intensity = 0;
        for (const h of hotspotsPx) {
          const dx = cx - h.x;
          const dy = cy - h.y;
          const d2 = dx * dx + dy * dy;
          const contribution = (h.value / maxValue) * Math.exp(-d2 / (2 * sigmaPx * sigmaPx));
          if (contribution > intensity) intensity = contribution;
        }
        cells.push({ cx, cy, t: Math.min(1, intensity) });
      }
    }
    return cells;
  }

  return {
    type: "custom",
    name: "Hex activity",
    coordinateSystem: "geo",
    geoIndex,
    silent: true,
    data: new Array(MAX_CELLS).fill(0),
    renderItem(params: CustomSeriesRenderItemParams, api: CustomSeriesRenderItemAPI) {
      if (params.dataIndex === 0 || !cache) {
        cache = buildGrid(api);
      }
      const cell = cache[params.dataIndex];
      if (!cell) return undefined;
      return {
        type: "polygon",
        shape: { points: hexagonPoints(cell.cx, cell.cy, hexRadiusPx * 0.98) },
        style: {
          fill: colorForIntensity(cell.t),
          stroke: "rgba(255,255,255,0.05)",
          lineWidth: 1,
        },
        silent: true,
      };
    },
  };
}
