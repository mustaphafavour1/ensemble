"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Globe2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { TableCount } from "@/components/table-count";
import { EmptyState } from "@/components/empty-state";
import { StatCard } from "@/components/stat-card";
import { DataTable, type DataTableColumn } from "@/components/data-table";
import { useAppStore } from "@/lib/store";
import { MODEL_VERSIONS, type ModelVersion, type ModelVisibility } from "@/lib/mock/models";
import { cn } from "@/lib/utils";

const VISIBILITY_OPTIONS: { value: ModelVisibility; label: string }[] = [
  { value: "public", label: "Public" },
  { value: "internal", label: "Internal" },
  { value: "staged", label: "Staged" },
];

function VisibilityToggle({
  value,
  onChange,
}: {
  value: ModelVisibility;
  onChange: (v: ModelVisibility) => void;
}) {
  return (
    <div className="inline-flex items-center overflow-hidden rounded-md border border-border">
      {VISIBILITY_OPTIONS.map((opt, i) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            "px-2 py-1 text-2xs font-medium transition-colors",
            i > 0 && "border-l border-border",
            value === opt.value
              ? "bg-brand-500/10 text-brand-400"
              : "text-ink-muted hover:bg-surface-hover hover:text-ink-em",
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export default function ModelAvailabilityPage() {
  const seeded = useAppStore((s) => s.seeded);
  const [models, setModels] = useState<ModelVersion[]>(() =>
    MODEL_VERSIONS.filter((m) => m.status !== "deprecated"),
  );

  const counts = useMemo(
    () => ({
      public: models.filter((m) => m.visibility === "public").length,
      internal: models.filter((m) => m.visibility === "internal").length,
      staged: models.filter((m) => m.visibility === "staged").length,
    }),
    [models],
  );

  function setVisibility(id: string, visibility: ModelVisibility) {
    const model = models.find((m) => m.id === id);
    if (!model || model.visibility === visibility) return;
    setModels((prev) => prev.map((m) => (m.id === id ? { ...m, visibility } : m)));
    const label = VISIBILITY_OPTIONS.find((o) => o.value === visibility)!.label;
    toast.success(`${model.name} set to ${label}`, {
      description:
        visibility === "staged"
          ? "It now appears in Internal Testing & Staging."
          : "The change applies immediately across all regions.",
    });
  }

  const columns: DataTableColumn<ModelVersion>[] = [
    {
      key: "model",
      label: "Model",
      render: (m) => (
        <div>
          <p className="text-xs text-ink-em">{m.name}</p>
          <p className="mt-0.5 text-2xs text-ink-faint">{m.family}</p>
        </div>
      ),
    },
    {
      key: "regions",
      label: "Regions",
      className: "text-xs text-ink-muted tabular-nums",
      render: (m) => m.regionsCount,
    },
    {
      key: "countries",
      label: "Countries",
      className: "text-xs text-ink-muted tabular-nums",
      render: (m) => m.countriesCount,
    },
    {
      key: "visibility",
      label: "Visibility",
      render: (m) => (
        <VisibilityToggle value={m.visibility} onChange={(v) => setVisibility(m.id, v)} />
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Public vs Internal Availability"
        description="Control who can reach each model — the public API, internal tooling only, or the staged rollout queue."
      />

      {!seeded ? (
        <EmptyState
          icon={Globe2}
          title="No models yet"
          description="Turn on demo data in Settings to control model availability."
        />
      ) : (
        <>
          <div className="mb-6 grid grid-cols-3 gap-4">
            <StatCard label="Public" value={counts.public} hint="reachable via the public API" />
            <StatCard label="Internal" value={counts.internal} hint="internal tooling only" />
            <StatCard label="Staged" value={counts.staged} hint="in the staging rollout queue" />
          </div>

          <TableCount count={models.length} label="models" />

          <DataTable columns={columns} data={models} getRowKey={(m) => m.id} />
        </>
      )}
    </div>
  );
}
