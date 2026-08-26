export type ComponentStatus = "operational" | "degraded" | "outage" | "maintenance";

export interface StatusPageComponent {
  id: string;
  name: string;
  description: string;
  currentStatus: ComponentStatus;
  visibleOnStatusPage: boolean;
}

export const STATUS_PAGE_COMPONENTS: StatusPageComponent[] = [
  { id: "comp-api", name: "Solis API", description: "Text, code, image, and video generation endpoints.", currentStatus: "degraded", visibleOnStatusPage: true },
  { id: "comp-console", name: "Ensemble Console", description: "The internal engineering console itself.", currentStatus: "operational", visibleOnStatusPage: true },
  { id: "comp-availability", name: "Model Availability API", description: "Serves public/internal/staged visibility state.", currentStatus: "operational", visibleOnStatusPage: true },
  { id: "comp-training", name: "Training Pipeline", description: "Training and fine-tuning job orchestration.", currentStatus: "operational", visibleOnStatusPage: false },
  { id: "comp-eval", name: "Evaluation Pipeline", description: "Self-evaluation and benchmark scoring.", currentStatus: "operational", visibleOnStatusPage: false },
  { id: "comp-network", name: "Data Center Network", description: "Inter-cluster and cross-region connectivity.", currentStatus: "outage", visibleOnStatusPage: true },
  { id: "comp-auth", name: "Authentication", description: "API key and session token validation.", currentStatus: "operational", visibleOnStatusPage: true },
  { id: "comp-docs", name: "Documentation Site", description: "Public API reference and guides.", currentStatus: "maintenance", visibleOnStatusPage: false },
];
