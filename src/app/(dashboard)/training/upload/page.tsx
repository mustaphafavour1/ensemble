"use client";

import { useState } from "react";
import { toast } from "sonner";
import { UploadCloud, Database } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { TableCount } from "@/components/table-count";
import { Pagination } from "@/components/pagination";
import { StatusBadge, type Tone } from "@/components/status-badge";
import { DataTable, type DataTableColumn } from "@/components/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppStore } from "@/lib/store";
import { usePagination } from "@/lib/use-pagination";
import { ROLES } from "@/lib/roles";
import {
  DATASETS,
  DATASET_SOURCES,
  DATASET_USES,
  DATASET_CATEGORIES,
  type Dataset,
  type DatasetSource,
  type DatasetUse,
  type DatasetCategory,
  type DatasetSizeUnit,
  type DatasetStatus,
} from "@/lib/mock/datasets";
import { formatRelative } from "@/lib/mock/time";

const STATUS_META: Record<DatasetStatus, { tone: Tone; label: string }> = {
  processing: { tone: "brand", label: "Processing" },
  ready: { tone: "success", label: "Ready" },
  failed: { tone: "danger", label: "Failed" },
};

const SIZE_UNITS: DatasetSizeUnit[] = ["GB", "TB", "PB"];
const PAGE_SIZE = 10;

export default function UploadDatasetPage() {
  const seeded = useAppStore((s) => s.seeded);
  const role = useAppStore((s) => s.role);
  const [datasets, setDatasets] = useState<Dataset[]>(DATASETS);

  const [name, setName] = useState("");
  const [category, setCategory] = useState<DatasetCategory>(DATASET_CATEGORIES[0]);
  const [source, setSource] = useState<DatasetSource>(DATASET_SOURCES[0]);
  const [sizeValue, setSizeValue] = useState("100");
  const [sizeUnit, setSizeUnit] = useState<DatasetSizeUnit>("GB");
  const [intendedUse, setIntendedUse] = useState<DatasetUse>(DATASET_USES[0]);
  const [target, setTarget] = useState("");

  const { page, setPage, pageSize, setPageSize, pageCount, pageItems } = usePagination(datasets, PAGE_SIZE);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !target.trim()) return;
    const uploader = ROLES.find((r) => r.id === role)?.name ?? "You";
    const dataset: Dataset = {
      id: `ds_${Math.random().toString(36).slice(2, 9)}`,
      name: name.trim(),
      category,
      source,
      sizeValue: Number(sizeValue) || 0,
      sizeUnit,
      intendedUse,
      target: target.trim(),
      uploadedBy: uploader,
      uploadedAt: Date.now(),
      status: "processing",
    };
    setDatasets((prev) => [dataset, ...prev]);
    setPage(1);
    toast.success("Dataset queued for processing", {
      description: `${dataset.name} will appear in the Dataset Library once validation completes.`,
    });
    setName("");
    setTarget("");
  }

  const columns: DataTableColumn<Dataset>[] = [
    {
      key: "status",
      label: "Status",
      render: (d) => (
        <StatusBadge
          tone={STATUS_META[d.status].tone}
          label={STATUS_META[d.status].label}
          pulse={d.status === "processing"}
        />
      ),
    },
    {
      key: "name",
      label: "Dataset",
      render: (d) => (
        <div>
          <p className="text-[14px] text-ink-em">{d.name}</p>
          <p className="mt-0.5 truncate text-2xs text-ink-faint">{d.target}</p>
        </div>
      ),
    },
    { key: "category", label: "Category", className: "text-xs text-ink-muted", render: (d) => d.category },
    { key: "source", label: "Source", className: "text-xs text-ink-muted", render: (d) => d.source },
    { key: "use", label: "Intended use", className: "text-xs text-ink-muted", render: (d) => d.intendedUse },
    {
      key: "size",
      label: "Size",
      align: "right",
      className: "text-right text-xs text-ink-em tabular-nums",
      render: (d) => `${d.sizeValue} ${d.sizeUnit}`,
    },
    {
      key: "uploaded",
      label: "Uploaded",
      align: "right",
      className: "text-right text-2xs text-ink-faint tabular-nums",
      render: (d) => formatRelative(d.uploadedAt),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Upload New Dataset"
        description="Register a new dataset for training, fine-tuning, or evaluation — it lands in the Dataset Library once processed."
      />

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <UploadCloud className="size-3.5 text-ink-faint" />
            <CardTitle>Dataset details</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="ds-name">Name</Label>
                <Input
                  id="ds-name"
                  placeholder="e.g. multilingual-conversations-v5"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="ds-target">File / connection target</Label>
                <Input
                  id="ds-target"
                  placeholder="e.g. s3://ensemble-datasets/..."
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-5 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="ds-category">Category</Label>
                <Select value={category} onValueChange={(v) => v && setCategory(v as DatasetCategory)}>
                  <SelectTrigger id="ds-category" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DATASET_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="ds-source">Source</Label>
                <Select value={source} onValueChange={(v) => v && setSource(v as DatasetSource)}>
                  <SelectTrigger id="ds-source" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DATASET_SOURCES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="ds-use">Intended use</Label>
                <Select value={intendedUse} onValueChange={(v) => v && setIntendedUse(v as DatasetUse)}>
                  <SelectTrigger id="ds-use" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DATASET_USES.map((u) => (
                      <SelectItem key={u} value={u}>
                        {u}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="ds-size">Size</Label>
                <Input
                  id="ds-size"
                  type="number"
                  min={0}
                  value={sizeValue}
                  onChange={(e) => setSizeValue(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="ds-unit">Unit</Label>
                <Select value={sizeUnit} onValueChange={(v) => v && setSizeUnit(v as DatasetSizeUnit)}>
                  <SelectTrigger id="ds-unit" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SIZE_UNITS.map((u) => (
                      <SelectItem key={u} value={u}>
                        {u}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button type="submit" className="self-start">
              <UploadCloud className="size-3.5" />
              Register dataset
            </Button>
          </form>
        </CardContent>
      </Card>

      {!seeded ? (
        <div className="flex items-center gap-2 text-xs text-ink-faint">
          <Database className="size-3.5" />
          Turn on demo data in Settings to see the dataset library.
        </div>
      ) : (
        <>
          <TableCount count={datasets.length} label="datasets" />
          <DataTable columns={columns} data={pageItems} getRowKey={(d) => d.id} />

          <Pagination
            page={page}
            pageCount={pageCount}
            total={datasets.length}
            pageSize={pageSize}
            noun="datasets"
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        </>
      )}
    </div>
  );
}
