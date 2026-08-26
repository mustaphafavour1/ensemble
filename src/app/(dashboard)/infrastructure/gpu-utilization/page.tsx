import { Cpu } from "lucide-react";
import { SectionPreview } from "@/components/section-preview";

export default function GPUTPUUtilizationPage() {
  return (
    <SectionPreview
      icon={Cpu}
      title="GPU/TPU Utilization"
      description="Real-time accelerator utilization across every cluster and data center, down to the individual node."
      bullets={[
    "Live utilization by accelerator type and cluster",
    "Flags idle capacity worth reclaiming",
    "Drills down from data center to individual node",
      ]}
    />
  );
}
