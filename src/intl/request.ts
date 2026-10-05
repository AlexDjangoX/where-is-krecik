import { intlGetMessageFallback, intlOnError } from "@/intl/error-handling";
import { routing } from "@/intl/routing";
import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    timeZone: "UTC",
    onError: intlOnError,
    getMessageFallback: intlGetMessageFallback,
  };
});
