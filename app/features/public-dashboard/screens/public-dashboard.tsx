import i18next from "~/core/lib/i18next.server";
import { parseMarketDateParam } from "~/features/dashboard/lib/dates";

import type { Route } from "./+types/public-dashboard";
import { getPublicDashboardData } from "../queries.server";

export async function loader({ request }: Route.LoaderArgs) {
  const locale = await i18next.getLocale(request);

  const url = new URL(request.url);
  const requestedDate = parseMarketDateParam(url.searchParams.get("date"));

  // Service-role read, final-only — mirrors the private dashboard dataset
  // (minus admin-only fields) for logged-out visitors.
  const { memory, sourceReports, summaryPost, recentReports, availableDates } =
    await getPublicDashboardData({ locale, marketDate: requestedDate });

  return {
    memory,
    sourceReports,
    summaryPost,
    recentReports,
    availableDates,
    locale,
  };
}

export default function PublicDashboard() {
  return <div>sample</div>;
}
