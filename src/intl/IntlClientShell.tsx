"use client";

import type { ReactNode } from "react";
import type { Language } from "@/intl/constants";
import { intlGetMessageFallback, intlOnError } from "@/intl/error-handling";
import { NextIntlClientProvider } from "next-intl";

type IntlClientShellProps = {
  locale: Language;
  messages: Record<string, unknown>;
  children: ReactNode;
};

export function IntlClientShell({
  locale,
  messages,
  children,
}: IntlClientShellProps) {
  return (
    <NextIntlClientProvider
      locale={locale}
      messages={messages}
      timeZone="UTC"
      onError={intlOnError}
      getMessageFallback={intlGetMessageFallback}
    >
      {children}
    </NextIntlClientProvider>
  );
}
