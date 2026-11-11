import { defineConfig } from "vitest/config";

export default defineConfig({
  base: process.env.BASE_PATH ?? "/",
  build: { chunkSizeWarningLimit: 2500 },
  test: { include: ["tests/**/*.test.ts"] },
});
