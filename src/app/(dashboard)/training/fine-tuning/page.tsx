import { SlidersHorizontal } from "lucide-react";
import { SectionPreview } from "@/components/section-preview";

export default function FineTuningJobsPage() {
  return (
    <SectionPreview
      icon={SlidersHorizontal}
      title="Fine-Tuning Jobs"
      description="Fine-tuning jobs layered on top of base checkpoints, scoped to a specific capability or customer surface."
      bullets={[
    "Base checkpoint and delta tracked per job",
    "Isolated eval run before a fine-tune is promoted",
    "Rollback to the base checkpoint at any time",
      ]}
    />
  );
}
