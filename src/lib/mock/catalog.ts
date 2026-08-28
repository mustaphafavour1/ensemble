export interface Stack {
  language: string;
  framework: string;
  color: string;
}

// Colors for the five languages that actually appear in run/repo data are
// validated for dark-mode lightness + CVD-safe adjacency (see
// scripts/validate_palette.js in the dataviz skill) in this fixed order:
// TypeScript, Python, Go, Rust, Ruby. Java/Elixir/HCL only ever appear as a
// single badge dot on a Stack Template card, never in the same chart as one
// another, so they're chosen for reasonable contrast rather than validated.
export const STACKS: Record<string, Stack> = {
  "ts-next": { language: "TypeScript", framework: "Next.js", color: "#3B82F6" },
  "ts-express": { language: "TypeScript", framework: "Express", color: "#3B82F6" },
  "ts-rn": { language: "TypeScript", framework: "React Native", color: "#3B82F6" },
  "py-fastapi": { language: "Python", framework: "FastAPI", color: "#B8890A" },
  "py-django": { language: "Python", framework: "Django", color: "#B8890A" },
  "py-airflow": { language: "Python", framework: "Airflow", color: "#B8890A" },
  "go-gin": { language: "Go", framework: "Gin", color: "#0E90A8" },
  "go-temporal": { language: "Go", framework: "Temporal", color: "#0E90A8" },
  "rs-axum": { language: "Rust", framework: "Axum", color: "#9A4A0F" },
  "rb-rails": { language: "Ruby", framework: "Rails", color: "#E23670" },
  "java-spring": { language: "Java", framework: "Spring Boot", color: "#D97706" },
  "ex-phoenix": { language: "Elixir", framework: "Phoenix", color: "#7E57C2" },
  "hcl-terraform": { language: "HCL", framework: "Terraform", color: "#7B42BC" },
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
  { id: "core-inference", name: "core-inference", stackId: "py-fastapi", defaultBranch: "main" },
  { id: "model-serving", name: "model-serving", stackId: "go-gin", defaultBranch: "main" },
  { id: "training-pipeline", name: "training-pipeline", stackId: "py-airflow", defaultBranch: "main" },
  { id: "eval-harness", name: "eval-harness", stackId: "py-fastapi", defaultBranch: "main" },
  { id: "billing-service", name: "billing-service", stackId: "go-temporal", defaultBranch: "main" },
  { id: "admin-console", name: "admin-console", stackId: "ts-next", defaultBranch: "main" },
  { id: "docs-site", name: "docs-site", stackId: "ts-next", defaultBranch: "main" },
  { id: "search-service", name: "search-service", stackId: "rs-axum", defaultBranch: "main" },
  { id: "notification-service", name: "notification-service", stackId: "go-gin", defaultBranch: "main" },
  { id: "analytics-pipeline", name: "analytics-pipeline", stackId: "py-airflow", defaultBranch: "main" },
  { id: "feature-flags-service", name: "feature-flags-service", stackId: "go-gin", defaultBranch: "main" },
  { id: "recommendation-engine", name: "recommendation-engine", stackId: "py-fastapi", defaultBranch: "main" },
  { id: "cdn-edge", name: "cdn-edge", stackId: "rs-axum", defaultBranch: "main" },
  { id: "identity-service", name: "identity-service", stackId: "rs-axum", defaultBranch: "main" },
  { id: "observability-stack", name: "observability-stack", stackId: "go-temporal", defaultBranch: "main" },
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
  | "Dependency"
  | "Schema-Migration"
  | "I18n"
  | "Accessibility"
  | "Changelog"
  | "Release-Notes"
  | "Lint-Fix"
  | "Eval-Harness";

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
  {
    id: "agent-schema-migration",
    name: "Schema-Migration Agent",
    kind: "Schema-Migration",
    model: MODELS[2],
    scope: "Write access to migrations/** and schema files, approval required for destructive changes",
    createdDaysAgo: 88,
  },
  {
    id: "agent-i18n",
    name: "i18n Agent",
    kind: "I18n",
    model: MODELS[3],
    scope: "Write access to locales/** and translation keys, no source logic changes",
    createdDaysAgo: 70,
  },
  {
    id: "agent-accessibility",
    name: "Accessibility Agent",
    kind: "Accessibility",
    model: MODELS[1],
    scope: "Read/write across component markup for ARIA and contrast fixes, no logic changes",
    createdDaysAgo: 63,
  },
  {
    id: "agent-changelog",
    name: "Changelog Agent",
    kind: "Changelog",
    model: MODELS[3],
    scope: "Write access to CHANGELOG.md and release notes only",
    createdDaysAgo: 112,
  },
  {
    id: "agent-release-notes",
    name: "Release-Notes Agent",
    kind: "Release-Notes",
    model: MODELS[3],
    scope: "Write access to docs/releases/** only, summarizes merged PRs since the last tag",
    createdDaysAgo: 45,
  },
  {
    id: "agent-lint-fix",
    name: "Lint-Fix Agent",
    kind: "Lint-Fix",
    model: MODELS[1],
    scope: "Auto-fixes lint and formatting violations, auto-merges below a small diff size",
    createdDaysAgo: 134,
  },
  {
    id: "agent-eval-harness",
    name: "Eval-Harness Agent",
    kind: "Eval-Harness",
    model: MODELS[2],
    scope: "Write access to eval/** suites and benchmark configs, no production code paths",
    createdDaysAgo: 99,
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
