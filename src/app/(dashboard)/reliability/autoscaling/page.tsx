import { Scale } from "lucide-react";
import { SectionPreview } from "@/components/section-preview";

export default function AutoScalingRulesPage() {
  return (
    <SectionPreview
      icon={Scale}
      title="Auto-Scaling Rules"
      description="The rules governing when and how the serving fleet scales, editable without a deploy."
      bullets={[
    "Per-model, per-region scaling thresholds",
    "Dry-run mode to preview a rule change before it's live",
    "Change history with rollback to any prior rule set",
      ]}
    />
  );
}
