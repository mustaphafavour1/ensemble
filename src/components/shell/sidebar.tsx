"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, ChevronLeft, Search, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Logo, LogoMark } from "@/components/shell/logo";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { NAV, SETTINGS_NAV, SETTINGS_ICON, type NavGroup } from "@/lib/nav";
import { ROLES } from "@/lib/roles";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const ALL_HREFS = [
  ...NAV.flatMap((entry) => (entry.type === "group" ? entry.items.map((item) => item.href) : [entry.href])),
  SETTINGS_NAV.href,
];

/**
 * A pathname like /agents/tasks matches both "/agents" and "/agents/tasks" by
 * prefix — only the longest (most specific) match should light up, or every
 * sub-route highlights its own item AND its parent section at once.
 */
function getActiveHref(pathname: string): string | null {
  let best: string | null = null;
  for (const href of ALL_HREFS) {
    const matches = pathname === href || pathname.startsWith(href + "/");
    if (matches && (!best || href.length > best.length)) best = href;
  }
  return best;
}

/** Only a drill-in group has a "group" to auto-open — a flat link has none. */
function activeGroupLabel(activeHref: string | null): string | null {
  if (!activeHref) return null;
  const groups = NAV.filter((entry): entry is NavGroup => entry.type === "group");
  return groups.find((g) => g.items.some((i) => i.href === activeHref))?.label ?? null;
}

