import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  // The live-* specs run against a deployed URL, so they are opt-in:
  //   E2E_BASE_URL=https://<domain> npx playwright test e2e/live-check.spec.ts
  testIgnore: process.env.E2E_BASE_URL ? [] : ["**/live-*.spec.ts"],
  fullyParallel: false,
  forbidOnly: true,
  retries: 0,
  timeout: 90_000,
  reporter: "line",
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000",
    trace: "retain-on-failure",
  },
});
