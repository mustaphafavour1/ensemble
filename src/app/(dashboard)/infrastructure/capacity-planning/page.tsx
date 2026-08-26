import { TrendingUp } from "lucide-react";
import { SectionPreview } from "@/components/section-preview";

export default function CapacityPlanningPage() {
  return (
    <SectionPreview
      icon={TrendingUp}
      title="Capacity Planning"
      description="Forward-looking compute and power demand against what's already ordered and what's still available to allocate."
      bullets={[
    "Demand forecast against committed and available capacity",
    "Per-data-center runway before the next expansion is needed",
    "Scenario view for a new large training run's footprint",
      ]}
    />
  );
}
