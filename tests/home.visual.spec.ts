import { join } from "node:path";
import { expect, test } from "@playwright/test";

const fixtures = join(__dirname, "fixtures");

test("homepage search and examples", async ({ page, baseURL }) => {
  test.skip(process.platform !== "darwin", "Pixel baselines were reviewed using macOS Chromium.");
  const origin = new URL(baseURL!).origin;
  await page.route("**/*", async (route) => {
    const url = new URL(route.request().url());
    if (url.origin === origin) {
      const font = /^\/__visual__\/(sans|serif|hangul)\.woff2$/.exec(url.pathname);
      if (font) return route.fulfill({ path: join(fixtures, "fonts", `${font[1]}.woff2`), contentType: "font/woff2" });
      return route.continue();
    }
    if (url.hostname === "thumb.wikimedia.org" && route.request().resourceType() === "image") {
      return route.fulfill({ path: join(fixtures, "home-visual.svg"), contentType: "image/svg+xml" });
    }
    return route.abort();
  });

  await page.goto("/");
  await page.addStyleTag({ path: join(fixtures, "home-visual.css") });
  await page.evaluate(async () => {
    await Promise.all([
      document.fonts.load('400 14px "Fixture Sans"'),
      document.fonts.load('600 24px "Fixture Serif"'),
      document.fonts.load('500 12px "Fixture Hangul"', "봄날"),
    ]);
    await document.fonts.ready;
    await Promise.all([...document.images].filter((img) => img.getBoundingClientRect().top < innerHeight)
      .map((img) => img.decode()));
  });

  const examples = page.getByRole("group", { name: "試試看" });
  const options = examples.getByRole("button");
  await expect(options).toHaveCount(4);
  const viewport = page.viewportSize()!;
  const layout = await options.evaluateAll((buttons) => buttons.map((button) => {
    const bounds = button.getBoundingClientRect();
    return { top: bounds.top, height: bounds.height, overflow: button.scrollWidth > button.clientWidth || button.scrollHeight > button.clientHeight };
  }));
  expect(layout.filter((item) => item.top === layout[0].top)).toHaveLength(viewport.width < 640 ? 2 : 4);
  expect(layout.every((item) => item.height >= 44 && !item.overflow)).toBeTruthy();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(viewport.width);
  await expect(page.locator(".hero-image img")).toHaveCSS("object-fit", "cover");
  await expect(page.locator("figure img").first()).toHaveCSS("object-fit", "cover");
  await expect(page).toHaveScreenshot("home.png", { animations: "disabled", scale: "css" });

  const example = examples.getByRole("button", { name: "晴天 — 周杰倫" });
  await example.focus();
  await expect(example).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("textbox", { name: "歌名" })).toHaveValue("晴天 — 周杰倫");
});
