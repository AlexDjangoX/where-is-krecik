import { fallbackLng, languages } from "@/intl/constants";
import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: languages,
  defaultLocale: fallbackLng,
  localePrefix: "always",
  localeDetection: true,
  localeCookie: {
    name: "NEXT_LOCALE",
    maxAge: 60 * 60 * 24 * 30,
    sameSite: "lax",
  },
});
