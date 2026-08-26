import { Expand } from "lucide-react";
import { SectionPreview } from "@/components/section-preview";

export default function CapabilityExpansionRequestsPage() {
  return (
    <SectionPreview
      icon={Expand}
      title="Capability Expansion Requests"
      description="Requests to extend what a model can do — longer context, longer video, higher resolution — queued for impact assessment."
      bullets={[
    "Every request routes through the Impact Estimator before approval",
    "Tracks requester, target model, and current status",
    "Approved requests hand off to the owning training team",
      ]}
    />
  );
}
