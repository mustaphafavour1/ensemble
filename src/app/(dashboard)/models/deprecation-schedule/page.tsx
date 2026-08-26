import { CalendarClock } from "lucide-react";
import { SectionPreview } from "@/components/section-preview";

export default function DeprecationSchedulePage() {
  return (
    <SectionPreview
      icon={CalendarClock}
      title="Deprecation Schedule"
      description="The retirement timeline for every model version still in production, with migration status for the traffic that depends on it."
      bullets={[
    "Sunset dates for every deprecated model version",
    "Live migration progress for dependent traffic",
    "Owner sign-off required before a hard cutover",
      ]}
    />
  );
}
