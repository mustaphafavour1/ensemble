"use client";

import { useState } from "react";
import { toast } from "sonner";
import { UserPlus, Users } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { TableCount } from "@/components/table-count";
import { EmptyState } from "@/components/empty-state";
import { StatusBadge } from "@/components/status-badge";
import { DataTable, type DataTableColumn } from "@/components/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppStore } from "@/lib/store";
import { TEAM_MEMBERS, TEAMS, NEW_MEMBER_ROLE_OPTIONS, type TeamMember, type TeamId } from "@/lib/mock/teams";
import { formatDate } from "@/lib/mock/time";

export default function TeamMembersPage() {
  const seeded = useAppStore((s) => s.seeded);
  const [members, setMembers] = useState<TeamMember[]>(TEAM_MEMBERS);

  const [name, setName] = useState("");
  const [role, setRole] = useState<string>(NEW_MEMBER_ROLE_OPTIONS[0]);
  const [teamId, setTeamId] = useState<TeamId>(TEAMS[0].id);
  const [responsibilities, setResponsibilities] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    const team = TEAMS.find((t) => t.id === teamId)!;
    const member: TeamMember = {
      id: `member-new-${members.length}`,
      name: name.trim(),
      role,
      teamId,
      isCoreTeam: false,
      responsibilities: responsibilities.trim() || "Newly added — responsibilities pending assignment",
      joinedAt: Date.now(),
    };
    setMembers((prev) => [member, ...prev]);
    toast.success(`${member.name} added to ${team.name}`, {
      description: `Listed as ${role} — update their core-team status once assignments are confirmed.`,
    });
    setName("");
    setResponsibilities("");
  }

  const columns: DataTableColumn<TeamMember>[] = [
    {
      key: "name",
      label: "Name",
      render: (m) => (
        <div>
          <p className="text-[13px] text-ink-em">{m.name}</p>
          <p className="mt-0.5 text-2xs text-ink-faint">{m.role}</p>
        </div>
      ),
    },
    {
      key: "team",
      label: "Team",
      className: "text-xs text-ink-muted",
      render: (m) => TEAMS.find((t) => t.id === m.teamId)!.name,
    },
    {
      key: "core",
      label: "Core team",
      render: (m) =>
        m.isCoreTeam ? (
          <StatusBadge tone="brand" label="Core" />
        ) : (
          <span className="text-2xs text-ink-faint">—</span>
        ),
    },
    {
      key: "responsibilities",
      label: "Responsibilities",
      className: "max-w-sm text-xs text-ink-muted",
      render: (m) => <p className="truncate">{m.responsibilities}</p>,
    },
    {
      key: "joined",
      label: "Joined",
      align: "right",
      className: "text-right text-2xs text-ink-faint tabular-nums",
      render: (m) => formatDate(m.joinedAt),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Team Members"
        description="Everyone across the org's internal teams — core membership, responsibilities, and when they joined."
      />

      {!seeded ? (
        <EmptyState
          icon={Users}
          title="No members yet"
          description="Turn on demo data in Settings to see the team roster."
        />
      ) : (
        <>
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center gap-2">
                <UserPlus className="size-3.5 text-ink-faint" />
                <CardTitle>Add a member</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
                <div className="flex min-w-[200px] flex-1 flex-col gap-1.5">
                  <Label htmlFor="member-name">Name</Label>
                  <Input
                    id="member-name"
                    placeholder="e.g. Jordan Lee"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="flex w-44 flex-col gap-1.5">
                  <Label htmlFor="member-role">Role</Label>
                  <Select value={role} onValueChange={(v) => v && setRole(v)}>
                    <SelectTrigger id="member-role" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {NEW_MEMBER_ROLE_OPTIONS.map((r) => (
                        <SelectItem key={r} value={r}>
                          {r}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex w-56 flex-col gap-1.5">
                  <Label htmlFor="member-team">Team</Label>
                  <Select value={teamId} onValueChange={(v) => v && setTeamId(v as TeamId)}>
                    <SelectTrigger id="member-team" className="w-full">
                      <SelectValue>{(v: string) => TEAMS.find((t) => t.id === v)?.name ?? v}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {TEAMS.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex min-w-[220px] flex-1 flex-col gap-1.5">
                  <Label htmlFor="member-resp">Responsibilities</Label>
                  <Input
                    id="member-resp"
                    placeholder="What will they own?"
                    value={responsibilities}
                    onChange={(e) => setResponsibilities(e.target.value)}
                  />
                </div>
                <Button type="submit">
                  <UserPlus className="size-3.5" />
                  Add member
                </Button>
              </form>
            </CardContent>
          </Card>

          <TableCount count={members.length} label="members" />
          <DataTable columns={columns} data={members} getRowKey={(m) => m.id} />
        </>
      )}
    </div>
  );
}
