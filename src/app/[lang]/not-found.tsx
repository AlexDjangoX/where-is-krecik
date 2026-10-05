import { getTranslations } from "next-intl/server";

import { Link } from "@/intl/navigation";

export default async function NotFound() {
  const t = await getTranslations("chrome");

  return (
    <main className="mx-auto flex min-h-full max-w-lg flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <h1 className="text-2xl font-semibold text-lime-950 dark:text-lime-50">
        {t("notFoundTitle")}
      </h1>
      <p className="text-sm text-lime-900/70 dark:text-lime-100/70">
        {t("notFoundBody")}
      </p>
      <Link
        href="/"
        className="rounded-full bg-lime-700 px-4 py-2 text-sm font-semibold text-white hover:bg-lime-800 dark:bg-lime-500 dark:text-lime-950 dark:hover:bg-lime-400"
      >
        {t("home")}
      </Link>
    </main>
  );
}
