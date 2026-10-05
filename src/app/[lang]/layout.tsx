import type { Metadata, Viewport } from "next";
import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";

import { AppChrome } from "@/components/chrome/AppChrome";
import { Toaster } from "@/components/ui/sonner";
import { WHERE_IS_KRECIK_MESSAGES_BY_LOCALE } from "@/intl/bundles/where-is-krecik";
import type { Language } from "@/intl/constants";
import { IntlClientShell } from "@/intl/IntlClientShell";
import chromeEn from "@/intl/locales/en/chrome.json";
import whereIsKrecikEn from "@/intl/locales/en/where-is-krecik.json";
import chromePl from "@/intl/locales/pl/chrome.json";
import whereIsKrecikPl from "@/intl/locales/pl/where-is-krecik.json";
import { routing } from "@/intl/routing";

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

export async function generateMetadata(
  props: LangLayoutProps,
): Promise<Metadata> {
  const { lang } = await props.params;
  const locale = hasLocale(routing.locales, lang)
    ? (lang as Language)
    : routing.defaultLocale;
  const meta = locale === "pl" ? whereIsKrecikPl.Meta : whereIsKrecikEn.Meta;

  return {
    title: meta.title,
    description: meta.description,
  };
}

export default async function LangLayout(props: LangLayoutProps) {
  const { lang } = await props.params;
  const locale = hasLocale(routing.locales, lang)
    ? (lang as Language)
    : routing.defaultLocale;
  setRequestLocale(locale);

  const messages = {
    ...WHERE_IS_KRECIK_MESSAGES_BY_LOCALE[locale],
    chrome: locale === "pl" ? chromePl : chromeEn,
  };

  return (
    <IntlClientShell locale={locale} messages={messages}>
      <div className="flex h-screen min-h-0 flex-col overflow-hidden">
        <AppChrome />
        <div className="relative min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain">
          {props.children}
        </div>
      </div>
      <Toaster />
    </IntlClientShell>
  );
}
