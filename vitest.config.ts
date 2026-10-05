import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  ssr: {
    noExternal: ["next-intl", "use-intl"],
  },
  test: {
    globals: true,
    setupFiles: ["./__tests__/setup.ts"],
    environment: "node",
    include: ["__tests__/**/*.test.ts", "__tests__/**/*.test.tsx"],
    exclude: ["**/node_modules/**"],
    testTimeout: 30_000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      __tests__: path.resolve(__dirname, "./__tests__"),
    },
  },
});
