"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

function getPageWindow(current: number, total: number): (number | "…")[] {
  const delta = 1;
  const left = Math.max(2, current - delta);
  const right = Math.min(total - 1, current + delta);
  const range: (number | "…")[] = [1];

  if (left > 2) range.push("…");
  for (let i = left; i <= right; i++) range.push(i);
  if (right < total - 1) range.push("…");
  if (total > 1) range.push(total);

  return range;
}

export function Pagination({
  page,
  pageCount,
  total,
  pageSize,
  onPageChange,
}: {
  page: number;
  pageCount: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}) {
  if (pageCount <= 1) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
      <p className="text-2xs text-ink-500 tabular-nums">
        {start.toLocaleString()}–{end.toLocaleString()} of {total.toLocaleString()}
      </p>
      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="flex size-6 items-center justify-center rounded-md text-ink-300 transition-colors hover:bg-surface-hover hover:text-ink-100 disabled:pointer-events-none disabled:opacity-30"
          aria-label="Previous page"
        >
          <ChevronLeft className="size-3.5" />
        </button>
        {getPageWindow(page, pageCount).map((p, i) =>
          p === "…" ? (
            <span
              key={`ellipsis-${i}`}
              className="flex size-6 items-center justify-center text-2xs text-ink-500"
            >
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              aria-current={p === page}
              className={cn(
                "flex size-6 items-center justify-center rounded-md font-mono text-2xs tabular-nums transition-colors",
                p === page
                  ? "bg-brand-500/10 text-brand-400"
                  : "text-ink-300 hover:bg-surface-hover hover:text-ink-100",
              )}
            >
              {p}
            </button>
          ),
        )}
        <button
          type="button"
          disabled={page >= pageCount}
          onClick={() => onPageChange(page + 1)}
          className="flex size-6 items-center justify-center rounded-md text-ink-300 transition-colors hover:bg-surface-hover hover:text-ink-100 disabled:pointer-events-none disabled:opacity-30"
          aria-label="Next page"
        >
          <ChevronRight className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
