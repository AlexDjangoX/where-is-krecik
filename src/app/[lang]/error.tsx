"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";

export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  const t = useTranslations("chrome");

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-full max-w-lg flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <h1 className="text-2xl font-semibold text-lime-950 dark:text-lime-50">
        {t("errorTitle")}
      </h1>
      <button
        type="button"
        onClick={() => retry()}
        className="rounded-full bg-lime-700 px-4 py-2 text-sm font-semibold text-white hover:bg-lime-800 dark:bg-lime-500 dark:text-lime-950 dark:hover:bg-lime-400"
      >
        {t("retry")}
      </button>
    </main>
  );
}
