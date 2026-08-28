import * as echarts from "echarts";
import { neutral } from "@/lib/palette";
import worldGeoJson from "./world-110m.json";

let registered = false;

/** Idempotent — safe to call from every component that renders the world map. */
export function ensureWorldMapRegistered() {
  if (registered) return;
  echarts.registerMap("world", worldGeoJson as unknown as Parameters<typeof echarts.registerMap>[1]);
  registered = true;
}

/** Shared geo component config so every map on real coastlines looks consistent. */
export const WORLD_GEO_OPTION = {
  map: "world",
  roam: false,
  silent: true,
  boundingCoords: [
    [-170, 65],
    [170, -45],
  ] as [[number, number], [number, number]],
  itemStyle: {
    areaColor: "rgba(255,255,255,0.05)",
    borderColor: neutral[700],
    borderWidth: 0.6,
  },
  emphasis: { disabled: true },
  select: { disabled: true },
};
