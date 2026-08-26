import { AlertTriangle } from "lucide-react";
import { SectionPreview } from "@/components/section-preview";

export default function CriticalAlertsPage() {
  return (
    <SectionPreview
      icon={AlertTriangle}
      title="Critical Alerts"
      description="A unified feed of every alert currently firing across models, infrastructure, and agents — ranked by severity so the most urgent issue is always at the top."
      bullets={[
    "Severity-ranked, cross-system alert stream",
    "One-click acknowledge and hand-off to on-call",
    "Links straight through to the owning run, model, or cluster",
      ]}
    />
  );
}
