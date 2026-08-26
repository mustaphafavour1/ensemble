import { Globe } from "lucide-react";
import { SectionPreview } from "@/components/section-preview";

export default function RegionalBreakdownPage() {
  return (
    <SectionPreview
      icon={Globe}
      title="Regional Breakdown"
      description="Engineering activity and system health split out by data center region, for spotting problems that only show up in one part of the world."
      bullets={[
    "Per-region latency, error rate, and active-run counts",
    "Surfaces regional outliers hidden by global averages",
    "Drills through to the owning data center",
      ]}
    />
  );
}
