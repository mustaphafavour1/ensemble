import { Plug } from "lucide-react";
import { SectionPreview } from "@/components/section-preview";

export default function IntegrationsPage() {
  return (
    <SectionPreview
      icon={Plug}
      title="Integrations"
      description="Connect Ensemble to the rest of your toolchain so agents can open PRs, post updates, and trigger deploys wherever your team already works."
      bullets={[
        "Source control — GitHub, GitLab, Bitbucket",
        "Notifications — Slack, PagerDuty, email",
        "Custom outbound webhooks per event type",
      ]}
    />
  );
}
