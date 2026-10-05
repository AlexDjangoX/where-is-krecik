import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

import { languages } from "./src/intl/constants";

const withNextIntl = createNextIntlPlugin("./src/intl/request.ts");

const localePattern = languages.join("|");

const nextConfig: NextConfig = {
  cacheComponents: true,
  reactCompiler: true,
  async redirects() {
    return [
      {
        source: `/:lang(${localePattern})/where-is-krecik`,
        destination: "/:lang",
        permanent: true,
      },
      {
        source: `/:lang(${localePattern})/where-is-momo`,
        destination: "/:lang",
        permanent: true,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
