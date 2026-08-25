import { Receipt } from "lucide-react";
import { SectionPreview } from "@/components/section-preview";

export default function BillingPage() {
  return (
    <SectionPreview
      icon={Receipt}
      title="Billing"
      description="Usage-based billing for AI compute across every agent, project, and team, reconciled against the cost figures shown throughout Ensemble."
      bullets={[
        "Per-team and per-project spend breakdowns",
        "Budget alerts with configurable hard caps",
        "Monthly invoices and raw usage exports",
      ]}
    />
  );
}
