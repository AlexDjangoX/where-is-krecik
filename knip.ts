import type { KnipConfig } from "knip";

const cssImport = /@import\s+["']([^"']+)["']/g;

const config: KnipConfig = {
  entry: [
    "src/app/**/{page,layout,template,loading,error,global-error,not-found,global-not-found,default,route,sitemap,robots,icon,apple-icon,opengraph-image,twitter-image}.{ts,tsx,js,jsx}",
    "src/intl/request.ts",
  ],
  project: ["src/**/*.{ts,tsx,js,jsx,css}", "__tests__/**/*.{ts,tsx}"],
  compilers: {
    css: (text) =>
      [...text.matchAll(cssImport)]
        .map((match) => `import "${match[1]}";`)
        .join("\n"),
  },
  tags: ["-knipignore"],
  ignore: ["src/components/ui/**"],
  ignoreIssues: {
    "__tests__/**": ["exports", "types"],
  },
};

export default config;
