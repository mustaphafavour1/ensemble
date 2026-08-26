import { MapPin } from "lucide-react";
import { SectionPreview } from "@/components/section-preview";

export default function RegionalPerformanceGapsPage() {
  return (
    <SectionPreview
      icon={MapPin}
      title="Regional Performance Gaps"
      description="Where model quality or latency measurably lags in specific regions or languages, versus the global baseline."
      bullets={[
    "Quality and latency benchmarked per region against the global baseline",
    "Surfaces language-specific gaps hidden by aggregate scores",
    "Prioritized by affected traffic volume",
      ]}
    />
  );
}
