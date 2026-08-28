"use client";

import { useMemo, useState } from "react";
import { Boxes, Type, Code2, Image as ImageIcon, Video, type LucideIcon } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { TableCount } from "@/components/table-count";
import { Pagination } from "@/components/pagination";
import { EmptyState } from "@/components/empty-state";
import { StatusBadge, type Tone } from "@/components/status-badge";
import { DataTable, type DataTableColumn } from "@/components/data-table";
import { ModelFamilyCard } from "@/components/models/model-family-card";
import { ModelDetailsDialog } from "@/components/models/model-details-dialog";
import { useAppStore } from "@/lib/store";
import { usePagination } from "@/lib/use-pagination";
import {
  MODEL_VERSIONS,
  MODEL_FAMILIES,
  type ModelVersion,
  type ModelFamily,
  type ModelStatus,
  type ModelModality,
} from "@/lib/mock/models";
import { formatDate } from "@/lib/mock/time";
import { cn } from "@/lib/utils";

const STATUS_META: Record<ModelStatus, { tone: Tone; label: string }> = {
  production: { tone: "success", label: "Production" },
  staged: { tone: "brand", label: "Staged" },
  deprecated: { tone: "neutral", label: "Deprecated" },
};

const MODALITY_META: Record<ModelModality, { icon: LucideIcon; label: string }> = {
  text: { icon: Type, label: "Text" },
  code: { icon: Code2, label: "Code" },
  image: { icon: ImageIcon, label: "Image" },
  video: { icon: Video, label: "Video" },
};

const VISIBILITY_LABEL: Record<ModelVersion["visibility"], string> = {
  public: "Public",
  internal: "Internal",
  staged: "Staged",
};

const PAGE_SIZE = 10;

const FAMILY_FILTERS: { value: ModelFamily | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "Solis", label: "Solis" },
  { value: "Solis Code", label: "Solis Code" },
  { value: "Solis Vision", label: "Solis Vision" },
  { value: "Solis Motion", label: "Solis Motion" },
];

function formatCount(m: number): string {
  if (m >= 1000) return `${(m / 1000).toFixed(1)}B`;
  if (m < 1) return `${Math.round(m * 1000)}K`;
  return `${m.toFixed(m < 10 ? 1 : 0)}M`;
}

export default function AllModelsPage() {
  const seeded = useAppStore((s) => s.seeded);
  const [family, setFamily] = useState<ModelFamily | "all">("all");
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  function openModel(id: string) {
    setSelectedModelId(id);
    setDetailsOpen(true);
  }

  const filtered = useMemo(() => {
    if (!seeded) return [];
    const list = family === "all" ? MODEL_VERSIONS : MODEL_VERSIONS.filter((m) => m.family === family);
    return [...list].sort((a, b) => b.releasedAt - a.releasedAt);
  }, [family, seeded]);

  const { page, setPage, pageSize, setPageSize, pageCount, pageItems } = usePagination(filtered, PAGE_SIZE);

  const columns: DataTableColumn<ModelVersion>[] = [
    {
      key: "status",
      label: "Status",
      render: (m) => (
        <StatusBadge tone={STATUS_META[m.status].tone} label={STATUS_META[m.status].label} />
      ),
    },
    {
      key: "model",
      label: "Model",
      render: (m) => (
        <div className="max-w-[260px]">
          <p className="text-[14px] text-ink-em">{m.name}</p>
          <p className="mt-0.5 truncate text-2xs text-ink-faint">{m.description}</p>
        </div>
      ),
    },
    {
      key: "modality",
      label: "Modality",
      render: (m) => {
        const Icon = MODALITY_META[m.modality].icon;
        return (
          <span className="flex items-center gap-1.5 text-xs text-ink-muted">
            <Icon className="size-3.5 text-ink-faint" strokeWidth={1.75} />
            {MODALITY_META[m.modality].label}
          </span>
        );
      },
    },
    {
      key: "visibility",
      label: "Visibility",
      render: (m) => (
        <span
          className={cn(
            "text-xs",
            m.visibility === "staged" ? "font-medium text-brand-400" : "text-ink-muted",
          )}
        >
          {VISIBILITY_LABEL[m.visibility]}
        </span>
      ),
    },
    {
      key: "requests",
      label: "Daily requests",
      className: "text-right text-xs text-ink-em tabular-nums",
      align: "right",
      render: (m) => formatCount(m.dailyRequestsM),
    },
    {
      key: "mau",
      label: "MAU",
      className: "text-right text-xs text-ink-muted tabular-nums",
      align: "right",
      render: (m) => formatCount(m.mauM),
    },
    {
      key: "released",
      label: "Released",
      className: "text-right text-2xs text-ink-faint tabular-nums",
      align: "right",
      render: (m) => formatDate(m.releasedAt),
    },
  ];

  return (
    <div>
      <PageHeader
        title="All Models"
        description="Every model version across the fleet — text, code, image, and video — from internal testing through production."
      />

      {!seeded ? (
        <EmptyState
          icon={Boxes}
          title="No models yet"
          description="Turn on demo data in Settings to see the model fleet."
        />
      ) : (
        <>
          <div className="mb-4 grid grid-cols-4 gap-4">
            {MODEL_FAMILIES.map((f) => (
              <ModelFamilyCard key={f} family={f} onSelectModel={openModel} />
            ))}
          </div>

          <div className="mb-4 flex flex-wrap items-center gap-1.5">
            {FAMILY_FILTERS.map((f) => {
              const count =
                f.value === "all"
                  ? MODEL_VERSIONS.length
                  : MODEL_VERSIONS.filter((m) => m.family === f.value).length;
              const active = family === f.value;
              return (
                <button
                  key={f.value}
                  onClick={() => {
                    setFamily(f.value);
                    setPage(1);
                  }}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-2xs font-medium transition-colors",
                    active
                      ? "border-brand-500/30 bg-brand-500/10 text-brand-400"
                      : "border-border text-ink-muted hover:border-neutral-700 hover:text-ink-em",
                  )}
                >
                  {f.label}
                  <span className="tabular-nums opacity-70">{count}</span>
                </button>
              );
            })}
          </div>

          <TableCount count={filtered.length} label="models" />

          <DataTable
            columns={columns}
            data={pageItems}
            getRowKey={(m) => m.id}
            onRowClick={(m) => openModel(m.id)}
          />

          <Pagination
            page={page}
            pageCount={pageCount}
            total={filtered.length}
            pageSize={pageSize}
            noun="models"
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />

          <ModelDetailsDialog
            modelId={selectedModelId}
            open={detailsOpen}
            onOpenChange={setDetailsOpen}
            onSelectModel={setSelectedModelId}
          />
        </>
      )}
    </div>
  );
}
