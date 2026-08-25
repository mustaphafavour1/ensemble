"use client";

import { useMemo, useState } from "react";

export function usePagination<T>(items: T[], pageSize: number) {
  const [pageState, setPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const page = Math.min(pageState, pageCount);

  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, page, pageSize]);

  return { page, setPage, pageCount, pageItems, total: items.length };
}
