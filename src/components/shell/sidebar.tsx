"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { Logo } from "@/components/shell/logo";
import { NAV } from "@/lib/nav";
import { ROLES } from "@/lib/roles";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

function isActive(pathname: string, href: string) {
  if (href === "/overview") return pathname === "/overview";
  return pathname === href || pathname.startsWith(href + "/");
}

export function Sidebar() {
  const pathname = usePathname();
  const role = useAppStore((s) => s.role);
  const roleDef = ROLES.find((r) => r.id === role) ?? ROLES[0];

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
        <ul className="flex flex-col gap-0.5">
          {NAV.map((group) => {
            const GroupIcon = group.icon;
            if (group.href) {
              const active = isActive(pathname, group.href);
              return (
                <li key={group.label}>
                  <Link
                    href={group.href}
                    className={cn(
                      "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-xs font-medium transition-colors",
                      active
                        ? "bg-brand-500/10 text-brand-400"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    )}
                  >
                    <GroupIcon className="size-3.5 shrink-0" strokeWidth={2} />
                    {group.label}
                  </Link>
                </li>
              );
            }

            return (
              <li key={group.label} className="mt-4 first:mt-0">
                <div className="flex items-center gap-2 px-2.5 pb-1.5 text-2xs font-medium tracking-[0.08em] text-ink-500 uppercase">
                  <GroupIcon className="size-3 shrink-0" strokeWidth={2} />
                  {group.label}
                </div>
                <ul className="flex flex-col gap-0.5">
                  {group.items.map((item) => {
                    const active = isActive(pathname, item.href);
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className={cn(
                            "flex items-center justify-between rounded-md py-1.5 pr-2.5 pl-7 text-xs transition-colors",
                            active
                              ? "bg-brand-500/10 font-medium text-brand-400"
                              : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                            !item.built && "opacity-60",
                          )}
                        >
                          <span>{item.label}</span>
                          {!item.built && (
                            <ChevronRight className="size-3 opacity-50" />
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </li>
            );
          })}
        </ul>
      </nav>

      <Link
        href="/settings"
        className="flex shrink-0 items-center gap-2.5 border-t border-sidebar-border px-5 py-3.5 transition-colors hover:bg-sidebar-accent"
      >
        <span className="relative flex size-2 shrink-0">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand-500/60" />
          <span className="relative inline-flex size-2 rounded-full bg-brand-500" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-2xs font-medium text-ink-100">
            {roleDef.name}
          </p>
          <p className="truncate text-2xs text-ink-500">Viewing as this role</p>
        </div>
      </Link>
    </aside>
  );
}
