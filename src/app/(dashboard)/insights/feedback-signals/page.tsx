import { MessageSquare } from "lucide-react";
import { SectionPreview } from "@/components/section-preview";

export default function UserFeedbackSignalsPage() {
  return (
    <SectionPreview
      icon={MessageSquare}
      title="User Feedback Signals"
      description="Aggregated signal from thumbs up/down, regenerations, and explicit reports, rolled up by model and surface."
      bullets={[
    "Rolled up by model, surface, and region",
    "Distinguishes single-turn dissatisfaction from repeated regeneration",
    "Feeds directly into the Human Feedback Queue for review",
      ]}
    />
  );
}