export function Sidebar() {
  const pathname = usePathname();
  const activeHref = getActiveHref(pathname);
  const activeGroup = activeGroupLabel(activeHref);
  const role = useAppStore((s) => s.role);
  const roleDef = ROLES.find((r) => r.id === role) ?? ROLES[0];

  // null = no group drilled into. A group label = that group's submenu panel
  // is open alongside the icon rail.
  const [openGroup, setOpenGroup] = useState<string | null>(activeGroup);

  // Tracks the last route's group so a navigation (including one triggered
  // outside the sidebar) can drill into its group without fighting a user
  // who has manually backed out to the top-level menu on the same route.
  // Adjusting state during render (React's documented pattern for "state
  // changed because a prop/derived value changed") instead of an effect,
  // so it settles before paint.
  const [trackedGroup, setTrackedGroup] = useState(activeGroup);
  if (activeGroup !== trackedGroup) {
    setTrackedGroup(activeGroup);
    setOpenGroup(activeGroup);
  }

  // Manually toggleable, independent of whether a group is open — but a
  // group being open always forces the icon-only rendering regardless.
  const [collapsed, setCollapsed] = useState(false);
  const iconOnly = collapsed || openGroup !== null;

  const openGroupDef = NAV.find((entry): entry is NavGroup => entry.type === "group" && entry.label === openGroup) ?? null;
  const OpenGroupIcon = openGroupDef?.icon;

  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();

  const searchResults = useMemo(() => {
    if (!normalizedQuery) return [];
    return NAV.flatMap((entry) =>
      entry.type === "group"
        ? entry.items
            .filter((item) => item.label.toLowerCase().includes(normalizedQuery))
            .map((item) => ({ ...item, groupLabel: entry.label as string | null, groupIcon: entry.icon }))
        : entry.label.toLowerCase().includes(normalizedQuery)
          ? [{ ...entry, groupLabel: null as string | null, groupIcon: entry.icon }]
          : [],
    );
  }, [normalizedQuery]);

  const width = !iconOnly
    ? "var(--sidebar-width)"
    : openGroupDef
      ? "calc(var(--sidebar-rail-width) + var(--sidebar-panel-width))"
      : "var(--sidebar-rail-width)";

  return (
    <aside
      className="hidden shrink-0 flex-row border-r border-sidebar-border bg-sidebar transition-[width] duration-150 md:flex"
      style={{ width }}
    >
      {iconOnly ? (
        <>
          <div className="flex h-full shrink-0 flex-col" style={{ width: "var(--sidebar-rail-width)" }}>
            <div
              className="flex shrink-0 items-center justify-center border-b border-sidebar-border"
              style={{ height: "var(--header-height)" }}
            >
              <LogoMark className="size-[18px] text-brand-500" />
            </div>

            <nav className="flex flex-1 flex-col items-center gap-[3px] overflow-y-auto px-2 py-3">
              <Tooltip>
                <TooltipTrigger
                  render={
                    <button
                      type="button"
                      onClick={() => {
                        setCollapsed(false);
                        setOpenGroup(null);
                      }}
                      aria-label="Expand sidebar"
                      className="flex size-9 shrink-0 items-center justify-center rounded-md text-ink-faint transition-colors hover:bg-sidebar-accent hover:text-ink-em"
                    />
                  }
                >
                  <PanelLeftOpen className="size-4" strokeWidth={2} />
                </TooltipTrigger>
                <TooltipContent side="right">Expand sidebar</TooltipContent>
              </Tooltip>

              <div className="my-1 h-px w-6 shrink-0 bg-sidebar-border" />

              {NAV.map((entry) => {
                const EntryIcon = entry.icon;

                if (entry.type === "link") {
                  const active = entry.href === activeHref;
                  return (
                    <Tooltip key={entry.href}>
                      <TooltipTrigger
                        render={
                          <Link
                            href={entry.href}
                            aria-label={entry.label}
                            className={cn(
                              "flex size-9 shrink-0 items-center justify-center rounded-md transition-colors",
                              active
                                ? "bg-brand-500/10 text-brand-400"
                                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                              !entry.built && "opacity-60",
                            )}
                          />
                        }
                      >
                        <EntryIcon className="size-4" strokeWidth={2} />
                      </TooltipTrigger>
                      <TooltipContent side="right">{entry.label}</TooltipContent>
                    </Tooltip>
                  );
                }

                const groupHighlighted = entry.label === openGroup || (!openGroupDef && entry.label === activeGroup);
                return (
                  <Tooltip key={entry.label}>
                    <TooltipTrigger
                      render={
                        <button
                          type="button"
                          onClick={() => setOpenGroup(openGroup === entry.label ? null : entry.label)}
                          aria-label={entry.label}
                          className={cn(
                            "flex size-9 shrink-0 items-center justify-center rounded-md transition-colors",
                            groupHighlighted
                              ? "bg-brand-500/10 text-brand-400"
                              : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                          )}
                        />
                      }
                    >
                      <EntryIcon className="size-4" strokeWidth={2} />
                    </TooltipTrigger>
                    <TooltipContent side="right">{entry.label}</TooltipContent>
                  </Tooltip>
                );
              })}
            </nav>

            <Tooltip>
              <TooltipTrigger
                render={
                  <Link
                    href={SETTINGS_NAV.href}
                    aria-label={SETTINGS_NAV.label}
                    className={cn(
                      "flex shrink-0 items-center justify-center border-t border-sidebar-border py-3.5 transition-colors hover:bg-sidebar-accent",
                      activeHref === SETTINGS_NAV.href && "bg-brand-500/10",
                    )}
                  />
                }
              >
                <SETTINGS_ICON
                  className={cn("size-4", activeHref === SETTINGS_NAV.href ? "text-brand-400" : "text-ink-faint")}
                  strokeWidth={2}
                />
              </TooltipTrigger>
              <TooltipContent side="right">{SETTINGS_NAV.label}</TooltipContent>
            </Tooltip>
          </div>

          {openGroupDef && (
            <div
              className="flex h-full min-w-0 flex-col border-l border-sidebar-border"
              style={{ width: "var(--sidebar-panel-width)" }}
            >
              <div
                className="flex shrink-0 items-center border-b border-sidebar-border px-3"
                style={{ height: "var(--header-height)" }}
              >
                <button
                  type="button"
                  onClick={() => setOpenGroup(null)}
                  aria-label="Back to main menu"
                  className="flex w-full items-center gap-2 rounded-md py-1.5 text-left transition-colors hover:bg-sidebar-accent"
                >
                  <ChevronLeft className="size-3.5 shrink-0 text-ink-faint" />
                  {OpenGroupIcon && <OpenGroupIcon className="size-3.5 shrink-0 text-ink-em" strokeWidth={2} />}
                  <span className="flex-1 truncate text-xs font-medium text-ink-em">{openGroupDef.label}</span>
                </button>
              </div>

              <nav className="flex flex-1 flex-col gap-[3px] overflow-y-auto px-2 py-3">
                {openGroupDef.items.map((item) => {
                  const active = item.href === activeHref;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center justify-between rounded-md px-2.5 py-2 text-[11.5px] font-medium transition-colors",
                        active
                          ? "bg-brand-500/10 text-brand-400"
                          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                        !item.built && "opacity-60",
                      )}
                    >
                      <span className="truncate">{item.label}</span>
                      {!item.built && <ChevronRight className="size-3 shrink-0 opacity-50" />}
                    </Link>
                  );
                })}
              </nav>
            </div>
          )}
        </>
      ) : (
        <div className="flex h-full min-w-0 flex-1 flex-col">
          <div
            className="flex shrink-0 items-center justify-between border-b border-sidebar-border py-3 pr-3 pl-5"
            style={{ height: "var(--header-height)" }}
          >
            <Logo />
            <button
              type="button"
              onClick={() => setCollapsed(true)}
              aria-label="Collapse sidebar to icons"
              className="flex size-6 shrink-0 items-center justify-center rounded-md text-ink-faint transition-colors hover:bg-sidebar-accent hover:text-ink-em"
            >
              <PanelLeftClose className="size-3.5" strokeWidth={2} />
            </button>
          </div>

          <nav className="flex flex-1 flex-col overflow-y-auto px-3 py-4">
            <div className="relative mb-3 shrink-0">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3 -translate-y-1/2 text-ink-faint" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") setQuery("");
                }}
                placeholder="Find a page…"
                className="h-7 w-full rounded-md border border-sidebar-border bg-sidebar-accent/40 pr-2 pl-7 text-xs text-ink-em placeholder:text-ink-faint focus:border-brand-600 focus:outline-none"
              />
            </div>

            {normalizedQuery ? (
              <ul className="flex flex-col gap-[3px]">
                {searchResults.map((item) => {
                  const GroupIcon = item.groupIcon;
                  const active = item.href === activeHref;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setQuery("")}
                        className={cn(
                          "flex items-center gap-2.5 rounded-md px-2.5 py-2 transition-colors",
                          active
                            ? "bg-brand-500/10 text-brand-400"
                            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                          !item.built && "opacity-60",
                        )}
                      >
                        <GroupIcon className="size-3.5 shrink-0 text-ink-faint" strokeWidth={2} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs">{item.label}</p>
                          {item.groupLabel && (
                            <p className="truncate text-2xs text-ink-faint">{item.groupLabel}</p>
                          )}
                        </div>
                      </Link>
                    </li>
                  );
                })}
                {searchResults.length === 0 && (
                  <li className="px-2 py-4 text-center text-2xs text-ink-faint">
                    No pages match &ldquo;{query}&rdquo;
                  </li>
                )}
              </ul>
            ) : (
              <ul className="flex flex-col gap-[3px]">
                {NAV.map((entry) => {
                  const EntryIcon = entry.icon;

                  if (entry.type === "link") {
                    const active = entry.href === activeHref;
                    return (
                      <li key={entry.href}>
                        <Link
                          href={entry.href}
                          className={cn(
                            "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-xs font-medium transition-colors",
                            active
                              ? "bg-brand-500/10 text-brand-400"
                              : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                            !entry.built && "opacity-60",
                          )}
                        >
                          <EntryIcon className="size-3.5 shrink-0" strokeWidth={2} />
                          <span className="flex-1 truncate whitespace-nowrap">{entry.label}</span>
                        </Link>
                      </li>
                    );
                  }

                  const groupActive = entry.label === activeGroup;
                  return (
                    <li key={entry.label}>
                      <button
                        type="button"
                        onClick={() => setOpenGroup(entry.label)}
                        className={cn(
                          "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-xs font-medium transition-colors",
                          groupActive
                            ? "bg-brand-500/10 text-brand-400"
                            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                        )}
                      >
                        <EntryIcon className="size-3.5 shrink-0" strokeWidth={2} />
                        <span className="flex-1 truncate whitespace-nowrap">{entry.label}</span>
                        <ChevronRight className="size-3.5 shrink-0 text-ink-faint" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </nav>

          <Link
            href={SETTINGS_NAV.href}
            className={cn(
              "flex shrink-0 items-center gap-2.5 border-t border-sidebar-border px-5 py-3.5 transition-colors hover:bg-sidebar-accent",
              activeHref === SETTINGS_NAV.href && "bg-brand-500/10",
            )}
          >
            <SETTINGS_ICON
              className={cn(
                "size-3.5 shrink-0",
                activeHref === SETTINGS_NAV.href ? "text-brand-400" : "text-ink-faint",
              )}
              strokeWidth={2}
            />
            <div className="min-w-0 flex-1">
              <p
                className={cn(
                  "truncate text-2xs font-medium",
                  activeHref === SETTINGS_NAV.href ? "text-brand-400" : "text-ink-em",
                )}
              >
                {SETTINGS_NAV.label}
              </p>
              <p className="truncate text-2xs text-ink-faint">{roleDef.name}</p>
            </div>
            <span className="relative flex size-1.5 shrink-0">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand-500/60" />
              <span className="relative inline-flex size-1.5 rounded-full bg-brand-500" />
            </span>
          </Link>
        </div>
      )}
    </aside>
  );
}
