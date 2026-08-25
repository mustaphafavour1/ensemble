import { ShieldAlert } from "lucide-react";
import { SectionPreview } from "@/components/section-preview";

export default function PoliciesPage() {
  return (
    <SectionPreview
      icon={ShieldAlert}
      title="Policies"
      description="Org-wide guardrails for what agents are allowed to touch — file paths, secrets, and deploy targets — enforced before a run is ever allowed to start."
      bullets={[
        "Path and secret allowlists, scoped per repo",
        "Required human-approval thresholds by risk level",
        "Budget and rate-limit ceilings per agent or team",
      ]}
    />
  );
}
