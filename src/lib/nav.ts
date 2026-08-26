import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Boxes,
  Bot,
  FlaskConical,
  Database,
  Gauge,
  Server,
  ShieldAlert,
  Lightbulb,
  SlidersHorizontal,
  Settings,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  built: boolean;
}

export interface NavGroup {
  label: string;
  icon: LucideIcon;
  items: NavItem[];
}

export const NAV: NavGroup[] = [
  {
    label: "Overview",
    icon: LayoutDashboard,
    items: [
      { label: "Global Snapshot", href: "/overview", built: true },
      { label: "Live Activity Feed", href: "/overview/activity", built: true },
      { label: "Agent Activity Map", href: "/overview/agent-activity-map", built: true },
      { label: "Critical Alerts", href: "/overview/alerts", built: false },
      { label: "Executive Digest", href: "/overview/executive-digest", built: false },
      { label: "Regional Breakdown", href: "/overview/regional-breakdown", built: false },
    ],
  },
  {
    label: "Model Fleet",
    icon: Boxes,
    items: [
      { label: "All Models", href: "/models", built: true },
      { label: "Public vs Internal Availability", href: "/models/availability", built: true },
      { label: "Version Comparison", href: "/models/version-comparison", built: false },
      { label: "Deprecation Schedule", href: "/models/deprecation-schedule", built: false },
      { label: "Regional Rollout Status", href: "/models/regional-rollout", built: false },
      { label: "Model Changelog", href: "/models/changelog", built: false },
    ],
  },
  {
    label: "Engineering Agents",
    icon: Bot,
    items: [
      { label: "Active Tasks", href: "/agents/tasks", built: true },
      { label: "Code Agent Fleet", href: "/agents", built: true },
      { label: "Run History", href: "/agents/runs", built: true },
      { label: "Spec & Plan Review", href: "/agents/spec-review", built: true },
      { label: "Sandbox Playground", href: "/agents/sandbox", built: true },
      { label: "Feature Requests Queue", href: "/agents/feature-requests", built: false },
      { label: "Pull Requests / Diffs", href: "/agents/pull-requests", built: false },
    ],
  },
  {
    label: "Evaluation & Self-Assessment",
    icon: FlaskConical,
    items: [
      { label: "Self-Evaluation Loop", href: "/eval/self-evaluation", built: true },
      { label: "Eval Runs", href: "/eval/runs", built: true },
      { label: "Benchmark Suites", href: "/eval/benchmarks", built: false },
      { label: "Model Comparison & Lineage", href: "/eval/comparison", built: false },
      { label: "Regression Detection", href: "/eval/regression", built: false },
      { label: "Human Review Queue", href: "/eval/human-review", built: false },
      { label: "Eval Dataset Library", href: "/eval/datasets", built: false },
    ],
  },
  {
    label: "Training & Data",
    icon: Database,
    items: [
      { label: "Upload New Dataset", href: "/training/upload", built: true },
      { label: "Human Feedback Queue", href: "/training/feedback", built: true },
      { label: "Training Runs", href: "/training/runs", built: false },
      { label: "Dataset Library", href: "/training/datasets", built: false },
      { label: "Specs & Rules Library", href: "/training/specs", built: false },
      { label: "Fine-Tuning Jobs", href: "/training/fine-tuning", built: false },
      { label: "Checkpoint Management", href: "/training/checkpoints", built: false },
    ],
  },
  {
    label: "Optimization",
    icon: Gauge,
    items: [
      { label: "Impact Estimator", href: "/optimization/impact-estimator", built: true },
      { label: "Optimization Backlog", href: "/optimization/backlog", built: true },
      { label: "Cost Optimization", href: "/optimization/cost", built: true },
      { label: "Latency Optimization", href: "/optimization/latency", built: false },
      { label: "Compute Efficiency", href: "/optimization/compute-efficiency", built: false },
      { label: "Capability Expansion Requests", href: "/optimization/capability-requests", built: false },
      { label: "A/B Optimization Tests", href: "/optimization/ab-tests", built: false },
    ],
  },
  {
    label: "Infrastructure & Hardware",
    icon: Server,
    items: [
      { label: "Data Center Map", href: "/infrastructure/data-centers", built: true },
      { label: "Compute Cluster Health", href: "/infrastructure/cluster-health", built: true },
      { label: "GPU/TPU Utilization", href: "/infrastructure/gpu-utilization", built: false },
      { label: "Storage & RAM Usage", href: "/infrastructure/storage", built: false },
      { label: "Thermal & Power Monitoring", href: "/infrastructure/thermal-power", built: false },
      { label: "Network Bandwidth", href: "/infrastructure/network", built: false },
      { label: "Capacity Planning", href: "/infrastructure/capacity-planning", built: false },
    ],
  },
  {
    label: "Reliability & Incidents",
    icon: ShieldAlert,
    items: [
      { label: "Live Incidents", href: "/reliability/incidents", built: true },
      { label: "Uptime & SLA Tracking", href: "/reliability/uptime-sla", built: true },
      { label: "Status Page Management", href: "/reliability/status-page", built: true },
      { label: "Incident History & Postmortems", href: "/reliability/history", built: false },
      { label: "Load & Traffic Spikes", href: "/reliability/traffic-spikes", built: false },
      { label: "Auto-Scaling Rules", href: "/reliability/autoscaling", built: false },
      { label: "On-Call Schedule", href: "/reliability/on-call", built: false },
    ],
  },
  {
    label: "Insights & Recommendations",
    icon: Lightbulb,
    items: [
      { label: "AI-Generated Recommendations", href: "/insights/recommendations", built: true },
      { label: "Global Usage Patterns", href: "/insights/usage-patterns", built: true },
      { label: "User Feedback Signals", href: "/insights/feedback-signals", built: false },
      { label: "Regional Performance Gaps", href: "/insights/regional-gaps", built: false },
      { label: "Failure Pattern Analysis", href: "/insights/failure-patterns", built: false },
      { label: "Opportunity Backlog", href: "/insights/opportunity-backlog", built: false },
      { label: "Cross-Team Insights Digest", href: "/insights/cross-team-digest", built: false },
    ],
  },
  {
    label: "Platform Configuration",
    icon: SlidersHorizontal,
    items: [
      { label: "System Messages & Copy", href: "/config/messages", built: true },
      { label: "Internal Testing & Staging", href: "/config/staging", built: true },
      { label: "Audit Log", href: "/config/audit-log", built: true },
      { label: "Feature Flags", href: "/config/feature-flags", built: false },
      { label: "API & Rate Limit Rules", href: "/config/api-limits", built: false },
      { label: "Access & Permissions", href: "/config/access", built: false },
      { label: "Localization & Regional Rules", href: "/config/localization", built: false },
    ],
  },
];

export const SETTINGS_NAV: NavItem = { label: "Settings", href: "/settings", built: true };
export const SETTINGS_ICON: LucideIcon = Settings;
