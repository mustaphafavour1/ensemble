import { Flag } from "lucide-react";
import { SectionPreview } from "@/components/section-preview";

export default function FeatureFlagsPage() {
  return (
    <SectionPreview
      icon={Flag}
      title="Feature Flags"
      description="Every feature flag gating a model capability or platform behavior, with current rollout percentage and owner."
      bullets={[
    "Rollout percentage and targeting rules per flag",
    "Owner and creation date tracked for every flag",
    "Stale-flag detection for ones left at 100% too long",
      ]}
    />
  );
}
