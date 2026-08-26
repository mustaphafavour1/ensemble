import { Lock } from "lucide-react";
import { SectionPreview } from "@/components/section-preview";

export default function AccessPermissionsPage() {
  return (
    <SectionPreview
      icon={Lock}
      title="Access & Permissions"
      description="Who can see and touch what across Ensemble — roles, scopes, and the audit trail behind every grant."
      bullets={[
    "Role-based access scoped down to individual sections",
    "Every grant and revocation logged with a reason",
    "Time-boxed access for one-off elevated tasks",
      ]}
    />
  );
}
