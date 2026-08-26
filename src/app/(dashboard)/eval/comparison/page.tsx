import { GitBranch } from "lucide-react";
import { SectionPreview } from "@/components/section-preview";

export default function ModelComparisonLineagePage() {
  return (
    <SectionPreview
      icon={GitBranch}
      title="Model Comparison & Lineage"
      description="Traces how a model's evaluation scores evolved across its whole training and fine-tuning lineage."
      bullets={[
    "Full lineage tree from base model to current checkpoint",
    "Benchmark trend lines across every ancestor version",
    "Pinpoints exactly which step introduced a regression",
      ]}
    />
  );
}
