"use client";

import { useState } from "react";
import { Check, ChevronsUpDown, Lock } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ROLES } from "@/lib/roles";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function RoleSwitcher() {
  const [open, setOpen] = useState(false);
  const role = useAppStore((s) => s.role);
  const setRole = useAppStore((s) => s.setRole);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="flex w-full items-center justify-between rounded-md border border-border bg-surface px-3.5 py-2.5 text-left text-xs text-ink-100 transition-colors hover:border-neutral-700">
        <span className="font-medium">
          {ROLES.find((r) => r.id === role)?.name}
        </span>
        <ChevronsUpDown className="size-3.5 text-ink-500" />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[22rem] p-1.5">
        {ROLES.map((r) => {
          const selected = r.id === role;
          return (
            <button
              key={r.id}
              type="button"
              disabled={!r.built}
              onClick={() => {
                setRole(r.id);
                setOpen(false);
              }}
              className={cn(
                "flex w-full items-start gap-2.5 rounded-md px-2.5 py-2 text-left transition-colors",
                r.built
                  ? "cursor-pointer hover:bg-accent"
                  : "cursor-not-allowed opacity-50",
              )}
            >
              <div className="mt-0.5 flex size-3.5 shrink-0 items-center justify-center">
                {selected ? (
                  <Check className="size-3.5 text-brand-500" />
                ) : !r.built ? (
                  <Lock className="size-3 text-ink-500" />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-medium text-ink-100">{r.name}</p>
                  {!r.built && (
                    <span className="rounded-full border border-border px-1.5 py-px text-[9px] text-ink-500 uppercase tracking-wide">
                      Not in preview
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-2xs text-ink-300">
                  {r.description}
                </p>
              </div>
            </button>
          );
        })}
      </PopoverContent>
    </Popover>
  );
}
