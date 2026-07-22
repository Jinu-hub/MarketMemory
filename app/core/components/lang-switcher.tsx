/**
 * Language Switcher Component
 *
 * A dropdown menu component that allows users to switch between different application languages.
 * This component provides internationalization (i18n) support throughout the application.
 *
 * Features:
 * - Neutral languages trigger that matches other nav icon controls
 * - Dropdown menu with language options
 * - Integration with i18next for language switching
 * - Server-side persistence of language preference
 * - Support for multiple languages (English, Korean, Japanese)
 * - Translated language names in the current language
 */
import { GlobeIcon, LanguagesIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useFetcher } from "react-router";

import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

/**
 * LangSwitcher component for changing the application language
 *
 * This component uses i18next and React Router to handle language switching.
 * The trigger always shows a languages icon so it stays visually consistent with
 * neighboring nav controls (e.g. theme toggle). Locale-specific markers live
 * in the dropdown only.
 *
 * When a language is selected, it:
 * 1. Changes the language in the i18n context (client-side)
 * 2. Persists the language preference on the server via an API call
 *
 * @returns A dropdown menu component for switching languages
 */
export default function LangSwitcher() {
  const { t, i18n } = useTranslation();
  const fetcher = useFetcher();

  /**
   * Handle language change by updating both client and server state
   * @param locale - The language code to switch to (e.g., 'en', 'ko', 'ja')
   */
  const handleLocaleChange = async (locale: string) => {
    i18n.changeLanguage(locale);

    await fetcher.submit(null, {
      method: "POST",
      action: "/api/settings/locale?locale=" + locale,
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        asChild
        className="cursor-pointer"
        data-testid="lang-switcher"
      >
        <Button
          variant="ghost"
          size="icon"
          aria-label={t("navigation.language")}
        >
          <LanguagesIcon className="size-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleLocaleChange("ja")}>
          <span className="inline-flex w-5 justify-center" aria-hidden>
            🇯🇵
          </span>
          {t("navigation.ja")}
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => handleLocaleChange("ko")}>
          <span className="inline-flex w-5 justify-center" aria-hidden>
            🇰🇷
          </span>
          {t("navigation.kr")}
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => handleLocaleChange("en")}>
          <span className="inline-flex w-5 justify-center" aria-hidden>
            <GlobeIcon className="size-4 text-foreground" />
          </span>
          {t("navigation.en")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
