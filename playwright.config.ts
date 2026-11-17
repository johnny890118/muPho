import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "tests",
  testMatch: "**/*.spec.ts",
  updateSnapshots: "none",
  snapshotPathTemplate: "{testDir}/snapshots/{platform}/{projectName}/{testFilePath}/{arg}{ext}",
  use: { baseURL: "http://127.0.0.1:3174", trace: "retain-on-failure", screenshot: "only-on-failure" },
  projects: [
    { name: "desktop-1440", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    { name: "tablet-768", testIgnore: "**/*.visual.spec.ts", use: { ...devices["Desktop Chrome"], hasTouch: true, viewport: { width: 768, height: 1024 } } },
    { name: "mobile-390", use: { ...devices["Pixel 7"], viewport: { width: 390, height: 844 } } },
    { name: "mobile-375", testIgnore: "**/*.visual.spec.ts", use: { ...devices["Pixel 7"], viewport: { width: 375, height: 812 } } },
    { name: "mobile-landscape", testIgnore: "**/*.visual.spec.ts", use: { ...devices["Pixel 7 landscape"], viewport: { width: 844, height: 390 } } },
  ],
  webServer: { command: "npm run start -- --hostname 127.0.0.1 --port 3174", url: "http://127.0.0.1:3174", env: { MUPHO_ENABLE_SEARCH: "0", MUPHO_BLOCKED_COMMONS_IDS: "" } },
});
