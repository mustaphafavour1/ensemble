import { Rng } from "./rng";
import { DATA_CENTERS, type DcStatus } from "./datacenters";

export type AcceleratorType = "GPU" | "TPU";

export interface ComputeCluster {
  id: string;
  name: string;
  dcId: string;
  dcName: string;
  region: string;
  acceleratorType: AcceleratorType;
  nodeCount: number;
  utilizationPct: number;
  tempC: number;
  status: DcStatus;
}

const CLUSTER_SUFFIXES = ["a", "b", "c"];

function generateClusters(): ComputeCluster[] {
  const rng = new Rng(9042);
  const clusters: ComputeCluster[] = [];

  for (const dc of DATA_CENTERS) {
    const count = dc.capacityAccelerators > 3000 ? 3 : dc.capacityAccelerators > 1500 ? 2 : 1;
    for (let i = 0; i < count; i++) {
      const acceleratorType: AcceleratorType = rng.bool(0.65) ? "GPU" : "TPU";
      const utilizationPct = rng.int(35, 96);
      const status: DcStatus = utilizationPct > 92 ? "critical" : utilizationPct > 82 ? "degraded" : "healthy";
      clusters.push({
        id: rng.id("cluster"),
        name: `${dc.region}-${CLUSTER_SUFFIXES[i]}`,
        dcId: dc.id,
        dcName: dc.name,
        region: dc.region,
        acceleratorType,
        nodeCount: Math.round(dc.capacityAccelerators / count / 8),
        utilizationPct,
        tempC: rng.int(42, 71),
        status,
      });
    }
  }

  return clusters.sort((a, b) => b.utilizationPct - a.utilizationPct);
}

export const COMPUTE_CLUSTERS: ComputeCluster[] = generateClusters();
