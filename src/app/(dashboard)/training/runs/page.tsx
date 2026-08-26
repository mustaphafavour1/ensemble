import { PlayCircle } from "lucide-react";
import { SectionPreview } from "@/components/section-preview";

export default function TrainingRunsPage() {
  return (
    <SectionPreview
      icon={PlayCircle}
      title="Training Runs"
      description="Every training and fine-tuning job in flight or completed, with live loss curves and compute burn."
      bullets={[
    "Live loss and eval-metric curves per run",
    "Compute burn tracked against the job's allocation",
    "One click through to the resulting checkpoint",
      ]}
    />
  );
}
