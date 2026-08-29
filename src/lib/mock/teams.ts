import { Rng } from "./rng";
import { REVIEWERS } from "./people";
import { AGENTS, REPOS, STACKS } from "./catalog";
import { RUNS } from "./runs";
import { daysAgo, minutesAgo } from "./time";

export type TeamId = "platform" | "ml-infra" | "growth" | "payments" | "mobile" | "data-eng";

export interface Team {
  id: TeamId;
  name: string;
  focus: string;
}

export const TEAMS: Team[] = [
  { id: "platform", name: "Platform Engineering", focus: "Core services, API gateway, and internal tooling" },
  { id: "ml-infra", name: "ML Infrastructure", focus: "Model serving, training pipelines, and inference" },
  { id: "growth", name: "Growth Engineering", focus: "Onboarding, CRM, and activation experiments" },
  { id: "payments", name: "Payments & Billing", focus: "Billing worker, checkout, and invoicing" },
  { id: "mobile", name: "Mobile", focus: "Native and React Native applications" },
  { id: "data-eng", name: "Data Engineering", focus: "Pipelines, analytics, and the warehouse" },
];

/** Maps each repo to the internal team that owns it. */
export const REPO_TEAM: Record<string, TeamId> = {
  "api-gateway": "platform",
  "web-dashboard": "growth",
  "payments-service": "payments",
  "auth-service": "platform",
  "ml-inference": "ml-infra",
  "mobile-app": "mobile",
  "data-pipeline": "data-eng",
  "billing-worker": "payments",
  "design-system": "growth",
  "growth-crm": "growth",
  "core-inference": "ml-infra",
  "model-serving": "ml-infra",
  "training-pipeline": "ml-infra",
  "eval-harness": "ml-infra",
  "billing-service": "payments",
  "admin-console": "platform",
  "docs-site": "platform",
  "search-service": "platform",
  "notification-service": "growth",
  "analytics-pipeline": "data-eng",
  "feature-flags-service": "platform",
  "recommendation-engine": "data-eng",
  "cdn-edge": "platform",
  "identity-service": "platform",
  "observability-stack": "platform",
};

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  teamId: TeamId;
  isCoreTeam: boolean;
  responsibilities: string;
  joinedAt: number;
}

const MEMBER_SEEDS: { name: string; role: string; teamId: TeamId; core: boolean; responsibilities: string }[] = [
  { name: "Priya Nair", role: "Engineering Manager", teamId: "platform", core: true, responsibilities: "Owns platform roadmap and agent-review policy for core services" },
  { name: "Marcus Chen", role: "Staff Engineer", teamId: "platform", core: true, responsibilities: "API gateway architecture and auth service reliability" },
  { name: "Sam O'Connor", role: "Senior Engineer", teamId: "platform", core: false, responsibilities: "Feature flags service and internal tooling" },
  { name: "Hana Kobayashi", role: "Engineer", teamId: "platform", core: false, responsibilities: "Observability stack and on-call rotation" },
  { name: "Elena Ruiz", role: "Tech Lead", teamId: "ml-infra", core: true, responsibilities: "Model serving infrastructure and inference latency budget" },
  { name: "Dara Osei", role: "Staff Engineer", teamId: "ml-infra", core: true, responsibilities: "Training pipeline orchestration and eval harness" },
  { name: "Noah Kim", role: "Senior Engineer", teamId: "ml-infra", core: false, responsibilities: "Core inference service scaling" },
  { name: "Camila Souza", role: "Engineering Manager", teamId: "growth", core: true, responsibilities: "Growth CRM roadmap and design-system adoption" },
  { name: "Liam O'Sullivan", role: "Senior Engineer", teamId: "growth", core: false, responsibilities: "Onboarding flows and notification service" },
  { name: "Aisha Rahman", role: "Engineering Manager", teamId: "payments", core: true, responsibilities: "Billing worker and checkout reliability" },
  { name: "Diego Fernández", role: "Senior Engineer", teamId: "payments", core: false, responsibilities: "Invoicing and billing service integrations" },
  { name: "Yuki Tanaka", role: "Tech Lead", teamId: "mobile", core: true, responsibilities: "Mobile app release process and native modules" },
  { name: "Zara Ahmed", role: "Engineer", teamId: "mobile", core: false, responsibilities: "React Native shared component work" },
  { name: "Ingrid Larsen", role: "Engineering Manager", teamId: "data-eng", core: true, responsibilities: "Data pipeline SLAs and analytics pipeline ownership" },
  { name: "Tariq Hassan", role: "Senior Engineer", teamId: "data-eng", core: false, responsibilities: "Recommendation engine data feeds" },
  { name: "Owen Whitfield", role: "Engineer", teamId: "data-eng", core: false, responsibilities: "Warehouse ingestion and CDN edge caching" },
];

function generateMembers(): TeamMember[] {
  const rng = new Rng(6142);
  return MEMBER_SEEDS.map((seed, i) => ({
    id: `member-${i}`,
    name: seed.name,
    role: seed.role,
    teamId: seed.teamId,
    isCoreTeam: seed.core,
    responsibilities: seed.responsibilities,
    joinedAt: daysAgo(rng.int(30, 900)),
  }));
}

export const TEAM_MEMBERS: TeamMember[] = generateMembers();

export function getTeamById(id: TeamId): Team {
  return TEAMS.find((t) => t.id === id)!;
}

