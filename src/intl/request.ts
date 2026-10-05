import * as rootParams from "next/root-params";
import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { notFound } from "next/navigation";

import { intlGetMessageFallback, intlOnError } from "@/intl/error-handling";
import { getMessagesForLocale } from "@/intl/messages";
import { routing } from "@/intl/routing";

export default getRequestConfig(async ({ locale }) => {
  const requested = locale ?? (await rootParams.lang());
  if (!hasLocale(routing.locales, requested)) {
    notFound();
  }

  return {
    locale: requested,
    messages: getMessagesForLocale(requested),
    timeZone: "UTC",
    onError: intlOnError,
    getMessageFallback: intlGetMessageFallback,
  };
});
