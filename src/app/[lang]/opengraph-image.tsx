import { hasLocale } from "next-intl";

import { routing } from "@/intl/routing";
import whereIsKrecikEn from "@/intl/locales/en/where-is-krecik.json";
import whereIsKrecikPl from "@/intl/locales/pl/where-is-krecik.json";
import { createOgImage } from "@/lib/og-image";

export const alt = "Where is Krecik?";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale = hasLocale(routing.locales, lang)
    ? lang
    : routing.defaultLocale;
  const meta = locale === "pl" ? whereIsKrecikPl.Meta : whereIsKrecikEn.Meta;

  return createOgImage({
    title: meta.title,
    description: meta.description,
  });
}
