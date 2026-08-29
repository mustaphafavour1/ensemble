"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import DeckGL from "@deck.gl/react";
import { WebMercatorViewport, type PickingInfo } from "@deck.gl/core";
import { GeoJsonLayer } from "@deck.gl/layers";
import { HexagonLayer } from "@deck.gl/aggregation-layers";
import type { HexCloudPoint } from "./hex-cloud";
import { neutral } from "@/lib/palette";
import { inter } from "@/lib/fonts";
import worldGeoJson from "./world-110m.json";

const FONT = inter.style.fontFamily;

const WORLD_BOUNDS: [[number, number], [number, number]] = [
  [-170, -45],
  [170, 65],
];

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Low-to-high intensity ramp: dim brand green through bright green, amber, and red. */
export const HEX_COLOR_RANGE: [number, number, number][] = [
  hexToRgb("#087151"),
  hexToRgb("#03B982"),
  hexToRgb("#22F9B8"),
  hexToRgb("#F59E0B"),
  hexToRgb("#EF4444"),
  hexToRgb("#AB1414"),
];

const BASEMAP_LINE_COLOR = hexToRgb(neutral[700]);

const TOOLTIP_STYLE: Partial<CSSStyleDeclaration> = {
  backgroundColor: neutral[900],
  border: `1px solid ${neutral[700]}`,
  borderRadius: "6px",
  padding: "8px",
  fontFamily: FONT,
  fontSize: "12.5px",
  color: "#F1F5F9",
  maxWidth: "260px",
};

interface DeckViewState {
  longitude: number;
  latitude: number;
  zoom: number;
  pitch: number;
  bearing: number;
  minZoom: number;
  maxZoom: number;
}

export interface WorldHexbinMapProps {
  points: HexCloudPoint[];
  radiusMeters?: number;
  coverage?: number;
  getTooltip?: (points: HexCloudPoint[]) => string | null;
}

/**
 * Shared deck.gl basemap + HexagonLayer renderer: a beehive of touching
 * hexagons color-coded by aggregated weight. Used by both the Regional
 * Breakdown map and the Data Center Map so they share one visual language.
 */
export function WorldHexbinMap({ points, radiusMeters = 300_000, coverage = 0.97, getTooltip }: WorldHexbinMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewState, setViewState] = useState<DeckViewState | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || viewState) return;

    const measure = () => {
      const { width, height } = el.getBoundingClientRect();
      if (width === 0 || height === 0) return;
      const fitted = new WebMercatorViewport({ width, height }).fitBounds(WORLD_BOUNDS, { padding: 16 });
      setViewState({
        longitude: fitted.longitude,
        latitude: fitted.latitude,
        zoom: fitted.zoom,
        pitch: 0,
        bearing: 0,
        minZoom: fitted.zoom,
        maxZoom: fitted.zoom + 6,
      });
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [viewState]);

  const layers = useMemo(() => {
    if (!viewState) return [];
    return [
      new GeoJsonLayer({
        id: "world-basemap",
        data: worldGeoJson as GeoJSON.FeatureCollection,
        stroked: true,
        filled: true,
        getFillColor: [255, 255, 255, 13],
        getLineColor: BASEMAP_LINE_COLOR,
        lineWidthMinPixels: 0.6,
        pickable: false,
      }),
      new HexagonLayer<HexCloudPoint>({
        id: "hexbin",
        data: points,
        getPosition: (d) => d.position,
        getColorWeight: (d) => d.weight,
        colorAggregation: "SUM",
        colorRange: HEX_COLOR_RANGE,
        radius: radiusMeters,
        coverage,
        extruded: false,
        gpuAggregation: false,
        pickable: true,
        autoHighlight: true,
        highlightColor: [255, 255, 255, 60],
      }),
    ];
  }, [points, radiusMeters, coverage, viewState]);

  return (
    <div ref={containerRef} className="relative size-full">
      {viewState && (
        <DeckGL
          initialViewState={viewState}
          controller={{ dragRotate: false, touchRotate: false }}
          layers={layers}
          getTooltip={({ object }: PickingInfo<{ points?: HexCloudPoint[] }>) => {
            if (!object?.points || !getTooltip) return null;
            const html = getTooltip(object.points);
            return html ? { html, style: TOOLTIP_STYLE } : null;
          }}
          style={{ position: "absolute", inset: "0" }}
        />
      )}
    </div>
  );
}
