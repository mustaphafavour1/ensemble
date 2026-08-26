import { Gauge } from "lucide-react";
import { SectionPreview } from "@/components/section-preview";

export default function APIRateLimitRulesPage() {
  return (
    <SectionPreview
      icon={Gauge}
      title="API & Rate Limit Rules"
      description="Rate limits and quota rules enforced at the API layer, editable per model, surface, or caller tier."
      bullets={[
    "Per-model and per-surface limit configuration",
    "Preview affected traffic before a limit change ships",
    "Full change history with rollback",
      ]}
    />
  );
}
