"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Bot } from "lucide-react";
import { Centered } from "@/components/centered";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MODELS } from "@/lib/mock/catalog";

const TRIGGERS = [
  { key: "prOpen", label: "Pull request opened", hint: "Runs when a PR is opened against a watched repo" },
  { key: "issueLabeled", label: "Issue labeled agent-ready", hint: "Runs when that label is applied" },
  { key: "scheduled", label: "Scheduled (nightly)", hint: "Runs once a day against the default branch" },
  { key: "manual", label: "Manual trigger only", hint: "Never runs automatically" },
] as const;

export default function NewAgentPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [model, setModel] = useState(`${MODELS[0].provider} — ${MODELS[0].name}`);
  const [scope, setScope] = useState("");
  const [budget, setBudget] = useState("500");
  const [triggers, setTriggers] = useState<Record<string, boolean>>({
    prOpen: true,
    issueLabeled: true,
    scheduled: false,
    manual: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(`${name || "New agent"} created`, {
      description: "It will appear in the Agent Fleet once demo data refreshes.",
    });
    router.push("/agents");
  };

  return (
    <Centered>
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="flex size-8 items-center justify-center rounded-md border border-border bg-surface text-brand-500">
            <Bot className="size-4" strokeWidth={1.75} />
          </div>
          <CardTitle className="mt-2">New Agent</CardTitle>
          <CardDescription>
            Configure a new agent&apos;s scope, triggers, and budget before it goes live.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="agent-name">Name</Label>
              <Input
                id="agent-name"
                placeholder="e.g. Changelog Agent"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="agent-model">Model / provider</Label>
              <Select value={model} onValueChange={(v) => v && setModel(v)}>
                <SelectTrigger id="agent-model" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MODELS.map((m) => (
                    <SelectItem key={m.name} value={`${m.provider} — ${m.name}`}>
                      {m.provider} — {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="agent-scope">Scope &amp; permission boundary</Label>
              <Textarea
                id="agent-scope"
                placeholder="e.g. Read/write across packages/**, no infra or auth paths"
                value={scope}
                onChange={(e) => setScope(e.target.value)}
                rows={3}
                required
              />
            </div>

            <div className="flex flex-col gap-2.5">
              <Label>Trigger conditions</Label>
              <div className="flex flex-col gap-3 rounded-md border border-border p-3">
                {TRIGGERS.map((t) => (
                  <div key={t.key} className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs text-ink-100">{t.label}</p>
                      <p className="text-2xs text-ink-500">{t.hint}</p>
                    </div>
                    <Switch
                      checked={triggers[t.key]}
                      onCheckedChange={(v) =>
                        setTriggers((prev) => ({ ...prev, [t.key]: v }))
                      }
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="agent-budget">Monthly budget cap</Label>
              <div className="relative">
                <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-xs text-ink-500">
                  $
                </span>
                <Input
                  id="agent-budget"
                  type="number"
                  min={0}
                  step={50}
                  className="pl-6"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                />
              </div>
            </div>

            <Button type="submit" className="mt-1 w-full">
              Create Agent
            </Button>
          </form>
        </CardContent>
      </Card>
    </Centered>
  );
}
