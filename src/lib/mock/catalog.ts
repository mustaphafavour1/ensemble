export interface Stack {
  language: string;
  framework: string;
  color: string;
}

export const STACKS: Record<string, Stack> = {
  "ts-next": { language: "TypeScript", framework: "Next.js", color: "#3B82F6" },
  "ts-express": { language: "TypeScript", framework: "Express", color: "#3B82F6" },
  "ts-rn": { language: "TypeScript", framework: "React Native", color: "#3B82F6" },
  "py-fastapi": { language: "Python", framework: "FastAPI", color: "#F5C518" },
  "py-django": { language: "Python", framework: "Django", color: "#F5C518" },
  "py-airflow": { language: "Python", framework: "Airflow", color: "#F5C518" },
  "go-gin": { language: "Go", framework: "Gin", color: "#22D3EE" },
  "go-temporal": { language: "Go", framework: "Temporal", color: "#22D3EE" },
  "rs-axum": { language: "Rust", framework: "Axum", color: "#F97316" },
  "rb-rails": { language: "Ruby", framework: "Rails", color: "#F43F5E" },
  "java-spring": { language: "Java", framework: "Spring Boot", color: "#FB923C" },
  "ex-phoenix": { language: "Elixir", framework: "Phoenix", color: "#A78BFA" },
  "hcl-terraform": { language: "HCL", framework: "Terraform", color: "#A78BFA" },
};

export interface Repo {
  id: string;
  name: string;
  stackId: keyof typeof STACKS;
  defaultBranch: string;
}

export const REPOS: Repo[] = [
  { id: "api-gateway", name: "api-gateway", stackId: "ts-express", defaultBranch: "main" },
  { id: "web-dashboard", name: "web-dashboard", stackId: "ts-next", defaultBranch: "main" },
  { id: "payments-service", name: "payments-service", stackId: "go-gin", defaultBranch: "main" },
  { id: "auth-service", name: "auth-service", stackId: "rs-axum", defaultBranch: "main" },
  { id: "ml-inference", name: "ml-inference", stackId: "py-fastapi", defaultBranch: "main" },
  { id: "mobile-app", name: "mobile-app", stackId: "ts-rn", defaultBranch: "develop" },
  { id: "data-pipeline", name: "data-pipeline", stackId: "py-airflow", defaultBranch: "main" },
  { id: "billing-worker", name: "billing-worker", stackId: "go-temporal", defaultBranch: "main" },
  { id: "design-system", name: "design-system", stackId: "ts-next", defaultBranch: "main" },
  { id: "growth-crm", name: "growth-crm", stackId: "rb-rails", defaultBranch: "main" },
];

export interface ModelDef {
  provider: string;
  name: string;
}

export const MODELS: ModelDef[] = [
  { provider: "Orbital AI", name: "Orbit-7" },
  { provider: "Cascade Labs", name: "Cascade XL" },
  { provider: "Meridian", name: "Meridian-2 Pro" },
  { provider: "Vantage", name: "Vantage-1 Turbo" },
  { provider: "Northwind", name: "Northwind Reasoning" },
];

export type AgentKind =
  | "Refactor"
  | "Test-Writer"
  | "Bug-Fix"
  | "Docs"
  | "Migration"
  | "Security"
  | "Performance"
  | "Dependency";

export interface AgentDef {
  id: string;
  name: string;
  kind: AgentKind;
  model: ModelDef;
  scope: string;
  createdDaysAgo: number;
}

export const AGENTS: AgentDef[] = [
  {
    id: "agent-refactor",
    name: "Refactor Agent",
    kind: "Refactor",
    model: MODELS[0],
    scope: "Read/write across packages/**, no infra or auth paths",
    createdDaysAgo: 182,
  },
  {
    id: "agent-testwriter",
    name: "Test-Writer Agent",
    kind: "Test-Writer",
    model: MODELS[1],
    scope: "Write access to **/*.test.* and **/*.spec.* only",
    createdDaysAgo: 165,
  },
  {
    id: "agent-bugfix",
    name: "Bug-Fix Agent",
    kind: "Bug-Fix",
    model: MODELS[0],
    scope: "Triggered from linked issues, scoped to the failing module",
    createdDaysAgo: 210,
  },
  {
    id: "agent-docs",
    name: "Docs Agent",
    kind: "Docs",
    model: MODELS[3],
    scope: "Write access to docs/**, README*, no source changes",
    createdDaysAgo: 96,
  },
  {
    id: "agent-migration",
    name: "Migration Agent",
    kind: "Migration",
    model: MODELS[2],
    scope: "Schema + codemod access, requires approval over 200 files",
    createdDaysAgo: 140,
  },
  {
    id: "agent-security",
    name: "Security Audit Agent",
    kind: "Security",
    model: MODELS[2],
    scope: "Read-only across all repos, write access to security/**",
    createdDaysAgo: 121,
  },
  {
    id: "agent-perf",
    name: "Perf Agent",
    kind: "Performance",
    model: MODELS[1],
    scope: "Read/write in hot-path modules flagged by profiling",
    createdDaysAgo: 77,
  },
  {
    id: "agent-dependency",
    name: "Dependency Agent",
    kind: "Dependency",
    model: MODELS[4],
    scope: "Write access to lockfiles + manifests, auto-merge below minor",
    createdDaysAgo: 58,
  },
];

export interface StackTemplateDef {
  id: string;
  stackId: keyof typeof STACKS;
  tagline: string;
  usageCount: number;
}

export const STACK_TEMPLATES: StackTemplateDef[] = [
  { id: "tpl-py-fastapi", stackId: "py-fastapi", tagline: "Async API service with typed routes and Pydantic models", usageCount: 214 },
  { id: "tpl-rs-axum", stackId: "rs-axum", tagline: "High-throughput service on Tokio, tower middleware included", usageCount: 96 },
  { id: "tpl-go-gin", stackId: "go-gin", tagline: "Lightweight HTTP service with structured logging wired in", usageCount: 158 },
  { id: "tpl-ts-next", stackId: "ts-next", tagline: "App Router frontend with the org's design system pre-linked", usageCount: 341 },
  { id: "tpl-ts-express", stackId: "ts-express", tagline: "Minimal REST service, ready for agent-driven endpoint work", usageCount: 122 },
  { id: "tpl-py-django", stackId: "py-django", tagline: "Batteries-included admin + ORM for internal tooling", usageCount: 88 },
  { id: "tpl-go-temporal", stackId: "go-temporal", tagline: "Durable workflow worker scaffold with retries pre-configured", usageCount: 41 },
  { id: "tpl-rb-rails", stackId: "rb-rails", tagline: "Convention-driven monolith starter with RSpec wired up", usageCount: 63 },
  { id: "tpl-java-spring", stackId: "java-spring", tagline: "Spring Boot service with Gradle and Testcontainers preset", usageCount: 54 },
  { id: "tpl-ex-phoenix", stackId: "ex-phoenix", tagline: "LiveView-ready service on the BEAM for realtime features", usageCount: 27 },
  { id: "tpl-ts-rn", stackId: "ts-rn", tagline: "Cross-platform mobile shell with Expo and typed navigation", usageCount: 45 },
  { id: "tpl-hcl-terraform", stackId: "hcl-terraform", tagline: "Environment-as-code baseline for agent-provisioned infra", usageCount: 72 },
];
