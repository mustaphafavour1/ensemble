import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Shared visual identity for every EnsembleAI touch (Daily Digest,
 * Stuck-Run Highlight, Spec Quality Check, Cost Anomaly). Deliberately
 * brand green, not the agent-violet accent — violet is reserved for
 * content an agent authored, and these notes are Ensemble's own
 * commentary about the fleet, not authored work product.
 */
export function EnsembleAINote({
  label = "EnsembleAI",
  children,
  className,
}: {
  label?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-brand-500/20 bg-brand-500/[0.045] px-4 py-3.5",
        className,
      )}
    >
      <div className="mb-1.5 flex items-center gap-1.5">
        <Sparkles className="size-3 text-brand-400" strokeWidth={2} />
        <span className="text-2xs font-medium tracking-[0.08em] text-brand-400 uppercase">
          {label}
        </span>
      </div>
      <div className="text-xs leading-relaxed text-ink-em">{children}</div>
    </div>
  );
}
