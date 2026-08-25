import type { Stack } from "@/lib/mock/catalog";
import { cn } from "@/lib/utils";

export function StackTag({
  stack,
  label,
  className,
}: {
  stack: Stack;
  label?: string;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-ink-100", className)}>
      <span
        className="size-1.5 shrink-0 rounded-full"
        style={{ background: stack.color }}
      />
      {label ?? `${stack.language} · ${stack.framework}`}
    </span>
  );
}
