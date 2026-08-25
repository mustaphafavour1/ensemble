export type RoleId =
  | "product-admin"
  | "lead-developer"
  | "super-admin"
  | "product-developer";

export interface RoleDef {
  id: RoleId;
  name: string;
  description: string;
  built: boolean;
}

export const ROLES: RoleDef[] = [
  {
    id: "product-admin",
    name: "Product Admin",
    description: "Org-wide cost, teams, policy, and cross-project reporting.",
    built: true,
  },
  {
    id: "lead-developer",
    name: "Lead Developer",
    description: "Configures agents, environments, pipelines, and spec review.",
    built: true,
  },
  {
    id: "super-admin",
    name: "Super Admin",
    description: "Full platform control across every organization.",
    built: false,
  },
  {
    id: "product-developer",
    name: "Product Developer",
    description: "Individual contributor scoped to their own runs.",
    built: false,
  },
];

export function roleName(id: RoleId): string {
  return ROLES.find((r) => r.id === id)?.name ?? id;
}
