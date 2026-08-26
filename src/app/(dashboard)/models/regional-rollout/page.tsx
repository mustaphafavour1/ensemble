import { Globe2 } from "lucide-react";
import { SectionPreview } from "@/components/section-preview";

export default function RegionalRolloutStatusPage() {
  return (
    <SectionPreview
      icon={Globe2}
      title="Regional Rollout Status"
      description="Where each model version is actually live, broken out by data center region — rollouts rarely land everywhere at once."
      bullets={[
    "Per-region rollout progress for every model",
    "Flags regions stuck behind the global rollout",
    "Rollback scoped to a single region without a global revert",
      ]}
    />
  );
}
