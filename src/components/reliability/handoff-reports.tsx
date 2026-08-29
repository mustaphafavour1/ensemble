"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { HANDOFF_REPORTS } from "@/lib/mock/oncall";
import { cn } from "@/lib/utils";

export function HandoffReports() {
  const [period, setPeriod] = useState<"daily" | "weekly">("daily");
  const report = HANDOFF_REPORTS[period];

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-heading text-base font-semibold text-ink-em">Handoff Reports</h2>
          <p className="mt-1 text-xs text-ink-muted">
            Generated for rotation handoff, so the next person up doesn&rsquo;t start cold.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1 rounded-md bg-surface-hover p-1">
          {(["daily", "weekly"] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={cn(
                "rounded px-2.5 py-1 text-2xs font-medium capitalize transition-colors",
                period === p ? "bg-brand-500/15 text-brand-400" : "text-ink-muted hover:text-ink-em",
              )}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <Card className="mt-4">
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-4 gap-3 border-b border-border pb-4">
            {report.stats.map((s) => (
              <div key={s.label}>
                <p className="text-[10px] font-medium tracking-[0.06em] text-ink-faint uppercase">{s.label}</p>
                <p className="mt-1 font-heading text-xl text-ink-em tabular-nums">{s.value}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-2">
            {report.body.map((p, i) => (
              <p key={i} className="text-sm leading-relaxed text-ink-muted">
                {p}
              </p>
            ))}
          </div>

          <Link
            href="/reliability/on-call"
            className="flex w-fit items-center gap-1 text-2xs font-medium text-brand-400 hover:underline"
          >
            See who&rsquo;s on call next
            <ArrowRight className="size-3" />
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
