import { HardDrive } from "lucide-react";
import { SectionPreview } from "@/components/section-preview";

export default function StorageRAMUsagePage() {
  return (
    <SectionPreview
      icon={HardDrive}
      title="Storage & RAM Usage"
      description="Storage and memory consumption across training, serving, and dataset infrastructure, with headroom tracked per cluster."
      bullets={[
    "Capacity and headroom tracked per storage tier",
    "Breaks out training, serving, and dataset consumers separately",
    "Forecasts time-to-full at current growth rate",
      ]}
    />
  );
}
