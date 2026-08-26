import { SplitSquareHorizontal } from "lucide-react";
import { SectionPreview } from "@/components/section-preview";

export default function ABOptimizationTestsPage() {
  return (
    <SectionPreview
      icon={SplitSquareHorizontal}
      title="A/B Optimization Tests"
      description="Controlled experiments comparing an optimization change against the current baseline before it ships broadly."
      bullets={[
    "Traffic-split experiments with pre-registered success metrics",
    "Live significance tracking, not just a final readout",
    "Winning variants hand off directly to rollout",
      ]}
    />
  );
}
