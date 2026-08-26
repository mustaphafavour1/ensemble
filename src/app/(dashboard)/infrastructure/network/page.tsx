import { Network } from "lucide-react";
import { SectionPreview } from "@/components/section-preview";

export default function NetworkBandwidthPage() {
  return (
    <SectionPreview
      icon={Network}
      title="Network Bandwidth"
      description="Inter-cluster and cross-region network throughput, the usual bottleneck for distributed training at this scale."
      bullets={[
    "Throughput and saturation between every cluster pair",
    "Cross-region links tracked separately from in-region",
    "Flags links saturating during active training runs",
      ]}
    />
  );
}
