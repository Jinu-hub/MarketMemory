/**
 * ReportTranslationNotice
 *
 * Reading-layer callout shown on report detail screens when the reader's
 * requested-language report has not been generated yet, so the source-language
 * report is shown instead. Renders nothing when the requested-language report
 * is already available.
 */
import { LanguagesIcon } from "lucide-react";

import { cn } from "~/core/lib/utils";

import { formatItemReportsCopy, pickItemReportsUi } from "../i18n";
import type { ItemContentLocalization } from "../lib/item-content-localization";

function resolveLanguageName(
  names: Record<string, string>,
  code: string | null,
): string {
  if (!code) return "";
  return names[code] ?? code;
}

export function ReportTranslationNotice({
  localization,
  locale,
  className,
}: {
  localization: ItemContentLocalization;
  locale?: string | null;
  className?: string;
}) {
  if (!localization.isFallback) {
    return null;
  }

  const ui = pickItemReportsUi(locale);
  const names = ui.localization.languageNames as Record<string, string>;
  const requested = resolveLanguageName(names, localization.requestedLocale);
  const source = resolveLanguageName(names, localization.sourceLang);

  return (
    <div
      role="status"
      className={cn(
        "border-border bg-muted/50 text-muted-foreground flex items-start gap-3 rounded-xl border border-l-[3px] border-l-amber-500/70 px-4 py-3",
        className,
      )}
    >
      <LanguagesIcon
        className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400"
        aria-hidden
      />
      <div className="min-w-0 space-y-0.5">
        <p className="text-foreground text-sm font-medium">
          {formatItemReportsCopy(ui.localization.fallbackNoticeTitle, {
            language: requested,
          })}
        </p>
        <p className="text-xs leading-relaxed">
          {formatItemReportsCopy(ui.localization.fallbackNoticeDescription, {
            language: requested,
            source,
          })}
        </p>
      </div>
    </div>
  );
}
