"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Radio, Eye } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatusBadge, type Tone } from "@/components/status-badge";
import { DataTable, type DataTableColumn } from "@/components/data-table";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { STATUS_PAGE_COMPONENTS, type StatusPageComponent, type ComponentStatus } from "@/lib/mock/status-page";

const STATUS_META: Record<ComponentStatus, { tone: Tone; label: string }> = {
  operational: { tone: "success", label: "Operational" },
  degraded: { tone: "warning", label: "Degraded Performance" },
  outage: { tone: "danger", label: "Outage" },
  maintenance: { tone: "brand", label: "Maintenance" },
};

export default function StatusPageManagementPage() {
  const [components, setComponents] = useState<StatusPageComponent[]>(STATUS_PAGE_COMPONENTS);

  function toggleVisible(id: string) {
    const comp = components.find((c) => c.id === id);
    if (!comp) return;
    setComponents((prev) =>
      prev.map((c) => (c.id === id ? { ...c, visibleOnStatusPage: !c.visibleOnStatusPage } : c)),
    );
    toast.success(
      comp.visibleOnStatusPage ? `${comp.name} hidden from status page` : `${comp.name} now visible on status page`,
    );
  }

  const visibleCount = components.filter((c) => c.visibleOnStatusPage).length;
  const worstStatus = components.some((c) => c.currentStatus === "outage")
    ? "outage"
    : components.some((c) => c.currentStatus === "degraded")
      ? "degraded"
      : "operational";

  const columns: DataTableColumn<StatusPageComponent>[] = [
    {
      key: "status",
      label: "Current status",
      render: (c) => <StatusBadge tone={STATUS_META[c.currentStatus].tone} label={STATUS_META[c.currentStatus].label} />,
    },
    {
      key: "component",
      label: "Component",
      render: (c) => (
        <div>
          <p className="text-xs text-ink-em">{c.name}</p>
          <p className="mt-0.5 text-2xs text-ink-faint">{c.description}</p>
        </div>
      ),
    },
    {
      key: "visible",
      label: "Public status page",
      render: (c) => (
        <div className="flex items-center gap-2">
          <Switch checked={c.visibleOnStatusPage} onCheckedChange={() => toggleVisible(c.id)} />
          <span className="text-2xs text-ink-muted">{c.visibleOnStatusPage ? "Visible" : "Hidden"}</span>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Status Page Management"
        description="Choose which components appear on the public status page and see what customers would see right now."
      />

      <Card className="mb-6">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-2">
            <Eye className="size-3.5 text-ink-faint" />
            <CardTitle>Public preview</CardTitle>
          </div>
          <StatusBadge tone={STATUS_META[worstStatus].tone} label={STATUS_META[worstStatus].label} pulse={worstStatus !== "operational"} />
        </CardHeader>
        <CardContent>
          <ul className="flex flex-col divide-y divide-border">
            {components
              .filter((c) => c.visibleOnStatusPage)
              .map((c) => (
                <li key={c.id} className="flex items-center justify-between py-2 text-xs">
                  <span className="text-ink-em">{c.name}</span>
                  <StatusBadge tone={STATUS_META[c.currentStatus].tone} label={STATUS_META[c.currentStatus].label} />
                </li>
              ))}
            {visibleCount === 0 && (
              <li className="py-4 text-center text-2xs text-ink-faint">No components are currently visible.</li>
            )}
          </ul>
        </CardContent>
      </Card>

      <div className="mb-3 flex items-center gap-2 text-2xs text-ink-faint">
        <Radio className="size-3" />
        {visibleCount} of {components.length} components shown publicly
      </div>

      <DataTable columns={columns} data={components} getRowKey={(c) => c.id} />
    </div>
  );
}
