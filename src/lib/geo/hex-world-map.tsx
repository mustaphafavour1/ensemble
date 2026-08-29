"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { neutral, brand, warning, danger } from "@/lib/palette";
import { TONE_CLASSES } from "@/components/status-badge";
import { cn } from "@/lib/utils";
import landHexData from "./land-hexes.json";

interface LandHex {
  cx: number;
  cy: number;
}

interface LandHexData {
  viewBoxWidth: number;
  viewBoxHeight: number;
  hexRadius: number;
  bounds: { lonMin: number; lonMax: number; latMin: number; latMax: number };
  hexes: LandHex[];
}

const LAND = landHexData as LandHexData;
const SIGMA = 26;
const HOVER_THRESHOLD = 0.08;
const MAX_ZOOM_IN = 8;

function hexagonPoints(cx: number, cy: number, r: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 180) * (60 * i - 30);
    pts.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
  }
  return pts.join(" ");
}

// Static land-grid geometry never changes across instances, so compute it once.
const HEX_POLYGONS = LAND.hexes.map((h) => hexagonPoints(h.cx, h.cy, LAND.hexRadius * 0.92));

function project(lon: number, lat: number): { x: number; y: number } {
  const { lonMin, lonMax, latMin, latMax } = LAND.bounds;
  return {
    x: ((lon - lonMin) / (lonMax - lonMin)) * LAND.viewBoxWidth,
    y: ((latMax - lat) / (latMax - latMin)) * LAND.viewBoxHeight,
  };
}

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function lerpRgb(a: [number, number, number], b: [number, number, number], t: number): [number, number, number] {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

const BASE_RGB = hexToRgb(neutral[800]);
const BRAND_RGB = hexToRgb(brand[500]);
const WARNING_RGB = hexToRgb(warning[500]);
const DANGER_RGB = hexToRgb(danger[500]);
const STROKE_COLOR = "rgba(2,6,23,0.55)";

function intensityColor(t: number): string {
  if (t < 0.04) return neutral[800];
  let rgb: [number, number, number];
  if (t < 0.5) rgb = lerpRgb(BASE_RGB, BRAND_RGB, t / 0.5);
  else if (t < 0.8) rgb = lerpRgb(BRAND_RGB, WARNING_RGB, (t - 0.5) / 0.3);
  else rgb = lerpRgb(WARNING_RGB, DANGER_RGB, (t - 0.8) / 0.2);
  return `rgb(${Math.round(rgb[0])},${Math.round(rgb[1])},${Math.round(rgb[2])})`;
}

type Tone = "brand" | "warning" | "danger";

function toneFor(t: number): Tone {
  if (t >= 0.8) return "danger";
  if (t >= 0.5) return "warning";
  return "brand";
}

const DOT_CLASS: Record<Tone, string> = {
  brand: "bg-brand-400",
  warning: "bg-warning-300",
  danger: "bg-danger-300",
};

/** Anchors a card/tooltip near (leftPct,topPct) while nudging it away from the nearest edge. */
function edgeAwareTransform(leftPct: number, topPct: number, gap = 8): string {
  const tx = leftPct > 65 ? `calc(-100% - ${gap}px)` : `${gap}px`;
  const ty = topPct < 22 ? `${gap}px` : `calc(-100% - ${gap}px)`;
  return `translate(${tx}, ${ty})`;
}

interface ViewRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

const FULL_VIEW: ViewRect = { x: 0, y: 0, w: LAND.viewBoxWidth, h: LAND.viewBoxHeight };

function clampWidth(w: number): number {
  return Math.min(FULL_VIEW.w, Math.max(FULL_VIEW.w / MAX_ZOOM_IN, w));
}

function clampPan(x: number, y: number, w: number, h: number): ViewRect {
  return {
    x: Math.min(Math.max(x, 0), Math.max(0, FULL_VIEW.w - w)),
    y: Math.min(Math.max(y, 0), Math.max(0, FULL_VIEW.h - h)),
    w,
    h,
  };
}

export interface HexWorldMapPoint {
  id: string;
  lon: number;
  lat: number;
  value: number;
}

export interface HexWorldMapProps<T extends HexWorldMapPoint> {
  points: T[];
  calloutCount?: number;
  icon: LucideIcon;
  formatCallout: (point: T) => { title: string; metric: string };
  formatTooltip: (point: T) => { title: string; lines: string[] };
}

export function HexWorldMap<T extends HexWorldMapPoint>({
  points,
  calloutCount = 4,
  icon: Icon,
  formatCallout,
  formatTooltip,
}: HexWorldMapProps<T>) {
  const svgRef = useRef<SVGSVGElement>(null);
  const dragRef = useRef<{ mouseX: number; mouseY: number; view: ViewRect } | null>(null);
  const [view, setView] = useState<ViewRect>(FULL_VIEW);
  const [isDragging, setIsDragging] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Native listener, not React's onWheel — React marks wheel handlers passive
  // by default, which would silently swallow preventDefault and let the page
  // scroll along with the zoom.
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    function handleWheel(e: WheelEvent) {
      e.preventDefault();
      const rect = svg!.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      setView((v) => {
        const zoomFactor = Math.exp(-e.deltaY * 0.0015);
        const newW = clampWidth(v.w / zoomFactor);
        const scale = newW / v.w;
        const newH = v.h * scale;
        const cursorX = v.x + px * v.w;
        const cursorY = v.y + py * v.h;
        return clampPan(cursorX - px * newW, cursorY - py * newH, newW, newH);
      });
    }

    svg.addEventListener("wheel", handleWheel, { passive: false });
    return () => svg.removeEventListener("wheel", handleWheel);
  }, []);

  useEffect(() => {
    if (!isDragging) return;

    function handleMove(e: MouseEvent) {
      const drag = dragRef.current;
      const svg = svgRef.current;
      if (!drag || !svg) return;
      const rect = svg.getBoundingClientRect();
      const dxUser = (-(e.clientX - drag.mouseX) / rect.width) * drag.view.w;
      const dyUser = (-(e.clientY - drag.mouseY) / rect.height) * drag.view.h;
      setView(clampPan(drag.view.x + dxUser, drag.view.y + dyUser, drag.view.w, drag.view.h));
    }
    function handleUp() {
      dragRef.current = null;
      setIsDragging(false);
    }

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [isDragging]);

  function handleMouseDown(e: React.MouseEvent<SVGSVGElement>) {
    if (e.button !== 0) return;
    dragRef.current = { mouseX: e.clientX, mouseY: e.clientY, view };
    setIsDragging(true);
    setHoveredId(null);
  }

  const pointById = useMemo(() => new Map(points.map((p) => [p.id, p])), [points]);

  const projected = useMemo(
    () => points.map((p) => ({ point: p, ...project(p.lon, p.lat) })),
    [points],
  );

  const hexCells = useMemo(() => {
    const maxValue = Math.max(...points.map((p) => p.value), 1);
    return LAND.hexes.map((hex, i) => {
      let bestT = 0;
      let bestId: string | null = null;
      for (const { point, x, y } of projected) {
        const dx = hex.cx - x;
        const dy = hex.cy - y;
        const d2 = dx * dx + dy * dy;
        const w = (point.value / maxValue) * Math.exp(-d2 / (2 * SIGMA * SIGMA));
        if (w > bestT) {
          bestT = w;
          bestId = point.id;
        }
      }
      return {
        poly: HEX_POLYGONS[i],
        fill: intensityColor(Math.min(1, bestT)),
        pointId: bestT > HOVER_THRESHOLD ? bestId : null,
      };
    });
  }, [points, projected]);

  const callouts = useMemo(() => {
    const maxValue = Math.max(...points.map((p) => p.value), 1);
    return [...points]
      .sort((a, b) => b.value - a.value)
      .slice(0, calloutCount)
      .map((point) => {
        const { x, y } = project(point.lon, point.lat);
        const t = point.value / maxValue;
        return { point, x, y, tone: toneFor(t), ...formatCallout(point) };
      });
  }, [points, calloutCount, formatCallout]);

  const hovered = hoveredId ? pointById.get(hoveredId) ?? null : null;
  const hoveredPos = hovered ? project(hovered.lon, hovered.lat) : null;
  const hoveredTooltip = hovered ? formatTooltip(hovered) : null;
  const hoveredLeftPct = hoveredPos ? ((hoveredPos.x - view.x) / view.w) * 100 : 0;
  const hoveredTopPct = hoveredPos ? ((hoveredPos.y - view.y) / view.h) * 100 : 0;

  return (
    <div className="relative size-full overflow-hidden">
      <svg
        ref={svgRef}
        viewBox={`${view.x} ${view.y} ${view.w} ${view.h}`}
        className={cn("size-full touch-none select-none", isDragging ? "cursor-grabbing" : "cursor-grab")}
        preserveAspectRatio="xMidYMid meet"
        onMouseDown={handleMouseDown}
        onDoubleClick={() => setView(FULL_VIEW)}
      >
        {hexCells.map((cell, i) => (
          <polygon
            key={i}
            points={cell.poly}
            fill={cell.fill}
            stroke={STROKE_COLOR}
            strokeWidth={0.5}
            style={cell.pointId ? { cursor: "pointer", transition: "opacity 120ms" } : undefined}
            opacity={cell.pointId && hoveredId && cell.pointId !== hoveredId ? 0.85 : 1}
            onMouseEnter={cell.pointId && !isDragging ? () => setHoveredId(cell.pointId) : undefined}
            onMouseLeave={cell.pointId && !isDragging ? () => setHoveredId(null) : undefined}
          />
        ))}
      </svg>

      <div className="pointer-events-none absolute inset-0">
        {callouts.map(({ point, x, y, tone, title, metric }) => {
          const leftPct = ((x - view.x) / view.w) * 100;
          const topPct = ((y - view.y) / view.h) * 100;
          if (leftPct < -8 || leftPct > 108 || topPct < -8 || topPct > 108) return null;
          return (
            <div key={point.id}>
              <div
                className="absolute flex size-1.5"
                style={{ left: `${leftPct}%`, top: `${topPct}%`, transform: "translate(-50%, -50%)" }}
              >
                <span className={cn("absolute inline-flex size-full animate-ping rounded-full opacity-70", DOT_CLASS[tone])} />
                <span className={cn("relative inline-flex size-1.5 rounded-full", DOT_CLASS[tone])} />
              </div>
              <div
                className="absolute z-10"
                style={{ left: `${leftPct}%`, top: `${topPct}%`, transform: edgeAwareTransform(leftPct, topPct) }}
              >
                <div className="flex w-max items-center gap-1.5 rounded-lg border border-neutral-700/80 bg-neutral-900/90 px-2 py-1.5 shadow-lg backdrop-blur-sm">
                  <span className={cn("flex size-5 shrink-0 items-center justify-center rounded-md", TONE_CLASSES[tone])}>
                    <Icon className="size-3" strokeWidth={2} />
                  </span>
                  <div className="leading-tight">
                    <p className="text-[9px] text-ink-faint">{title}</p>
                    <p className="text-[11px] font-semibold tabular-nums text-ink-em">{metric}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {hovered && hoveredPos && hoveredTooltip && (
          <div
            className="absolute z-20 min-w-max rounded-md border border-neutral-700 bg-neutral-900/95 px-2.5 py-2 text-2xs shadow-lg backdrop-blur-sm"
            style={{
              left: `${hoveredLeftPct}%`,
              top: `${hoveredTopPct}%`,
              transform: `translate(-50%, ${hoveredTopPct < 22 ? "12px" : "calc(-100% - 12px)"})`,
            }}
          >
            <p className="font-medium text-ink-em">{hoveredTooltip.title}</p>
            {hoveredTooltip.lines.map((line, i) => (
              <p key={i} className="mt-0.5 text-ink-faint">
                {line}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
