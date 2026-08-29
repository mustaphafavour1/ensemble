import { MessageSquare } from "lucide-react";
import { SectionPreview } from "@/components/section-preview";

export default function MemberSuggestionsPage() {
  return (
    <SectionPreview
      icon={MessageSquare}
      title="Member Suggestions"
      description="Ideas and feedback submitted directly by team members about how the agent fleet could work better for them."
      bullets={[
        "Freeform suggestions, tagged by team and category",
        "Upvoting so the most-requested ideas surface first",
        "A direct line from the people using the fleet to the roadmap",
      ]}
    />
  );
}
