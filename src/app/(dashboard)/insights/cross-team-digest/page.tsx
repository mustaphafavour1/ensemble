import { Users } from "lucide-react";
import { SectionPreview } from "@/components/section-preview";

export default function CrossTeamInsightsDigestPage() {
  return (
    <SectionPreview
      icon={Users}
      title="Cross-Team Insights Digest"
      description="A weekly rollup of findings across evaluation, optimization, and reliability, written for teams that don't read each other's dashboards."
      bullets={[
    "One digest spanning eval, optimization, and reliability findings",
    "Written for teams outside the originating group",
    "Archived weekly so trends surface across issues",
      ]}
    />
  );
}
