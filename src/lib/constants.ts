export const DASHBOARD_ROLES = [
  "PRESIDENT",
  "VICE_PRESIDENT",
  "FINANCE",
  "SOCIAL",
  "OUTREACH",
  "ADVISOR",
  "LOGISTICS",
] as const;

export type DashboardRole = (typeof DASHBOARD_ROLES)[number];

export function formatRole(role: string): string {
  return role
    .split("_")
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(" ");
}
