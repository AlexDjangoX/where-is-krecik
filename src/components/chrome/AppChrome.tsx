"use client";

import { useLocale, useTranslations } from "next-intl";

import { ThemeToggle } from "@/components/chrome/ThemeToggle";
import { cn } from "@/lib/utils";
import { languages, type Language } from "@/intl/constants";
import { usePathname, useRouter } from "@/intl/navigation";

export function AppChrome() {
  const t = useTranslations("chrome");
  const locale = useLocale() as Language;
  const router = useRouter();
  const pathname = usePathname();

  return (
    <header className="z-50 shrink-0 border-b border-lime-300/60 bg-lime-50/90 backdrop-blur-md dark:border-lime-500/20 dark:bg-[#111827]/90">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-end gap-3 px-4 sm:px-6">
        <div
          role="group"
          aria-label={t("language")}
          className="flex overflow-hidden rounded-full border border-lime-300/80 bg-white/80 p-0.5 dark:border-lime-500/30 dark:bg-lime-950/60"
        >
          {languages.map((lang) => {
            const active = locale === lang;
            return (
              <button
                key={lang}
                type="button"
                data-testid={`language-${lang}`}
                aria-pressed={active}
                aria-label={
                  lang === "en" ? t("switchToEnglish") : t("switchToPolish")
                }
                onClick={() => {
                  if (!active) {
                    router.replace(pathname, { locale: lang });
                  }
                }}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-semibold tracking-wide transition-colors",
                  active
                    ? "bg-lime-700 text-white dark:bg-lime-500 dark:text-lime-950"
                    : "text-lime-900/70 hover:bg-lime-100 dark:text-lime-100/70 dark:hover:bg-lime-900/70",
                )}
              >
                {lang.toUpperCase()}
              </button>
            );
          })}
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}
