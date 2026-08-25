"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Boxes } from "lucide-react";
import { Centered } from "@/components/centered";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { STACK_TEMPLATES, STACKS, REPOS } from "@/lib/mock/catalog";

const REGIONS = ["us-east-1", "us-west-2", "eu-west-1", "ap-southeast-1"];
const SIZES = [
  { value: "small", label: "Small — 0.5 vCPU / 1 GB" },
  { value: "medium", label: "Medium — 1 vCPU / 2 GB" },
  { value: "large", label: "Large — 2 vCPU / 4 GB" },
];

export default function NewEnvironmentPage() {
  const router = useRouter();
  const [template, setTemplate] = useState(STACK_TEMPLATES[0].id);
  const [region, setRegion] = useState(REGIONS[0]);
  const [size, setSize] = useState(SIZES[1].value);
  const [repo, setRepo] = useState(REPOS[0].id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const repoName = REPOS.find((r) => r.id === repo)?.name;
    toast.success(`Environment queued for ${repoName}`, {
      description: "It will appear in Environments once provisioning starts.",
    });
    router.push("/environments");
  };

  return (
    <Centered>
      <Card className="w-full max-w-sm">
        <CardHeader>
          <div className="flex size-8 items-center justify-center rounded-md border border-border bg-surface text-brand-500">
            <Boxes className="size-4" strokeWidth={1.75} />
          </div>
          <CardTitle className="mt-2">New Environment</CardTitle>
          <CardDescription>Spin up an environment from a template.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="env-template">Stack template</Label>
              <Select value={template} onValueChange={(v) => v && setTemplate(v)}>
                <SelectTrigger id="env-template" className="w-full">
                  <SelectValue>
                    {(v: string) => {
                      const tpl = STACK_TEMPLATES.find((t) => t.id === v);
                      if (!tpl) return v;
                      const stack = STACKS[tpl.stackId];
                      return `${stack.language} · ${stack.framework}`;
                    }}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {STACK_TEMPLATES.map((tpl) => {
                    const stack = STACKS[tpl.stackId];
                    return (
                      <SelectItem key={tpl.id} value={tpl.id}>
                        {stack.language} · {stack.framework}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="env-region">Region</Label>
              <Select value={region} onValueChange={(v) => v && setRegion(v)}>
                <SelectTrigger id="env-region" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REGIONS.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="env-size">Resource limits</Label>
              <Select value={size} onValueChange={(v) => v && setSize(v)}>
                <SelectTrigger id="env-size" className="w-full">
                  <SelectValue>
                    {(v: string) => SIZES.find((s) => s.value === v)?.label ?? v}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {SIZES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="env-repo">Linked repo</Label>
              <Select value={repo} onValueChange={(v) => v && setRepo(v)}>
                <SelectTrigger id="env-repo" className="w-full">
                  <SelectValue>
                    {(v: string) => REPOS.find((r) => r.id === v)?.name ?? v}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {REPOS.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="mt-1 w-full">
              Create Environment
            </Button>
          </form>
        </CardContent>
      </Card>
    </Centered>
  );
}
