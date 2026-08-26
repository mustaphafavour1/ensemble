import { FileClock } from "lucide-react";
import { SectionPreview } from "@/components/section-preview";

export default function IncidentHistoryPostmortemsPage() {
  return (
    <SectionPreview
      icon={FileClock}
      title="Incident History & Postmortems"
      description="The full archive of past incidents and their postmortems, searchable by system, severity, and root cause."
      bullets={[
    "Every incident linked to its full postmortem",
    "Searchable by affected system, severity, and root cause",
    "Tracks whether follow-up action items were actually closed",
      ]}
    />
  );
}
