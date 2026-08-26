import { CalendarDays } from "lucide-react";
import { SectionPreview } from "@/components/section-preview";

export default function OnCallSchedulePage() {
  return (
    <SectionPreview
      icon={CalendarDays}
      title="On-Call Schedule"
      description="Who's on call for every system right now, and the escalation path if the first responder doesn't ack in time."
      bullets={[
    "Live view of the current on-call rotation per system",
    "Escalation policy shown alongside the schedule",
    "Handoff history for post-incident review",
      ]}
    />
  );
}
