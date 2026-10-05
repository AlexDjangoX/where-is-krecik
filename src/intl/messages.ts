import type { Language } from "@/intl/constants";
import { WHERE_IS_KRECIK_MESSAGES_BY_LOCALE } from "@/intl/bundles/where-is-krecik";
import chromeEn from "@/intl/locales/en/chrome.json";
import darkToggleEn from "@/intl/locales/en/dark-toggle.json";
import languageSelectorEn from "@/intl/locales/en/language-selector.json";
import philosophyEn from "@/intl/locales/en/philosophy.json";
import chromePl from "@/intl/locales/pl/chrome.json";
import darkTogglePl from "@/intl/locales/pl/dark-toggle.json";
import languageSelectorPl from "@/intl/locales/pl/language-selector.json";
import philosophyPl from "@/intl/locales/pl/philosophy.json";

export function getMessagesForLocale(locale: Language) {
  const languageSelector =
    locale === "pl" ? languageSelectorPl : languageSelectorEn;

  return {
    ...WHERE_IS_KRECIK_MESSAGES_BY_LOCALE[locale],
    ...languageSelector,
    chrome: locale === "pl" ? chromePl : chromeEn,
    "dark-toggle": locale === "pl" ? darkTogglePl : darkToggleEn,
    philosophy: locale === "pl" ? philosophyPl : philosophyEn,
  };
}
