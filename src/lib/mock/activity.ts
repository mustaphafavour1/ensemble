import { AGENTS, REPOS } from "./catalog";
import { PROVENANCE, ProvenanceEvent } from "./trust";

export interface ActivityItem {
  id: string;
  timestamp: number;
  type: ProvenanceEvent["type"];
  message: string;
  agentId: string;
  agentName: string;
  repoName: string;
  commitSha: string | null;
  reviewer: string | null;
  confidencePct: number | null;
  environment: string | null;
}

export function messageFor(event: ProvenanceEvent): string {
  const agent = AGENTS.find((a) => a.id === event.agentId)!;
  const repo = REPOS.find((r) => r.id === event.repoId)!;
  switch (event.type) {
    case "commit":
      return `${agent.name} committed ${event.commitSha} to ${repo.name} — ${event.confidencePct}% confidence`;
    case "approval":
      return `${event.reviewer} approved ${agent.name}'s change in ${repo.name}`;
    case "review":
      return `${event.reviewer} requested changes on ${agent.name}'s work in ${repo.name}`;
    case "deploy":
      return `${agent.name}'s change shipped to ${event.environment} for ${repo.name}`;
  }
}

export function getActivityFeed(limit = 12): ActivityItem[] {
  return PROVENANCE.slice(0, limit).map((event) => {
    const repo = REPOS.find((r) => r.id === event.repoId)!;
    return {
      id: event.id,
      timestamp: event.timestamp,
      type: event.type,
      message: messageFor(event),
      agentId: event.agentId,
      agentName: AGENTS.find((a) => a.id === event.agentId)!.name,
      repoName: repo.name,
      commitSha: event.commitSha,
      reviewer: event.reviewer,
      confidencePct: event.confidencePct,
      environment: event.environment,
    };
  });
}
