import type { Metadata } from "next";
import { Source_Sans_3 as SourceSans3 } from "next/font/google";

import "./globals.css";

const font = SourceSans3({
  subsets: ["latin", "latin-ext"],
  variable: "--font-source-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Page not found | Where is Krecik?",
  description: "That path isn't in Krecik's garden.",
};

export default function GlobalNotFound() {
  return (
    <html lang="en" className={font.variable}>
      <body className="flex min-h-screen flex-col items-center justify-center bg-lime-50 px-6 text-center antialiased dark:bg-[#111827]">
        <h1 className="text-2xl font-semibold text-lime-950 dark:text-lime-50">
          We can&apos;t find that page / Nie ma takiej strony
        </h1>
        <p className="mt-2 text-sm text-lime-900/70 dark:text-lime-100/70">
          That path isn&apos;t in Krecik&apos;s garden.
        </p>
        <a
          href="/"
          className="mt-6 rounded-full bg-lime-700 px-4 py-2 text-sm font-semibold text-white hover:bg-lime-800 dark:bg-lime-500 dark:text-lime-950"
        >
          Back to the garden / Wróć do ogrodu
        </a>
      </body>
    </html>
  );
}
