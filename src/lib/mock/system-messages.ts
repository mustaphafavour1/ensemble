import { minutesAgo } from "./time";

export type MessageSurface = "API response" | "Web console" | "Status page" | "Email notification";

export interface SystemMessage {
  id: string;
  key: string;
  title: string;
  surface: MessageSurface;
  scope: string;
  body: string;
  previewVars: Record<string, string>;
  updatedAt: number;
  updatedBy: string;
}

export const SYSTEM_MESSAGES: SystemMessage[] = [
  {
    id: "msg-rate-limit",
    key: "rate_limit_exceeded",
    title: "Rate limit exceeded",
    surface: "API response",
    scope: "All models",
    body: "You've exceeded the rate limit for {model_name}. Please retry after {retry_after}, or contact support to request a higher limit.",
    previewVars: { model_name: "Solis Pro 4.1", retry_after: "30 seconds" },
    updatedAt: minutesAgo(60 * 24 * 12),
    updatedBy: "Priya Nair",
  },
  {
    id: "msg-model-unavailable",
    key: "model_temporarily_unavailable",
    title: "Model temporarily unavailable",
    surface: "API response",
    scope: "Solis Motion 1.2",
    body: "{model_name} is temporarily unavailable due to elevated demand. We're scaling capacity — please retry in a few minutes.",
    previewVars: { model_name: "Solis Motion 1.2" },
    updatedAt: minutesAgo(60 * 24 * 3),
    updatedBy: "Marcus Chen",
  },
  {
    id: "msg-scheduled-downtime",
    key: "scheduled_downtime_notice",
    title: "Scheduled downtime notice",
    surface: "Status page",
    scope: "All models",
    body: "Scheduled maintenance for {model_name} begins at {start_time} and is expected to last {duration}. No action is needed on your part.",
    previewVars: { model_name: "Solis Vision 1.5", start_time: "2:00 AM UTC", duration: "45 minutes" },
    updatedAt: minutesAgo(60 * 24 * 20),
    updatedBy: "Elena Ruiz",
  },
  {
    id: "msg-deprecation-warning",
    key: "deprecation_warning",
    title: "Deprecation warning",
    surface: "API response",
    scope: "Solis Pro 3.5",
    body: "{model_name} will be retired on {sunset_date}. Please migrate to {replacement_model} before then to avoid disruption.",
    previewVars: { model_name: "Solis Pro 3.5", sunset_date: "October 5, 2026", replacement_model: "Solis Pro 4.1" },
    updatedAt: minutesAgo(60 * 24 * 8),
    updatedBy: "Dara Osei",
  },
  {
    id: "msg-staged-access",
    key: "staged_access_notice",
    title: "Staged access notice",
    surface: "Web console",
    scope: "Staged models",
    body: "{model_name} is in staged testing and only available to internal testers. Expect rougher edges than production models.",
    previewVars: { model_name: "Solis Ultra 5.0" },
    updatedAt: minutesAgo(60 * 24 * 5),
    updatedBy: "Sam O'Connor",
  },
  {
    id: "msg-incident-banner",
    key: "active_incident_banner",
    title: "Active incident banner",
    surface: "Status page",
    scope: "All models",
    body: "We're aware of an issue affecting {affected_system} and are actively investigating. Follow this page for updates.",
    previewVars: { affected_system: "Solis Flash 4.1 in ap-southeast-1" },
    updatedAt: minutesAgo(60 * 6),
    updatedBy: "Jules Bergström",
  },
  {
    id: "msg-quota-warning",
    key: "quota_warning_email",
    title: "Usage quota warning",
    surface: "Email notification",
    scope: "All models",
    body: "Your organization has used {usage_pct}% of its monthly quota for {model_name}. Consider requesting a quota increase to avoid interruption.",
    previewVars: { usage_pct: "85", model_name: "Solis Code 2.0" },
    updatedAt: minutesAgo(60 * 24 * 30),
    updatedBy: "Aisha Rahman",
  },
];
