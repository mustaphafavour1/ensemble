import { History } from "lucide-react";
import { SectionPreview } from "@/components/section-preview";

export default function ModelChangelogPage() {
  return (
    <SectionPreview
      icon={History}
      title="Model Changelog"
      description="A chronological record of every change shipped to every model — weight updates, safety tuning, serving config, all of it."
      bullets={[
    "One timeline across every model in the fleet",
    "Links each entry back to its eval run and approver",
    "Filterable by model, change type, or date range",
      ]}
    />
  );
}
