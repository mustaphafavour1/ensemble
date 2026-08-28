"use client";

import { useState } from "react";
import { toast } from "sonner";
import { FileText, Eye } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAppStore } from "@/lib/store";
import { ROLES } from "@/lib/roles";
import { SYSTEM_MESSAGES, type SystemMessage } from "@/lib/mock/system-messages";
import { formatRelative } from "@/lib/mock/time";

function renderPreview(body: string, vars: Record<string, string>): string {
  return body.replace(/\{(\w+)\}/g, (match, key) => vars[key] ?? match);
}

function MessageEditor({ message, onSave }: { message: SystemMessage; onSave: (id: string, body: string) => void }) {
  const [body, setBody] = useState(message.body);
  const dirty = body !== message.body;

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle>{message.title}</CardTitle>
          <div className="mt-1.5 flex items-center gap-2 text-2xs text-ink-faint">
            <span className="rounded-full border border-border px-2 py-0.5">{message.surface}</span>
            <span>{message.scope}</span>
            <span>
              Updated {formatRelative(message.updatedAt)} by {message.updatedBy}
            </span>
          </div>
        </div>
        <Button size="sm" disabled={!dirty} onClick={() => onSave(message.id, body)}>
          Save
        </Button>
      </CardHeader>
      <CardContent>
        <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={3} className="text-xs" />
        <div className="mt-3 rounded-md border border-dashed border-border bg-surface/60 p-3">
          <p className="mb-1.5 flex items-center gap-1.5 text-2xs font-medium text-ink-faint uppercase">
            <Eye className="size-3" />
            Preview
          </p>
          <p className="text-xs leading-relaxed text-ink-em">{renderPreview(body, message.previewVars)}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function SystemMessagesPage() {
  const role = useAppStore((s) => s.role);
  const [messages, setMessages] = useState<SystemMessage[]>(SYSTEM_MESSAGES);

  function handleSave(id: string, body: string) {
    const editor = ROLES.find((r) => r.id === role)?.name ?? "You";
    const msg = messages.find((m) => m.id === id);
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, body, updatedAt: Date.now(), updatedBy: editor } : m)));
    toast.success("Copy updated", { description: msg?.title });
  }

  return (
    <div>
      <PageHeader
        title="System Messages & Copy"
        description="User-facing wording for rate limits, downtime, and availability — per model and surface, with a live preview."
      />

      <div className="mb-4 flex items-center gap-2 text-2xs text-ink-faint">
        <FileText className="size-3" />
        {messages.length} message templates
      </div>

      <div className="flex flex-col gap-4">
        {messages.map((m) => (
          <MessageEditor key={m.id} message={m} onSave={handleSave} />
        ))}
      </div>
    </div>
  );
}
