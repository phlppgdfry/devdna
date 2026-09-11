import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "./e2e",
  testMatch: "**/*.spec.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://127.0.0.1:3120",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile-chromium", use: { ...devices["Pixel 7"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ],
  webServer: {
    command:
      "node --import ./e2e/mock-github.mjs ./node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port 3120",
    url: "http://127.0.0.1:3120",
    reuseExistingServer: false,
    timeout: 60000,
    env: {
      DEVDNA_E2E: "1",
      GITHUB_TOKEN: "",
      GH_TOKEN: "",
      NEXT_TELEMETRY_DISABLED: "1",
    },
  },
});
