import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "e2e",
  timeout: 60000,
  use: { baseURL: "http://localhost:4173", launchOptions: { args: ["--use-gl=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] } },
  webServer: { command: "npm run build && npm run preview -- --port 4173", url: "http://localhost:4173", reuseExistingServer: true, timeout: 180000 },
});
