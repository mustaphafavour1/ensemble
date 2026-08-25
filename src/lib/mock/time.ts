/**
 * Fixed reference instant for all mock data. Using a hardcoded value
 * (rather than Date.now()) keeps server-rendered and client-hydrated
 * output identical, and keeps "time ago" labels stable for the length
 * of the demo session.
 */
export const REFERENCE_NOW = new Date("2026-08-25T20:00:00.000Z").getTime();

export function minutesAgo(min: number): number {
  return REFERENCE_NOW - min * 60_000;
}

export function daysAgo(days: number): number {
  return REFERENCE_NOW - days * 86_400_000;
}

export function formatRelative(timestamp: number): string {
  const diffMs = REFERENCE_NOW - timestamp;
  const diffMin = Math.round(diffMs / 60_000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.round(diffHr / 24);
  if (diffDay < 30) return `${diffDay}d ago`;
  const diffMonth = Math.round(diffDay / 30);
  return `${diffMonth}mo ago`;
}

export function formatCountdown(timestamp: number): string {
  const diffMs = timestamp - REFERENCE_NOW;
  if (diffMs <= 0) return "expired";
  const diffMin = Math.round(diffMs / 60_000);
  if (diffMin < 60) return `${diffMin}m`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 48) return `${diffHr}h`;
  const diffDay = Math.round(diffHr / 24);
  return `${diffDay}d`;
}

export function formatDuration(ms: number): string {
  const totalSec = Math.round(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateTime(timestamp: number): string {
  return new Date(timestamp).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
