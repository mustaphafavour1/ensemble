import { ListTodo } from "lucide-react";
import { SectionPreview } from "@/components/section-preview";

export default function OpportunityBacklogPage() {
  return (
    <SectionPreview
      icon={ListTodo}
      title="Opportunity Backlog"
      description="Improvement opportunities surfaced by EnsembleAI and engineers alike, prioritized against effort and expected impact."
      bullets={[
    "Sourced from EnsembleAI findings and engineer submissions",
    "Scored by expected impact against estimated effort",
    "Promotes directly into the owning team's backlog",
      ]}
    />
  );
}
