import { GitCompare } from "lucide-react";
import { SectionPreview } from "@/components/section-preview";

export default function VersionComparisonPage() {
  return (
    <SectionPreview
      icon={GitCompare}
      title="Version Comparison"
      description="Side-by-side comparison of any two model versions — benchmark deltas, latency, and cost — before deciding which one ships."
      bullets={[
    "Pick any two versions of any model in the fleet",
    "Diffs benchmark scores, latency, and serving cost together",
    "Flags regressions above a configurable threshold",
      ]}
    />
  );
}
