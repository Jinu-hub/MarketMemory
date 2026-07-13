/**
 * Public dashboard URL builders.
 */
const PUBLIC_DASHBOARD_BASE = "/public-dashboard";

export function publicDashboardHref(): string {
  return PUBLIC_DASHBOARD_BASE;
}

/** `/public-dashboard/reports/:id` — anonymous preview of allowlisted reports. */
export function publicDashboardReportHref(id: string): string {
  return `${PUBLIC_DASHBOARD_BASE}/reports/${id}`;
}
