import type { Language } from "@/intl/constants";
import whereIsKrecikEn from "@/intl/locales/en/where-is-krecik.json";
import whereIsKrecikPl from "@/intl/locales/pl/where-is-krecik.json";

export const WHERE_IS_KRECIK_MESSAGES_BY_LOCALE: Record<
  Language,
  { "where-is-krecik": typeof whereIsKrecikEn }
> = {
  en: { "where-is-krecik": whereIsKrecikEn },
  pl: { "where-is-krecik": whereIsKrecikPl },
};
