/**
 * Canonical origin for Metadata, sitemap, and robots.
 * Returned as a string so Cache Components / `"use cache"` never serialize a `URL`.
 */
export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) {
    return new URL(explicit).origin;
  }

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) {
    return new URL(`https://${vercel}`).origin;
  }

  return "http://localhost:3000";
}
