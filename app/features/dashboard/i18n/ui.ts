import { DASHBOARD_MESSAGES, type DashboardUiMessages } from "./messages";
import { resolveDashboardLocale } from "./resolve";

/** Resolved UI copy tree for the current locale. */
export function pickDashboardUi(
  locale?: string | null,
): DashboardUiMessages {
  const lang = resolveDashboardLocale(locale);
  return DASHBOARD_MESSAGES.ui[lang];
}
