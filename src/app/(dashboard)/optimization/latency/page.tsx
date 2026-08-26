import { Zap } from "lucide-react";
import { SectionPreview } from "@/components/section-preview";

export default function LatencyOptimizationPage() {
  return (
    <SectionPreview
      icon={Zap}
      title="Latency Optimization"
      description="Where inference latency is being spent, model by model and region by region, with active optimization work tracked against it."
      bullets={[
    "P50/P95/P99 latency broken out by model and region",
    "Active optimization work items and their measured impact",
    "Alerts when a regression erases a prior win",
      ]}
    />
  );
}
