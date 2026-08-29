"use client";

import { useState } from "react";
import { Type, Code2, Image as ImageIcon, Video, Check, ChevronDown, type LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge, type Tone } from "@/components/status-badge";
import {
  FAMILY_DESCRIPTIONS,
  FAMILY_MODALITY,
  FAMILY_PROFILES,
  getFamilyVersions,
  getFamilyFirstRelease,
  type ModelFamily,
  type ModelStatus,
  type ModelModality,
} from "@/lib/mock/models";
import { formatDate } from "@/lib/mock/time";
import { cn } from "@/lib/utils";

const MODALITY_ICON: Record<ModelModality, LucideIcon> = {
  text: Type,
  code: Code2,
  image: ImageIcon,
  video: Video,
};

const STATUS_META: Record<ModelStatus, { tone: Tone; label: string }> = {
  production: { tone: "success", label: "Production" },
  staged: { tone: "brand", label: "Staged" },
  deprecated: { tone: "neutral", label: "Deprecated" },
};

const COLLAPSED_VERSION_COUNT = 3;

export function ModelFamilyCard({
  family,
  onSelectModel,
}: {
  family: ModelFamily;
  onSelectModel: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const Icon = MODALITY_ICON[FAMILY_MODALITY[family]];
  const profile = FAMILY_PROFILES[family];
  const versions = getFamilyVersions(family);
  const firstRelease = getFamilyFirstRelease(family);

  const hiddenVersionCount = Math.max(0, versions.length - COLLAPSED_VERSION_COUNT);
  const visibleVersions = expanded ? versions : versions.slice(0, COLLAPSED_VERSION_COUNT);
  const canExpand = hiddenVersionCount > 0 || Boolean(profile.focus);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <Icon className="size-3.5 text-ink-faint" strokeWidth={1.75} />
            <CardTitle>{family}</CardTitle>
          </div>
          <p className="shrink-0 text-2xs text-ink-faint tabular-nums">First released {formatDate(firstRelease)}</p>
        </div>
        <p className="text-2xs text-ink-muted">{FAMILY_DESCRIPTIONS[family]}</p>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <ul className="flex flex-col gap-1.5">
          {profile.capabilities.map((c) => (
            <li key={c} className="flex items-start gap-1.5 text-2xs text-ink-muted">
              <Check className="mt-0.5 size-2.5 shrink-0 text-brand-400" strokeWidth={2.5} />
              {c}
            </li>
          ))}
        </ul>

        {expanded && <p className="text-2xs leading-relaxed text-ink-faint">{profile.focus}</p>}

        <ul className="flex flex-col divide-y divide-border border-t border-border">
          {visibleVersions.map((v) => (
            <li key={v.id}>
              <button
                type="button"
                onClick={() => onSelectModel(v.id)}
                className="flex w-full items-center justify-between gap-2 rounded-md px-1 py-1.5 text-left text-[13px] text-ink-em transition-colors hover:bg-surface-hover"
              >
                <span>{v.version}</span>
                <StatusBadge tone={STATUS_META[v.status].tone} label={STATUS_META[v.status].label} className="text-[10.5px]" />
              </button>
            </li>
          ))}
        </ul>

        {canExpand && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-1 self-start text-2xs font-medium text-brand-400 hover:underline"
          >
            {expanded ? "View less" : `View more${hiddenVersionCount > 0 ? ` (${hiddenVersionCount})` : ""}`}
            <ChevronDown className={cn("size-3 transition-transform", expanded && "rotate-180")} />
          </button>
        )}
      </CardContent>
    </Card>
  );
}
