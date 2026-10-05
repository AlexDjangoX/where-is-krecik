"use client";

import { useLocale, useTranslations } from "next-intl";

import { NavbarBrand } from "@/components/chrome/NavbarBrand";
import { PhilosophyDialog } from "@/components/chrome/PhilosophyDialog";
import DarkToggle from "@/components/dark-toggle/DarkToggle";
import { LanguageToggle } from "@/components/language-select/LanguageToggle";
import type { Language } from "@/intl/constants";
import { usePathname, useRouter } from "@/intl/navigation";

const CHROME_ROW =
  "mx-auto grid h-[5.5rem] w-full max-w-6xl grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 px-4 sm:h-24 sm:gap-3 sm:px-6";

export function AppChrome() {
  const t = useTranslations("LanguageSelector");
  const locale = useLocale() as Language;
  const router = useRouter();
  const pathname = usePathname();

  return (
    <header className="z-50 shrink-0 border-b border-lime-300/60 bg-lime-50/90 backdrop-blur-md dark:border-lime-500/20 dark:bg-[#111827]/90">
      <div className={CHROME_ROW}>
        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageToggle
            value={locale}
            size="default"
            ariaLabel={t("SwitchLanguage")}
            onValueChange={(next) => {
              router.replace(pathname, { locale: next });
            }}
          />
          <PhilosophyDialog />
        </div>
        <NavbarBrand />
        <DarkToggle />
      </div>
    </header>
  );
}

export function AppChromeFallback() {
  return (
    <header className="z-50 shrink-0 border-b border-lime-300/60 bg-lime-50/90 dark:border-lime-500/20 dark:bg-[#111827]/90">
      <div className={CHROME_ROW}>
        <div className="flex items-center gap-2 sm:gap-3">
          <div
            className="h-8 min-w-20.5 rounded-full bg-gray-200 motion-safe:animate-pulse dark:bg-gray-900"
            aria-hidden
          />
          <div
            className="h-8 w-24 rounded-full bg-gray-200 motion-safe:animate-pulse dark:bg-gray-900"
            aria-hidden
          />
        </div>
        <div className="mx-auto h-5 w-40 rounded-full bg-lime-200/80 motion-safe:animate-pulse dark:bg-lime-900/50" />
        <div
          className="h-8 min-w-20.5 rounded-full bg-gray-200 motion-safe:animate-pulse dark:bg-gray-900"
          aria-hidden
        />
      </div>
    </header>
  );
}
