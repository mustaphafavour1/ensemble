import { cn } from "@/lib/utils";

/**
 * Vertically + horizontally centers underfilled content (forms, empty
 * states, single-card screens) within the space left after the shell's
 * standard content offset, per the layout system's centering rule.
 */
export function Centered({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-h-[calc(100dvh-var(--header-height)-var(--content-offset)-4rem)] items-center justify-center",
        className,
      )}
    >
      {children}
    </div>
  );
}
