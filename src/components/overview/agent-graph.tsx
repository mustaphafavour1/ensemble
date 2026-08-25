"use client";

import { useMemo } from "react";
import ReactECharts from "echarts-for-react";
import { ACTIVITY_GRAPH } from "@/lib/mock/graph";
import { brand, agent, neutral } from "@/lib/palette";
import { departureMono } from "@/lib/fonts";

const FONT = departureMono.style.fontFamily;

export function AgentGraph() {
  const option = useMemo(() => {
    const degree = new Map<string, number>();
    for (const e of ACTIVITY_GRAPH.edges) {
      degree.set(e.source, (degree.get(e.source) ?? 0) + 1);
      degree.set(e.target, (degree.get(e.target) ?? 0) + 1);
    }

    const nodes = ACTIVITY_GRAPH.nodes.map((n) => {
      const isAgent = n.kind === "agent";
      const d = degree.get(n.id) ?? 1;
      return {
        id: n.id,
        name: n.label,
        category: isAgent ? 0 : 1,
        symbolSize: isAgent ? 26 + d * 3 : 14 + d * 4,
        itemStyle: {
          color: isAgent ? agent[500] : brand[500],
          shadowColor: isAgent ? agent[500] : brand[500],
          shadowBlur: isAgent ? 14 : 8,
        },
        label: {
          show: true,
          fontFamily: FONT,
          fontSize: isAgent ? 10.5 : 9.5,
          color: isAgent ? "#F2CFF7" : neutral[300],
          fontWeight: isAgent ? 500 : 400,
        },
      };
    });

    const links = ACTIVITY_GRAPH.edges.map((e) => ({
      source: e.source,
      target: e.target,
      lineStyle: {
        color: e.live ? agent[400] : neutral[600],
        width: e.live ? 1.1 + e.weight * 0.35 : 0.75,
        opacity: e.live ? 0.85 : 0.35,
        type: e.live ? "solid" : "dashed",
        shadowColor: e.live ? agent[500] : "transparent",
        shadowBlur: e.live ? 6 : 0,
        curveness: 0.15,
      },
    }));

    return {
      backgroundColor: "transparent",
      tooltip: {
        show: true,
        backgroundColor: neutral[900],
        borderColor: neutral[700],
        borderWidth: 1,
        padding: 8,
        textStyle: { color: "#F1F5F9", fontFamily: FONT, fontSize: 11 },
        formatter: (params: { dataType: string; data: { name?: string; source?: string; target?: string } }) => {
          if (params.dataType === "edge") {
            const s = nodes.find((n) => n.id === params.data.source)?.name;
            const t = nodes.find((n) => n.id === params.data.target)?.name;
            return `${s} → ${t}`;
          }
          return params.data.name ?? "";
        },
      },
      series: [
        {
          type: "graph",
          layout: "force",
          roam: true,
          draggable: true,
          data: nodes,
          links,
          categories: [{ name: "Agent" }, { name: "Repository" }],
          force: {
            repulsion: 280,
            edgeLength: [70, 140],
            gravity: 0.12,
            friction: 0.16,
          },
          emphasis: {
            focus: "adjacency",
            lineStyle: { width: 2.5, opacity: 1 },
          },
          animationDuration: 900,
          animationEasingUpdate: "quinticInOut",
        },
      ],
    };
  }, []);

  return (
    <ReactECharts
      option={option}
      style={{ height: "100%", width: "100%" }}
      opts={{ renderer: "canvas" }}
      notMerge
    />
  );
}
