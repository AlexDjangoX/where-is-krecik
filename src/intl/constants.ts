/**
 * Locale constants — safe to import in server components.
 */

export const fallbackLng = "en";
export const languages = ["en", "pl"] as const;

export type Language = (typeof languages)[number];
