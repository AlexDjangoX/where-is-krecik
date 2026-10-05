import type { MetadataRoute } from "next";

import { languages } from "@/intl/constants";
import { getSiteUrl } from "@/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const languageUrls = Object.fromEntries(
    languages.map((lang) => [lang, new URL(`/${lang}`, base).toString()]),
  );

  return languages.map((lang) => ({
    url: new URL(`/${lang}`, base).toString(),
    alternates: {
      languages: languageUrls,
    },
  }));
}
