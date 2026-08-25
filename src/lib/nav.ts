import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Bot,
  Rocket,
  ShieldCheck,
  LineChart,
  Building2,
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
  href?: string;
  items: NavItem[];
}

export const NAV: NavGroup[] = [
  {
    label: "Overview",
    icon: LayoutDashboard,
    href: "/overview",
    items: [],
  },
  {
    label: "Agents",
    icon: Bot,
    items: [
      { label: "Agent Fleet", href: "/agents", built: true },
      { label: "Spec & Plan Review", href: "/agents/spec-review", built: true },
      { label: "New Agent", href: "/agents/new", built: true },
    ],
  },
  {
    label: "Delivery",
    icon: Rocket,
    items: [
      { label: "Runs", href: "/runs", built: true },
      { label: "Deployments", href: "/deployments", built: true },
      { label: "Environments", href: "/environments", built: true },
      { label: "Stack Templates", href: "/stack-templates", built: true },
      { label: "New Environment", href: "/environments/new", built: true },
    ],
  },
  {
    label: "Trust",
    icon: ShieldCheck,
    items: [{ label: "Provenance & Trust", href: "/trust", built: true }],
  },
  {
    label: "Insights",
    icon: LineChart,
    items: [{ label: "Analytics", href: "/analytics", built: true }],
  },
  {
    label: "Administration",
    icon: Building2,
    items: [
      { label: "Policies", href: "/admin/policies", built: false },
      { label: "Integrations", href: "/admin/integrations", built: false },
      { label: "Billing", href: "/admin/billing", built: false },
    ],
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/settings",
    items: [],
  },
];
