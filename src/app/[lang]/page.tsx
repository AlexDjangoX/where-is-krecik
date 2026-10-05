import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";

import { WhereIsKrecikGame } from "@/components/where-is-krecik/components/WhereIsKrecikGame";
import type { Language } from "@/intl/constants";
import { routing } from "@/intl/routing";

export default async function HomePage(props: PageProps<"/[lang]">) {
  const { lang } = await props.params;
  const locale = hasLocale(routing.locales, lang)
    ? (lang as Language)
    : routing.defaultLocale;
  setRequestLocale(locale);

  return <WhereIsKrecikGame />;
}
