"use client";

import { useState, useSyncExternalStore } from "react";
import { animate, motion, useMotionValue } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";

import { cn } from "@/lib/utils";

const PILL_TRACK =
  "rounded-full bg-gray-200 shadow-inner shadow-slate-500/65 dark:bg-gray-900/98 dark:shadow-[inset_0_1px_2px_rgba(0,0,0,0.45)] dark:shadow-slate-600 dark:ring-1 dark:ring-inset dark:ring-white/10";

const PILL_PULSE = "motion-safe:animate-pulse motion-reduce:animate-none";

let themeToggleClientReady = false;
let themeToggleClientReadyMicrotaskPending = false;
const themeToggleClientListeners = new Set<() => void>();

function subscribeThemeToggleClientReady(listener: () => void) {
  themeToggleClientListeners.add(listener);

  if (!themeToggleClientReady && !themeToggleClientReadyMicrotaskPending) {
    themeToggleClientReadyMicrotaskPending = true;
    queueMicrotask(() => {
      themeToggleClientReadyMicrotaskPending = false;
      themeToggleClientReady = true;
      themeToggleClientListeners.forEach((l) => l());
    });
  }

  return () => {
    themeToggleClientListeners.delete(listener);
  };
}

function useThemeToggleClientReady() {
  return useSyncExternalStore(
    subscribeThemeToggleClientReady,
    () => themeToggleClientReady,
    () => false,
  );
}

function ThemeToggleSkeleton({
  busy,
  loadingLabel,
}: {
  busy?: boolean;
  loadingLabel?: string;
}) {
  return (
    <div
      className={cn(
        PILL_TRACK,
        PILL_PULSE,
        "pointer-events-none relative flex h-8 min-w-20.5 shrink-0 cursor-default items-center justify-center overflow-hidden",
      )}
      aria-busy={busy ? "true" : undefined}
      aria-label={busy ? loadingLabel : undefined}
      data-testid="dark-mode-toggle-skeleton"
    />
  );
}

const SPIN_TRANSITION = {
  type: "spring",
  stiffness: 300,
  damping: 20,
} as const;

export default function DarkToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const clientReady = useThemeToggleClientReady();
  const knobRotate = useMotionValue(0);
  const t = useTranslations("dark-toggle");
  const [latchedTheme, setLatchedTheme] = useState<
    "light" | "dark" | undefined
  >(undefined);

  if (resolvedTheme === "light" || resolvedTheme === "dark") {
    if (latchedTheme !== resolvedTheme) {
      setLatchedTheme(resolvedTheme);
    }
  }

  const stableResolved =
    resolvedTheme === "light" || resolvedTheme === "dark"
      ? resolvedTheme
      : latchedTheme;

  if (!clientReady || stableResolved === undefined) {
    return <ThemeToggleSkeleton busy loadingLabel={t("loading")} />;
  }

  const darkMode = stableResolved === "dark";

  const toggleDarkMode = () => {
    setTheme(darkMode ? "light" : "dark");
    const next = knobRotate.get() + 360;
    animate(knobRotate, next, SPIN_TRANSITION);
  };

  return (
    <motion.button
      type="button"
      className="relative flex h-8 min-w-20.5 cursor-pointer items-center justify-center overflow-hidden rounded-full border-0 bg-gray-200 shadow-inner shadow-slate-500/65 transition-all duration-300 dark:bg-gray-900 dark:shadow-slate-600"
      onClick={toggleDarkMode}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      data-testid="dark-mode-toggle"
      aria-label={darkMode ? t("switchToLight") : t("switchToDark")}
      aria-pressed={darkMode}
    >
      <div className="absolute left-1.25 z-10">
        <Sun size={20} className="text-yellow-600 dark:text-yellow-400" />
      </div>
      <div className="absolute right-1 z-10">
        <Moon size={20} className="text-gray-400 dark:text-gray-400" />
      </div>
      <motion.div
        className="absolute top-1 z-20 flex size-6 items-center justify-center rounded-full bg-linear-to-b from-yellow-300 to-yellow-600 shadow-md transition-colors duration-300 dark:bg-linear-to-b dark:from-gray-500 dark:to-gray-800"
        style={{ left: "1px", rotate: knobRotate }}
        initial={false}
        animate={{ x: darkMode ? 54 : 2 }}
        transition={SPIN_TRANSITION}
      >
        {darkMode ? (
          <Moon size={16} className="text-white" strokeWidth={1.4} />
        ) : (
          <Sun size={16} className="text-white" strokeWidth={1.4} />
        )}
      </motion.div>
    </motion.button>
  );
}
