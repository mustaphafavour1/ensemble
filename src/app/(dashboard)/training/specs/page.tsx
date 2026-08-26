import { BookMarked } from "lucide-react";
import { SectionPreview } from "@/components/section-preview";

export default function SpecsRulesLibraryPage() {
  return (
    <SectionPreview
      icon={BookMarked}
      title="Specs & Rules Library"
      description="The behavioral specs and rules models are trained and evaluated against — the source of truth for 'what good looks like.'"
      bullets={[
    "Versioned specs per capability and safety area",
    "Every rule traces to the eval cases that enforce it",
    "Change history shows who approved each revision",
      ]}
    />
  );
}
