import { Rng } from "./rng";
import { AGENTS } from "./catalog";
import { REPOS } from "./catalog";

export interface GraphNode {
  id: string;
  label: string;
  kind: "agent" | "repo";
}

export interface GraphEdge {
  source: string;
  target: string;
  live: boolean;
  weight: number;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

/**
 * A small, legible "who's touching what right now" snapshot — deliberately
 * smaller than the full run history so the force graph stays readable.
 */
export function generateActivityGraph(): GraphData {
  const rng = new Rng(9137);

  const nodes: GraphNode[] = [
    ...AGENTS.map((a) => ({ id: a.id, label: a.name, kind: "agent" as const })),
    ...REPOS.map((r) => ({ id: r.id, label: r.name, kind: "repo" as const })),
  ];

  const edges: GraphEdge[] = [];
  const seen = new Set<string>();

  for (const agent of AGENTS) {
    const repoCount = rng.int(1, 2);
    const repos = rng.sample(REPOS, repoCount);
    for (const repo of repos) {
      const key = `${agent.id}->${repo.id}`;
      if (seen.has(key)) continue;
      seen.add(key);
      edges.push({
        source: agent.id,
        target: repo.id,
        live: rng.bool(0.68),
        weight: rng.int(1, 5),
      });
    }
  }

  // A couple of extra repos getting touched by a second agent, for density.
  const extraPairs = rng.int(3, 5);
  for (let i = 0; i < extraPairs; i++) {
    const agent = rng.pick(AGENTS);
    const repo = rng.pick(REPOS);
    const key = `${agent.id}->${repo.id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    edges.push({ source: agent.id, target: repo.id, live: rng.bool(0.5), weight: rng.int(1, 3) });
  }

  const touchedRepoIds = new Set(edges.map((e) => e.target));
  const usedNodes = nodes.filter((n) => n.kind === "agent" || touchedRepoIds.has(n.id));

  return { nodes: usedNodes, edges };
}

export const ACTIVITY_GRAPH: GraphData = generateActivityGraph();
