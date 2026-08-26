import { ListPlus } from "lucide-react";
import { SectionPreview } from "@/components/section-preview";

export default function FeatureRequestsQueuePage() {
  return (
    <SectionPreview
      icon={ListPlus}
      title="Feature Requests Queue"
      description="Incoming feature and fix requests routed to the agent fleet, triaged before they're handed to an agent to execute."
      bullets={[
    "Intake from internal tooling, on-call, and eval findings",
    "Triaged by scope and risk before assignment",
    "Converts directly into an Active Task once approved",
      ]}
    />
  );
}
