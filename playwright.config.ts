import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "tests",
  testMatch: "**/*.spec.ts",
  use: { baseURL: "http://127.0.0.1:3174", trace: "retain-on-failure", screenshot: "only-on-failure" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: { command: "npm run start -- --hostname 127.0.0.1 --port 3174", url: "http://127.0.0.1:3174", env: { MUPHO_ENABLE_SEARCH: "0" } },
});
