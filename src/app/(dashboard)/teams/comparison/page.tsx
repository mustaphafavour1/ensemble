import { BarChart3 } from "lucide-react";
import { SectionPreview } from "@/components/section-preview";

export default function CrossTeamComparisonPage() {
  return (
    <SectionPreview
      icon={BarChart3}
      title="Cross-Team Comparison"
      description="Put any two internal teams side by side — usage, cost, adoption, and agent mix — to see how their patterns differ."
      bullets={[
        "Pick any two teams for a side-by-side comparison",
        "Normalizes for team size so the comparison stays fair",
        "Highlights the single biggest gap between the two",
      ]}
    />
  );
}
