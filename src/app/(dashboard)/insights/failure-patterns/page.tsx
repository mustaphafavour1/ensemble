import { AlertOctagon } from "lucide-react";
import { SectionPreview } from "@/components/section-preview";

export default function FailurePatternAnalysisPage() {
  return (
    <SectionPreview
      icon={AlertOctagon}
      title="Failure Pattern Analysis"
      description="Recurring failure modes clustered across runs, evals, and incidents to find the same root cause wearing different symptoms."
      bullets={[
    "Clusters similar failures across runs, evals, and incidents",
    "Surfaces root causes masked by unrelated-looking symptoms",
    "Ranks clusters by recurrence and affected surface",
      ]}
    />
  );
}
