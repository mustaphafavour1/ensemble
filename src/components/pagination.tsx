"use client";

import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from "lucide-react";

const PAGE_SIZE_STEP = 10;
const PAGE_SIZE_MIN = 10;
const PAGE_SIZE_MAX = 100;

export function Pagination({
  page,
  pageCount,
  total,
  pageSize,
  noun,
  onPageChange,
  onPageSizeChange,
}: {
  page: number;
  pageCount: number;
  total: number;
  pageSize: number;
  noun: string;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}) {
  if (total === 0) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
      <p className="text-2xs text-ink-muted tabular-nums">
        Showing {start.toLocaleString()}–{end.toLocaleString()} of{" "}
        {total.toLocaleString()} {noun}
      </p>
      <div className="flex items-center gap-2">
        <div className="flex items-center overflow-hidden rounded-md border border-border">
          <span className="px-2 font-mono text-2xs text-ink-em tabular-nums">
            {pageSize}
          </span>
          <div className="flex flex-col border-l border-border">
            <button
              type="button"
              onClick={() => onPageSizeChange(Math.min(PAGE_SIZE_MAX, pageSize + PAGE_SIZE_STEP))}
              disabled={pageSize >= PAGE_SIZE_MAX}
              className="flex h-3 w-4 items-center justify-center text-ink-muted hover:bg-surface-hover hover:text-ink-em disabled:pointer-events-none disabled:opacity-30"
              aria-label="Increase rows per page"
            >
              <ChevronUp className="size-2" />
            </button>
            <button
              type="button"
              onClick={() => onPageSizeChange(Math.max(PAGE_SIZE_MIN, pageSize - PAGE_SIZE_STEP))}
              disabled={pageSize <= PAGE_SIZE_MIN}
              className="flex h-3 w-4 items-center justify-center border-t border-border text-ink-muted hover:bg-surface-hover hover:text-ink-em disabled:pointer-events-none disabled:opacity-30"
              aria-label="Decrease rows per page"
            >
              <ChevronDown className="size-2" />
            </button>
          </div>
        </div>
        <span className="text-2xs text-ink-faint">per page</span>

        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="flex size-6 items-center justify-center rounded-md border border-border text-ink-muted transition-colors hover:bg-surface-hover hover:text-ink-em disabled:pointer-events-none disabled:opacity-30"
          aria-label="Previous page"
        >
          <ChevronLeft className="size-3.5" />
        </button>
        <span className="flex h-6 min-w-6 items-center justify-center rounded-md border border-brand-500/30 bg-brand-500/10 px-1.5 font-mono text-2xs text-brand-400 tabular-nums">
          {page}
        </span>
        <span className="text-2xs text-ink-faint">of {pageCount}</span>
        <button
          type="button"
          disabled={page >= pageCount}
          onClick={() => onPageChange(page + 1)}
          className="flex size-6 items-center justify-center rounded-md border border-border text-ink-muted transition-colors hover:bg-surface-hover hover:text-ink-em disabled:pointer-events-none disabled:opacity-30"
          aria-label="Next page"
        >
          <ChevronRight className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
