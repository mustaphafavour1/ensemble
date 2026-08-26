import { Library } from "lucide-react";
import { SectionPreview } from "@/components/section-preview";

export default function EvalDatasetLibraryPage() {
  return (
    <SectionPreview
      icon={Library}
      title="Eval Dataset Library"
      description="Every held-out dataset used for evaluation, versioned and access-controlled separately from training data."
      bullets={[
    "Strict separation from training data to prevent contamination",
    "Versioned per benchmark suite",
    "Usage log of every eval run that touched a given set",
      ]}
    />
  );
}
