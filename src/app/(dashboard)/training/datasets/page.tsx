import { Library } from "lucide-react";
import { SectionPreview } from "@/components/section-preview";

export default function DatasetLibraryPage() {
  return (
    <SectionPreview
      icon={Library}
      title="Dataset Library"
      description="The full catalog of training datasets available to every team, with provenance and licensing on every entry."
      bullets={[
    "Source, size, and license tracked per dataset",
    "Usage history across every training run that consumed it",
    "New uploads land here after review — see Upload New Dataset",
      ]}
    />
  );
}
