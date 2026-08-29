"use client";

import { useState } from "react";
import { Calendar as CalendarIcon, Check, ChevronDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { REFERENCE_NOW, daysAgo, formatDate } from "@/lib/mock/time";
import { cn } from "@/lib/utils";

type Granularity = "day" | "week" | "month" | "custom";

function isoDate(ts: number): string {
  return new Date(ts).toISOString().slice(0, 10);
}

const RECENT_DAYS = Array.from({ length: 10 }, (_, i) => daysAgo(i));
const RECENT_WEEKS = Array.from({ length: 8 }, (_, i) => ({
  start: daysAgo(i * 7 + 6),
  end: daysAgo(i * 7),
}));
const RECENT_MONTHS = Array.from({ length: 12 }, (_, i) => {
  const d = new Date(REFERENCE_NOW);
  d.setDate(1);
  d.setMonth(d.getMonth() - i);
  return d.getTime();
});

const GRANULARITY_LABEL: Record<Granularity, string> = {
  day: "Daily",
  week: "Weekly",
  month: "Monthly",
  custom: "Custom",
};

export function DateRangeFilter() {
  const [open, setOpen] = useState(false);
  const [granularity, setGranularity] = useState<Granularity>("day");
  const [dayIdx, setDayIdx] = useState(0);
  const [weekIdx, setWeekIdx] = useState(0);
  const [monthIdx, setMonthIdx] = useState(0);
  const [customFrom, setCustomFrom] = useState(isoDate(daysAgo(7)));
  const [customTo, setCustomTo] = useState(isoDate(REFERENCE_NOW));
  const [appliedLabel, setAppliedLabel] = useState("Today");

  function currentLabel(): string {
    if (granularity === "day") {
      return dayIdx === 0 ? "Today" : dayIdx === 1 ? "Yesterday" : formatDate(RECENT_DAYS[dayIdx]);
    }
    if (granularity === "week") {
      return weekIdx === 0 ? "This week" : `Week of ${formatDate(RECENT_WEEKS[weekIdx].start)}`;
    }
    if (granularity === "month") {
      return new Date(RECENT_MONTHS[monthIdx]).toLocaleDateString("en-US", { month: "long", year: "numeric" });
    }
    return `${formatDate(new Date(customFrom).getTime())} – ${formatDate(new Date(customTo).getTime())}`;
  }

  function handleApply() {
    setAppliedLabel(currentLabel());
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button
            type="button"
            className="flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-1.5 text-xs text-ink-em transition-colors hover:border-neutral-700"
          />
        }
      >
        <CalendarIcon className="size-3.5 text-ink-faint" strokeWidth={1.75} />
        {appliedLabel}
        <ChevronDown className={cn("size-3.5 text-ink-faint transition-transform", open && "rotate-180")} strokeWidth={1.75} />
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72">
        <div className="flex items-center gap-1 rounded-md bg-surface-hover p-1">
          {(Object.keys(GRANULARITY_LABEL) as Granularity[]).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGranularity(g)}
              className={cn(
                "flex-1 rounded px-2 py-1 text-2xs font-medium transition-colors",
                granularity === g
                  ? "bg-brand-500/15 text-brand-400"
                  : "text-ink-muted hover:text-ink-em",
              )}
            >
              {GRANULARITY_LABEL[g]}
            </button>
          ))}
        </div>

        <div className="mt-2.5">
          {granularity === "day" && (
            <select
              value={dayIdx}
              onChange={(e) => setDayIdx(Number(e.target.value))}
              className="h-8 w-full rounded-md border border-border bg-transparent px-2 text-xs text-ink-em focus:border-brand-600 focus:outline-none"
            >
              {RECENT_DAYS.map((ts, i) => (
                <option key={i} value={i}>
                  {i === 0 ? "Today" : i === 1 ? "Yesterday" : formatDate(ts)}
                </option>
              ))}
            </select>
          )}
          {granularity === "week" && (
            <select
              value={weekIdx}
              onChange={(e) => setWeekIdx(Number(e.target.value))}
              className="h-8 w-full rounded-md border border-border bg-transparent px-2 text-xs text-ink-em focus:border-brand-600 focus:outline-none"
            >
              {RECENT_WEEKS.map((w, i) => (
                <option key={i} value={i}>
                  {i === 0 ? "This week" : `Week of ${formatDate(w.start)}`}
                </option>
              ))}
            </select>
          )}
          {granularity === "month" && (
            <select
              value={monthIdx}
              onChange={(e) => setMonthIdx(Number(e.target.value))}
              className="h-8 w-full rounded-md border border-border bg-transparent px-2 text-xs text-ink-em focus:border-brand-600 focus:outline-none"
            >
              {RECENT_MONTHS.map((ts, i) => (
                <option key={i} value={i}>
                  {new Date(ts).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </option>
              ))}
            </select>
          )}
          {granularity === "custom" && (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="h-8 w-full rounded-md border border-border bg-transparent px-2 text-xs text-ink-em focus:border-brand-600 focus:outline-none"
              />
              <span className="text-2xs text-ink-faint">to</span>
              <input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                className="h-8 w-full rounded-md border border-border bg-transparent px-2 text-xs text-ink-em focus:border-brand-600 focus:outline-none"
              />
            </div>
          )}
        </div>

        <Button size="sm" className="mt-2.5 w-full" onClick={handleApply}>
          <Check className="size-3.5" />
          Apply
        </Button>
      </PopoverContent>
    </Popover>
  );
}
