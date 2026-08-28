"use client";

import { useSyncExternalStore } from "react";
import { Search, Calendar } from "lucide-react";

// getSnapshot must return a cached value that only changes when subscribe's
// callback fires — recomputing Date.now() on every call (React invokes it on
// every render to check for tearing) looks like a permanently-changing store
// and causes an infinite render loop.
let cachedNow = Date.now();

function subscribe(callback: () => void) {
  const id = setInterval(() => {
    cachedNow = Date.now();
    callback();
  }, 30_000);
  return () => clearInterval(id);
}

function getSnapshot() {
  return cachedNow;
}

function getServerSnapshot() {
  return 0;
}

function formatChip(timestamp: number) {
  const date = new Date(timestamp);
  const day = date.toLocaleDateString("en-US", { weekday: "short" });
  const md = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const time = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
  return `${day}, ${md} · ${time}`;
}

export function Topbar() {
  const now = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return (
    <header
      className="flex shrink-0 items-center justify-between gap-4 border-b border-border px-6"
      style={{ height: "var(--header-height)" }}
    >
      <div className="relative w-full max-w-sm">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-ink-faint" />
        <input
          type="text"
          placeholder="Search runs, agents, environments…"
          className="h-8 w-full rounded-md border border-border bg-surface pr-12 pl-8.5 text-xs text-ink-em placeholder:text-ink-faint focus:border-brand-600 focus:outline-none"
        />
        <kbd className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 rounded border border-border px-1.5 py-0.5 text-[9px] text-ink-faint">
          ⌘K
        </kbd>
      </div>

      <div className="flex shrink-0 items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 py-1.5 text-2xs text-ink-muted tabular-nums">
        <Calendar className="size-3 text-ink-faint" />
        {now ? formatChip(now) : "—"}
      </div>
    </header>
  );
}
