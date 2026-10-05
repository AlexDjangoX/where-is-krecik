"use client";

import { Source_Sans_3 as SourceSans3 } from "next/font/google";

import "./globals.css";

const font = SourceSans3({
  subsets: ["latin", "latin-ext"],
  variable: "--font-source-sans",
  display: "swap",
});

export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <html lang="en" className={font.variable}>
      <body className="flex min-h-screen flex-col items-center justify-center bg-lime-50 px-6 text-center antialiased dark:bg-[#111827]">
        <title>Something went wrong | Where is Krecik?</title>
        <h1 className="text-2xl font-semibold text-lime-950 dark:text-lime-50">
          Something went wrong / Coś poszło nie tak
        </h1>
        {error.digest ? (
          <p className="mt-2 text-xs text-lime-900/60 dark:text-lime-100/60">
            {error.digest}
          </p>
        ) : null}
        <button
          type="button"
          onClick={() => retry()}
          className="mt-6 rounded-full bg-lime-700 px-4 py-2 text-sm font-semibold text-white hover:bg-lime-800 dark:bg-lime-500 dark:text-lime-950"
        >
          Try again / Spróbuj ponownie
        </button>
      </body>
    </html>
  );
}
