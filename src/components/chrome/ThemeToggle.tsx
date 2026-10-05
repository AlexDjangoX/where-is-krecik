"use client";

import { Moon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

function subscribeNever() {
  return () => {};
}

function useHasMounted() {
  return useSyncExternalStore(subscribeNever, () => true, () => false);
}

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const t = useTranslations("chrome");
  const mounted = useHasMounted();
  const darkMode = resolvedTheme === "dark";

  if (!mounted) {
    return (
      <div
        className="size-8 rounded-full bg-lime-200/80 dark:bg-lime-900/60"
        aria-hidden
        data-testid="theme-toggle-skeleton"
      />
    );
  }

  return (
    <button
      type="button"
      data-testid="theme-toggle"
      aria-label={darkMode ? t("switchToLight") : t("switchToDark")}
      aria-pressed={darkMode}
      onClick={() => setTheme(darkMode ? "light" : "dark")}
      className="flex size-8 items-center justify-center rounded-full border border-lime-300/80 bg-white/80 text-lime-900 transition-colors hover:bg-lime-100 dark:border-lime-500/30 dark:bg-lime-950/60 dark:text-lime-100 dark:hover:bg-lime-900/70"
    >
      {darkMode ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </button>
  );
}
