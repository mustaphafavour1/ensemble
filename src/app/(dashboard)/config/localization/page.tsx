import { Languages } from "lucide-react";
import { SectionPreview } from "@/components/section-preview";

export default function LocalizationRegionalRulesPage() {
  return (
    <SectionPreview
      icon={Languages}
      title="Localization & Regional Rules"
      description="Locale-specific behavior — supported languages, regional content rules, and compliance constraints per market."
      bullets={[
    "Supported languages and locales tracked per model and surface",
    "Regional compliance constraints enforced at the config level",
    "Change review required before a regional rule ships",
      ]}
    />
  );
}
