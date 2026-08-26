import { TrendingDown } from "lucide-react";
import { SectionPreview } from "@/components/section-preview";

export default function RegressionDetectionPage() {
  return (
    <SectionPreview
      icon={TrendingDown}
      title="Regression Detection"
      description="Automatic flagging when a new model version scores worse than its predecessor on any benchmark that matters."
      bullets={[
    "Statistical significance check, not just a raw score drop",
    "Auto-flags block promotion until a human signs off",
    "Links every flag to the exact eval run that triggered it",
      ]}
    />
  );
}
