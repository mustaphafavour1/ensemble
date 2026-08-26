"use client";

import { Switch } from "@/components/ui/switch";
import { useAppStore } from "@/lib/store";

export function SeedToggle() {
  const seeded = useAppStore((s) => s.seeded);
  const setSeeded = useAppStore((s) => s.setSeeded);

  return (
    <div className="flex items-center justify-between rounded-md border border-border bg-surface px-3.5 py-3">
      <div>
        <p className="text-xs font-medium text-ink-em">Populate demo data</p>
        <p className="mt-0.5 text-2xs text-ink-muted">
          Fills every page with sample runs, agents, and history. Turn off to
          see how Ensemble looks for a brand-new workspace.
        </p>
      </div>
      <Switch
        checked={seeded}
        onCheckedChange={setSeeded}
        className="ml-4 shrink-0"
      />
    </div>
  );
}
