import { cn } from "@/lib/utils";

/** Every agent-name mention carries the same small violet marker — the
 * accent color's one functional job: flagging AI-authored content. */
export function AgentTag({ name, className }: { name: string; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-ink-100", className)}>
      <span className="size-1.5 shrink-0 rounded-full bg-agent-500" />
      {name}
    </span>
  );
}
