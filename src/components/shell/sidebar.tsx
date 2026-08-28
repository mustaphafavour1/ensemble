"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { Logo } from "@/components/shell/logo";
import { NAV, SETTINGS_NAV, SETTINGS_ICON } from "@/lib/nav";
import { ROLES } from "@/lib/roles";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const ALL_HREFS = [
  ...NAV.flatMap((group) => group.items.map((item) => item.href)),
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

function activeGroupLabel(activeHref: string | null): string | null {
  if (!activeHref) return null;
  return NAV.find((g) => g.items.some((i) => i.href === activeHref))?.label ?? null;
}

export function Sidebar() {
  const pathname = usePathname();
  const activeHref = getActiveHref(pathname);
  const activeGroup = activeGroupLabel(activeHref);
  const role = useAppStore((s) => s.role);
  const roleDef = ROLES.find((r) => r.id === role) ?? ROLES[0];

  // null = showing the top-level menu list. A group label = drilled into
  // that group's own submenu view (Vercel-style: the sidebar swaps its
  // content rather than expanding a nested tree in place).
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

  const openGroupDef = NAV.find((g) => g.label === openGroup) ?? null;
  const OpenGroupIcon = openGroupDef?.icon;

  return (
    <aside
      className="hidden shrink-0 flex-col border-r border-sidebar-border bg-sidebar md:flex"
      style={{ width: "var(--sidebar-width)" }}
    >
      <div
        className="flex shrink-0 items-center border-b border-sidebar-border px-5"
        style={{ height: "var(--header-height)" }}
      >
        <Logo />
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {!openGroupDef ? (
          <ul className="flex flex-col gap-0.5">
            {NAV.map((group) => {
              const GroupIcon = group.icon;
              const groupActive = group.label === activeGroup;
              return (
                <li key={group.label}>
                  <button
                    type="button"
                    onClick={() => setOpenGroup(group.label)}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-xs font-medium transition-colors",
                      groupActive
                        ? "bg-brand-500/10 text-brand-400"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    )}
                  >
                    <GroupIcon className="size-3.5 shrink-0" strokeWidth={2} />
                    <span className="flex-1">{group.label}</span>
                    <ChevronRight className="size-3.5 shrink-0 text-ink-faint" />
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <div>
            <button
              type="button"
              onClick={() => setOpenGroup(null)}
              aria-label="Back to main menu"
              className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left transition-colors hover:bg-sidebar-accent"
            >
              <ChevronLeft className="size-3.5 shrink-0 text-ink-faint" />
              {OpenGroupIcon && <OpenGroupIcon className="size-3.5 shrink-0 text-ink-em" strokeWidth={2} />}
              <span className="flex-1 truncate text-xs font-medium text-ink-em">
                {openGroupDef.label}
              </span>
            </button>

            <div className="my-2 border-t border-sidebar-border" />

            <ul className="flex flex-col gap-0.5">
              {openGroupDef.items.map((item) => {
                const active = item.href === activeHref;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center justify-between rounded-md px-2.5 py-1.5 text-xs transition-colors",
                        active
                          ? "bg-brand-500/10 font-medium text-brand-400"
                          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                        !item.built && "opacity-60",
                      )}
                    >
                      <span>{item.label}</span>
                      {!item.built && <ChevronRight className="size-3 opacity-50" />}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
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
    </aside>
  );
}
