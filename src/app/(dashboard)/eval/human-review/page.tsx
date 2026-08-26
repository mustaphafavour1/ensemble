import { UserCheck } from "lucide-react";
import { SectionPreview } from "@/components/section-preview";

export default function HumanReviewQueuePage() {
  return (
    <SectionPreview
      icon={UserCheck}
      title="Human Review Queue"
      description="Eval cases automated scoring couldn't confidently resolve, routed to a human rater for the final call."
      bullets={[
    "Only low-confidence or disputed cases reach a human",
    "Side-by-side model output against the rubric",
    "Verdicts feed back into the automated scorer's calibration",
      ]}
    />
  );
}
