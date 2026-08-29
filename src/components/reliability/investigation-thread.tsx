"use client";

import { useState } from "react";
import { Lock, SendHorizontal } from "lucide-react";
import { toast } from "sonner";
import { AgentTag } from "@/components/agent-tag";
import { StatusBadge, type Tone } from "@/components/status-badge";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  type Investigation,
  type ThreadMessage,
  type ResourceChip,
  type SourceFinding,
  type Resolution,
  type ResolutionState,
} from "@/lib/mock/oncall";
import { formatRelative } from "@/lib/mock/time";
import { cn } from "@/lib/utils";

const RESOLUTION_META: Record<ResolutionState, { tone: Tone; label: string }> = {
  "auto-resolved": { tone: "success", label: "Auto-resolved" },
  "awaiting-approval": { tone: "warning", label: "Awaiting approval" },
  approved: { tone: "success", label: "Approved" },
};

function ChipPill({ chip }: { chip: ResourceChip }) {
  return (
    <button
      type="button"
      onClick={() =>
        toast(`${chip.system} · ${chip.scope}`, {
          description: "Opening in a new tab — read-only investigation access.",
        })
      }
      className="inline-flex items-center gap-1 rounded-full border border-border bg-surface-hover px-2 py-0.5 text-[10.5px] whitespace-nowrap text-ink-muted transition-colors hover:border-neutral-700 hover:text-ink-em"
    >
      <span className="font-medium text-ink-em">{chip.system}</span>
      <span className="text-ink-faint">·</span>
      {chip.scope}
    </button>
  );
}

function SourceRow({ source }: { source: SourceFinding }) {
  return (
    <div className="flex items-start gap-2.5 py-2 first:pt-0 last:pb-0">
      <span className="mt-1.5 size-1 shrink-0 rounded-full bg-ink-faint" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-medium tracking-wide text-ink-faint uppercase">{source.label}</span>
          <ChipPill chip={source.chip} />
        </div>
        <p className="mt-1 text-2xs leading-relaxed text-ink-muted">{source.finding}</p>
      </div>
    </div>
  );
}

function Message({ message }: { message: ThreadMessage }) {
  const isAgent = message.role === "agent";
  const [reacted, setReacted] = useState(Boolean(message.reaction));
  const [count, setCount] = useState(message.reaction?.count ?? 0);

  function toggleReaction() {
    setCount((c) => c + (reacted ? -1 : 1));
    setReacted((r) => !r);
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-1.5 rounded-lg border p-3",
        isAgent ? "border-agent-500/20 bg-agent-500/[0.04]" : "border-border bg-surface",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        {isAgent ? (
          <AgentTag name={message.author} className="text-2xs font-medium" />
        ) : (
          <span className="text-2xs font-medium text-ink-em">{message.author}</span>
        )}
        <span className="shrink-0 text-2xs text-ink-faint">{formatRelative(message.timestamp)}</span>
      </div>
      <p className="text-xs leading-relaxed text-ink-muted">{message.body}</p>
      {message.chips && message.chips.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {message.chips.map((c, i) => (
            <ChipPill key={i} chip={c} />
          ))}
        </div>
      )}
      {isAgent && (
        <button
          type="button"
          onClick={toggleReaction}
          className={cn(
            "mt-0.5 flex w-fit items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10.5px] transition-colors",
            reacted
              ? "border-brand-500/30 bg-brand-500/10 text-brand-400"
              : "border-border text-ink-faint hover:border-neutral-700 hover:text-ink-muted",
          )}
        >
          <span>👍</span>
          {count > 0 && <span className="tabular-nums">{count}</span>}
        </button>
      )}
    </div>
  );
}

function ResolutionBlock({ resolution }: { resolution: Resolution }) {
  const meta = RESOLUTION_META[resolution.state];
  return (
    <div className="rounded-lg border border-border bg-surface/40 p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-medium tracking-wide text-ink-faint uppercase">Resolution</span>
        <StatusBadge tone={meta.tone} label={meta.label} />
      </div>
      <p className="mt-1.5 text-xs text-ink-em">{resolution.action}</p>
      {resolution.state === "approved" && resolution.approver && (
        <p className="mt-1 text-2xs text-ink-faint">
          Approved by {resolution.approver}
          {resolution.approvedAt ? ` · ${formatRelative(resolution.approvedAt)}` : ""}
        </p>
      )}
      {resolution.state === "awaiting-approval" && (
        <p className="mt-1 text-2xs text-ink-faint">Proposed by the agent — needs a named human approver before it merges.</p>
      )}
      {resolution.state === "auto-resolved" && (
        <p className="mt-1 text-2xs text-ink-faint">Pre-authorized, reversible action — the agent applied this directly.</p>
      )}
    </div>
  );
}

function FollowUpInput() {
  const [value, setValue] = useState("");

  function handleAsk(e: React.FormEvent) {
    e.preventDefault();
    if (!value.trim()) return;
    toast.success("Sent to the on-call agent", {
      description: "It's re-checking the evidence — check back shortly for an answer.",
    });
    setValue("");
  }

  return (
    <form onSubmit={handleAsk} className="flex items-end gap-2">
      <Textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Ask a follow-up…"
        rows={1}
        className="min-h-0 flex-1 resize-none text-xs"
      />
      <Button type="submit" size="icon" disabled={!value.trim()} aria-label="Ask">
        <SendHorizontal className="size-3.5" />
      </Button>
    </form>
  );
}

export function InvestigationThread({ investigation }: { investigation: Investigation }) {
  return (
    <div className="flex flex-col gap-3">
      <div>
        <p className="mb-1.5 text-[10px] font-medium tracking-wide text-ink-faint uppercase">Investigation</p>
        <div className="rounded-lg border border-border bg-surface/40 p-3">
          <div className="mb-1.5 flex items-center gap-1.5 text-2xs text-ink-faint">
            <Lock className="size-3" strokeWidth={1.75} />
            Six sources, investigated in parallel — read-only, no approval needed
          </div>
          <div className="flex flex-col divide-y divide-border">
            {investigation.sources.map((s) => (
              <SourceRow key={s.kind} source={s} />
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {investigation.thread.map((m) => (
          <Message key={m.id} message={m} />
        ))}
      </div>

      {investigation.resolution && <ResolutionBlock resolution={investigation.resolution} />}

      <FollowUpInput />
    </div>
  );
}
