import { Save } from "lucide-react";
import { SectionPreview } from "@/components/section-preview";

export default function CheckpointManagementPage() {
  return (
    <SectionPreview
      icon={Save}
      title="Checkpoint Management"
      description="Every saved model checkpoint, with the storage, retention, and promotion status of each."
      bullets={[
    "Retention policy enforced per checkpoint tier",
    "Promotion path from checkpoint to staged to public",
    "Storage footprint tracked across the whole checkpoint history",
      ]}
    />
  );
}
