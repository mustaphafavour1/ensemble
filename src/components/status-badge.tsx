import { cn } from "@/lib/utils";

export type Tone = "brand" | "agent" | "success" | "warning" | "danger" | "neutral";

const TONE_CLASSES: Record<Tone, string> = {
  brand: "bg-brand-500/10 text-brand-400 border-brand-500/20",
  agent: "bg-agent-500/10 text-agent-400 border-agent-500/25",
  success: "bg-success-500/10 text-success-300 border-success-500/25",
  warning: "bg-warning-500/10 text-warning-300 border-warning-500/25",
  danger: "bg-danger-500/10 text-danger-300 border-danger-500/25",
  neutral: "bg-neutral-800 text-ink-muted border-border",
};

const DOT_CLASSES: Record<Tone, string> = {
  brand: "bg-brand-400",
  agent: "bg-agent-400",
  success: "bg-success-300",
  warning: "bg-warning-300",
  danger: "bg-danger-300",
  neutral: "bg-ink-faint",
};

export function StatusBadge({
  tone,
  label,
  className,
  pulse = false,
}: {
  tone: Tone;
  label: string;
  className?: string;
  pulse?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1.5 rounded-full border px-2 py-0.5 text-2xs font-medium whitespace-nowrap",
        TONE_CLASSES[tone],
        className,
      )}
    >
      <span className="relative flex size-1.5 shrink-0">
        {pulse && (
          <span
            className={cn(
              "absolute inline-flex size-full animate-ping rounded-full opacity-60",
              DOT_CLASSES[tone],
            )}
          />
        )}
        <span className={cn("relative inline-flex size-1.5 rounded-full", DOT_CLASSES[tone])} />
      </span>
      {label}
    </span>
  );
}