export function getTeamForRepo(repoId: string): Team | null {
  const teamId = REPO_TEAM[repoId];
  return teamId ? getTeamById(teamId) : null;
}

export interface TeamUsage {
  team: Team;
  memberCount: number;
  requests30d: number;
  costUsd30d: number;
  topAgent: string;
  topLanguage: string;
  trendPct: number;
}

/** Rolls run-level activity up to the team that owns each run's repo. */
export function getTeamUsage(): TeamUsage[] {
  const since = daysAgo(30);
  const priorStart = daysAgo(60);

  return TEAMS.map((team) => {
    const teamRepoIds = new Set(REPOS.filter((r) => REPO_TEAM[r.id] === team.id).map((r) => r.id));
    const recentRuns = RUNS.filter((r) => teamRepoIds.has(r.repoId) && r.startedAt >= since);
    const priorRuns = RUNS.filter((r) => teamRepoIds.has(r.repoId) && r.startedAt >= priorStart && r.startedAt < since);

    const agentCounts = new Map<string, number>();
    for (const r of recentRuns) agentCounts.set(r.agentId, (agentCounts.get(r.agentId) ?? 0) + 1);
    const topAgentId = [...agentCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
    const topAgent = topAgentId ? (AGENTS.find((a) => a.id === topAgentId)?.name ?? "—") : "—";

    const langCounts = new Map<string, number>();
    for (const r of recentRuns) {
      const repo = REPOS.find((rp) => rp.id === r.repoId)!;
      const lang = STACKS[repo.stackId].language;
      langCounts.set(lang, (langCounts.get(lang) ?? 0) + 1);
    }
    const topLanguage = [...langCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

    const costUsd30d = Math.round(recentRuns.reduce((s, r) => s + r.costUsd, 0) * 100) / 100;
    const trendPct = priorRuns.length > 0
      ? Math.round(((recentRuns.length - priorRuns.length) / priorRuns.length) * 1000) / 10
      : 0;

    return {
      team,
      memberCount: TEAM_MEMBERS.filter((m) => m.teamId === team.id).length,
      requests30d: recentRuns.length,
      costUsd30d,
      topAgent,
      topLanguage,
      trendPct,
    };
  }).sort((a, b) => b.requests30d - a.requests30d);
}

export type TeamRecCategory = "Adoption" | "Efficiency" | "Training" | "Risk";
export type TeamRecStatus = "new" | "acknowledged" | "actioned";

export interface TeamRecommendation {
  id: string;
  teamId: TeamId;
  title: string;
  description: string;
  category: TeamRecCategory;
  confidencePct: number;
  status: TeamRecStatus;
  generatedAt: number;
}

const TEAM_REC_SEEDS: { teamId: TeamId; title: string; description: string; category: TeamRecCategory }[] = [
  { teamId: "mobile", title: "Mobile is underusing the Test-Writer agent", description: "Only 8% of mobile runs use Test-Writer, versus a 24% org average — backfilling coverage here would cut manual QA time.", category: "Adoption" },
  { teamId: "payments", title: "Payments has the highest agent-run success rate", description: "96% of Payments & Billing runs merge cleanly on the first pass — worth documenting their review checklist as a template for other teams.", category: "Efficiency" },
  { teamId: "growth", title: "Growth Engineering's average run cost is trending up", description: "Cost per run has risen 18% over the last month, concentrated in the growth-crm repo — likely larger, less-scoped tasks.", category: "Risk" },
  { teamId: "data-eng", title: "Data Engineering would benefit from the Schema-Migration agent", description: "The team hand-writes most migration scripts today; three other teams already lean on Schema-Migration for the same work.", category: "Adoption" },
  { teamId: "ml-infra", title: "ML Infrastructure ships the most agent-authored code", description: "62% of merged changes in ML Infrastructure repos were agent-authored this month, the highest share org-wide.", category: "Efficiency" },
  { teamId: "platform", title: "Platform Engineering's review queue is the fastest in the org", description: "Median time from run completion to merge is 40 minutes, less than half the org median — a good onboarding reference.", category: "Efficiency" },
  { teamId: "growth", title: "New engineers on Growth haven't completed agent onboarding", description: "Two recent hires have zero agent-run history after three weeks — worth checking whether onboarding docs surfaced the sandbox.", category: "Training" },
  { teamId: "payments", title: "Payments & Billing has no Security agent runs this quarter", description: "Given the repo's compliance surface, a scheduled Security agent audit pass may be worth adding to the backlog.", category: "Risk" },
];

function generateTeamRecommendations(): TeamRecommendation[] {
  const rng = new Rng(7734);
  return TEAM_REC_SEEDS.map((seed, i) => ({
    id: `trec-${i}`,
    ...seed,
    confidencePct: rng.int(68, 97),
    status: rng.pickWeighted<TeamRecStatus>([["new", 45], ["acknowledged", 30], ["actioned", 25]]),
    generatedAt: minutesAgo(rng.int(60, 60 * 24 * 12)),
  })).sort((a, b) => b.generatedAt - a.generatedAt);
}

export const TEAM_RECOMMENDATIONS: TeamRecommendation[] = generateTeamRecommendations();

const NEW_MEMBER_TITLES = ["Engineer", "Senior Engineer", "Staff Engineer", "Tech Lead"] as const;
export const NEW_MEMBER_ROLE_OPTIONS = NEW_MEMBER_TITLES;
export { REVIEWERS as TEAM_MEMBER_NAME_POOL };
