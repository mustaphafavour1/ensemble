import { Activity } from "lucide-react";
import { SectionPreview } from "@/components/section-preview";

export default function LoadTrafficSpikesPage() {
  return (
    <SectionPreview
      icon={Activity}
      title="Load & Traffic Spikes"
      description="Unusual traffic patterns as they happen, and how the fleet's auto-scaling responded to them."
      bullets={[
    "Real-time anomaly detection on inbound request volume",
    "Shows the auto-scaling response alongside the spike",
    "Correlates spikes across regions to catch coordinated load",
      ]}
    />
  );
}
