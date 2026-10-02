import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "test",
  testMatch: "*.spec.mjs",
  reporter: process.env.CI ? "github" : "list",
  use: { baseURL: "http://localhost:4820" },
  webServer: { command: "node scripts/serve.mjs", port: 4820, reuseExistingServer: false },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ],
});
