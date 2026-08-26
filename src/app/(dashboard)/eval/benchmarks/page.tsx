import { ClipboardList } from "lucide-react";
import { SectionPreview } from "@/components/section-preview";

export default function BenchmarkSuitesPage() {
  return (
    <SectionPreview
      icon={ClipboardList}
      title="Benchmark Suites"
      description="The library of benchmark suites every model is measured against — coding, reasoning, safety, and multimodal."
      bullets={[
    "Versioned suites per capability area",
    "Coverage view of which models have run which suite",
    "New suites can be composed from existing benchmark sets",
      ]}
    />
  );
}
