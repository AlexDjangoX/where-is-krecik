import type { Metadata, Viewport } from "next";
import { Source_Sans_3 as SourceSans3 } from "next/font/google";
import { hasLocale } from "next-intl";
import { getMessages } from "next-intl/server";
import { ThemeProvider } from "next-themes";
import { notFound } from "next/navigation";
import { Suspense, type ReactNode } from "react";

import { AppChrome, AppChromeFallback } from "@/components/chrome/AppChrome";
import { Toaster } from "@/components/ui/sonner";
import type { Language } from "@/intl/constants";
import { IntlClientShell } from "@/intl/IntlClientShell";
import whereIsKrecikEn from "@/intl/locales/en/where-is-krecik.json";
import whereIsKrecikPl from "@/intl/locales/pl/where-is-krecik.json";
import { routing } from "@/intl/routing";
import { getSiteUrl } from "@/lib/site-url";
import {
  LOCALE_BOOTSTRAP_SCRIPT,
  THEME_BOOTSTRAP_SCRIPT,
} from "@/lib/theme-bootstrap";

import "../globals.css";

const font = SourceSans3({
  subsets: ["latin", "latin-ext"],
  variable: "--font-source-sans",
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((lang) => ({ lang }));
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ecfccb" },
    { media: "(prefers-color-scheme: dark)", color: "#111827" },
  ],
};

type LangLayoutProps = LayoutProps<"/[lang]">;

function requireLocale(lang: string): Language {
  if (!hasLocale(routing.locales, lang)) {
    notFound();
  }
  return lang;
}

export async function generateMetadata(
  props: LangLayoutProps,
): Promise<Metadata> {
  const { lang } = await props.params;
  const locale = hasLocale(routing.locales, lang)
    ? lang
    : routing.defaultLocale;
  const meta = locale === "pl" ? whereIsKrecikPl.Meta : whereIsKrecikEn.Meta;

  return {
    metadataBase: getSiteUrl(),
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: `/${locale}`,
      languages: {
        en: "/en",
        pl: "/pl",
        "x-default": "/en",
      },
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      locale: locale === "pl" ? "pl_PL" : "en_US",
      alternateLocale: locale === "pl" ? ["en_US"] : ["pl_PL"],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.description,
    },
  };
}

async function LocaleShell({
  params,
  children,
}: {
  params: LangLayoutProps["params"];
  children: ReactNode;
}) {
  const { lang } = await params;
  const locale = requireLocale(lang);
  const messages = await getMessages();

  return (
    <IntlClientShell locale={locale} messages={messages}>
      <div className="flex h-screen min-h-0 flex-col overflow-hidden">
        <Suspense fallback={<AppChromeFallback />}>
          <AppChrome />
        </Suspense>
        <div className="relative min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain">
          {children}
        </div>
      </div>
      <Toaster />
    </IntlClientShell>
  );
}

export default function LangLayout(props: LangLayoutProps) {
  return (
    <html lang={routing.defaultLocale} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `${THEME_BOOTSTRAP_SCRIPT}${LOCALE_BOOTSTRAP_SCRIPT}`,
          }}
        />
      </head>
      <body
        className={`${font.variable} h-screen overflow-hidden bg-lime-50 antialiased dark:bg-[#111827]`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          storageKey="theme"
        >
          <Suspense
            fallback={
              <div className="flex h-screen min-h-0 flex-col overflow-hidden">
                <AppChromeFallback />
              </div>
            }
          >
            <LocaleShell params={props.params}>{props.children}</LocaleShell>
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  );
}
