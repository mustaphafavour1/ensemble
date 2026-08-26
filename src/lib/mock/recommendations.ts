import { Rng } from "./rng";
import { minutesAgo } from "./time";

export type RecStatus = "new" | "in-review" | "actioned" | "dismissed";
export type RecCategory = "Latency" | "Cost" | "Reliability" | "Capability" | "Quality";

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  category: RecCategory;
  confidencePct: number;
  affectedSystem: string;
  status: RecStatus;
  generatedAt: number;
}

const SEED_RECS: { title: string; description: string; category: RecCategory; affectedSystem: string }[] = [
  { title: "Latency regression detected for Solis Flash 4.1 in ap-southeast-1", description: "p99 latency is up 34% over the last 6 hours in this region alone. Investigate the caching layer for that cluster.", category: "Latency", affectedSystem: "Solis Flash 4.1" },
  { title: "Mumbai data center trending toward thermal threshold", description: "Rack temperatures have climbed steadily for 48 hours. Recommend rebalancing load to nearby regions before it forces a throttle.", category: "Reliability", affectedSystem: "Mumbai" },
  { title: "Solis Vision 1.5 error rate elevated 3x baseline", description: "Elevated 5xx rate over the last 6 hours, concentrated in image uploads above 8MB.", category: "Quality", affectedSystem: "Solis Vision 1.5" },
  { title: "Solis Code 2.0 completions show declining acceptance in TypeScript", description: "Acceptance rate for TypeScript completions dropped 9 points this week versus other languages.", category: "Quality", affectedSystem: "Solis Code 2.0" },
  { title: "Underutilized reserved capacity in Toronto", description: "Average load has held at 38% for three weeks — well below the reservation. Consider resizing.", category: "Cost", affectedSystem: "Toronto" },
  { title: "Solis Ultra 3.5 traffic has fallen below the dedicated-capacity threshold", description: "Daily requests are down to 210M, low enough to fold serving into the shared 4.1 pool.", category: "Cost", affectedSystem: "Solis Ultra 3.5" },
  { title: "Repeated cold-starts observed for staged models", description: "Median cold-start latency for staged models is running 3.2x production. Affects internal tester experience.", category: "Latency", affectedSystem: "Staged models" },
  { title: "Self-evaluation scores for Solis Motion trending upward", description: "The last 5 self-eval runs show a consistent upward trend across Reasoning-500 and Multimodal-QA.", category: "Quality", affectedSystem: "Solis Motion" },
  { title: "API partners repeatedly requesting higher output token limits", description: "Six enterprise partners have filed capability requests for output above the current maximum this month.", category: "Capability", affectedSystem: "Solis Ultra 4.1" },
  { title: "Duplicate embedding cache usage across three services", description: "Search, recommendations, and the internal dashboard each maintain their own embedding cache for the same content.", category: "Cost", affectedSystem: "Shared infrastructure" },
  { title: "Solis Code 2.1 (staged) benchmark score exceeds production by 1.5 points", description: "Consistent improvement across three consecutive eval runs — a candidate for promotion.", category: "Quality", affectedSystem: "Solis Code 2.1" },
  { title: "Regional latency gap widening between EU and APAC", description: "Solis Pro 4.1 p95 latency in APAC is now 2.1x the EU figure, up from 1.4x a month ago.", category: "Latency", affectedSystem: "Solis Pro 4.1" },
  { title: "Human feedback queue backlog growing", description: "Submissions are up 40% week over week while grading throughput has stayed flat.", category: "Reliability", affectedSystem: "Human Feedback Queue" },
  { title: "Video generation queue wait time exceeds target during peak hours", description: "Three regions saw queue wait times above the internal SLA during yesterday's evening peak.", category: "Latency", affectedSystem: "Solis Motion 1.2" },
];

const STATUS_WEIGHTS: [RecStatus, number][] = [
  ["new", 40],
  ["in-review", 25],
  ["actioned", 25],
  ["dismissed", 10],
];

function generateRecommendations(): Recommendation[] {
  const rng = new Rng(8815);
  return SEED_RECS.map((seed, i) => ({
    id: rng.id("rec"),
    ...seed,
    confidencePct: rng.int(68, 97),
    status: rng.pickWeighted(STATUS_WEIGHTS),
    generatedAt: minutesAgo(rng.int(20, 60 * 24 * 14)) - i,
  })).sort((a, b) => b.generatedAt - a.generatedAt);
}

export const RECOMMENDATIONS: Recommendation[] = generateRecommendations();
