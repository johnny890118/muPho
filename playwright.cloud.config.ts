import { defineConfig } from "@playwright/test";
import base from "./playwright.config";

const server = base.webServer;
if (!server || Array.isArray(server)) throw new Error("Expected one Playwright server");

export default defineConfig({
  ...base,
  testMatch: "**/cloud-lyrics.browser.ts",
  projects: base.projects?.filter(({ name }) => name === "desktop-1440" || name === "mobile-390"),
  webServer: {
    ...server,
    env: { ...server.env, MUPHO_ENABLE_SEARCH: "1", MUPHO_GROQ_FREE_ZDR: "1", GROQ_API_KEY: "gsk_browser_fixture", MUPHO_GROQ_ORIGIN: "http://127.0.0.1:3174" },
  },
});
