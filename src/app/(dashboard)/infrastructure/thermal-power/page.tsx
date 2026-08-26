import { Thermometer } from "lucide-react";
import { SectionPreview } from "@/components/section-preview";

export default function ThermalPowerMonitoringPage() {
  return (
    <SectionPreview
      icon={Thermometer}
      title="Thermal & Power Monitoring"
      description="Power draw and thermal headroom across every data center, the hard limits that cap how much compute can actually run."
      bullets={[
    "Live power draw against each facility's contracted ceiling",
    "Thermal headroom per rack, not just per data center",
    "Throttling events logged against the run or job affected",
      ]}
    />
  );
}
