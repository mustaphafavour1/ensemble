import { Cpu } from "lucide-react";
import { SectionPreview } from "@/components/section-preview";

export default function ComputeEfficiencyPage() {
  return (
    <SectionPreview
      icon={Cpu}
      title="Compute Efficiency"
      description="Utilization and efficiency of the compute fleet — what's paid for versus what's actually doing useful work."
      bullets={[
    "Utilization vs. allocation across every cluster",
    "Identifies persistently underused reservations",
    "Efficiency trend lines tied to specific optimization work",
      ]}
    />
  );
}
