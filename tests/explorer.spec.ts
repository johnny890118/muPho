import { expect, test } from "@playwright/test";
import type { Work } from "../lib/search-types";

const sunset: Work = {
  id: "100", title: "Sunset over the sea", author: "Test author",
  thumbnail: "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/11/Test.jpg",
  source: "https://commons.wikimedia.org/wiki/File:Test.jpg",
  license: "CC BY 4.0", licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
  width: 640, height: 400, media: "photo", terms: "Sunset sea", checkedAt: "2026-11-17T00:00:00.000Z",
};
const dusk = { ...sunset, id: "101", title: "Sunset at dusk" };

test("song selection, pagination, preview and local favorites", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "share", { value: undefined });
    Object.defineProperty(navigator, "clipboard", { value: { writeText: async (text: string) => {
      sessionStorage.setItem("test-clipboard", text);
    } } });
  });
  await page.route("https://thumb.wikimedia.org/**", (route) => route.fulfill({
    contentType: "image/svg+xml",
    body: '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400"><rect width="640" height="400" fill="#5c5143"/></svg>',
  }));
  await page.route("**/api/search?**", (route) => {
    const params = new URL(route.request().url()).searchParams;
    if (params.get("kind") === "tracks") return route.fulfill({ json: {
      tracks: [
        { id: "1", title: "Dreams", artist: "Fleetwood Mac", album: "Rumours", milliseconds: 257000 },
        { id: "2", title: "Dreams", artist: "The Cranberries" },
      ],
    } });
    if (params.get("media") === "illustration") return route.fulfill({ json: { works: [], hasMore: false } });
    if (params.get("page") === "1") return route.fulfill({ json: { works: [sunset, dusk], hasMore: false } });
    return route.fulfill({ json: { works: [sunset], hasMore: true } });
  });
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.getByRole("textbox", { name: "歌名" }).fill("Dreams");
  await page.getByRole("button", { name: "搜尋", exact: true }).click();
  await page.getByRole("button", { name: /Dreams — Fleetwood Mac/ }).click();
  await expect(page.getByText("未分析完整歌詞", { exact: false })).toBeVisible();
  await page.getByRole("button", { name: "載入更多" }).click();
  const trigger = page.getByRole("button", { name: "預覽 Sunset over the sea" });
  await expect(trigger).toHaveCount(1);
  await trigger.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("link", { name: "來源／取得原檔" })).toHaveAttribute("href", sunset.source);
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("dialog").getByRole("heading")).toHaveText(dusk.title);
  await page.keyboard.press("ArrowLeft");
  await expect(page.getByRole("dialog").getByRole("heading")).toHaveText(sunset.title);
  await page.getByRole("button", { name: "收藏", exact: true }).click();
  await page.getByRole("button", { name: "分享", exact: true }).click();
  await expect(page.getByRole("textbox", { name: "編輯分享文案" })).toHaveValue(/Dreams — Fleetwood Mac/);
  await page.getByRole("button", { name: "分享文案" }).click();
  await expect.poll(() => page.evaluate(() => sessionStorage.getItem("test-clipboard"))).toContain("CC BY 4.0");
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  await trigger.click();
  await page.getByRole("button", { name: "更像這張" }).click();
  await expect(page.getByRole("button", { name: "預覽 Sunset at dusk" })).toBeVisible();
  await expect(page.getByRole("heading", { name: /^Dreams.*Fleetwood Mac/ })).toBeVisible();
  await page.getByRole("button", { name: "返回原搜尋排序" }).click();
  await page.getByRole("tab", { name: "插畫" }).click();
  await expect(page.getByText("這一批沒有符合類型與授權條件的作品。")).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: "收藏（1）" }).click();
  await trigger.click();
  await page.getByRole("button", { name: "取消收藏" }).click();
  await expect(page.getByText("還沒有收藏作品。")).toBeVisible();
});

test("image-search quota and disabled states", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("tab", { name: "圖片搜尋" }).click();
  await page.getByRole("textbox", { name: "圖片關鍵字" }).fill("sunset");
  await page.getByRole("button", { name: "搜尋", exact: true }).click();
  await expect(page.getByRole("region", { name: "搜尋結果" }).getByRole("alert")).toHaveText("這個環境尚未啟用搜尋服務。");
  await page.route("**/api/search?**", (route) => route.fulfill({ status: 429, json: { error: "limited" } }));
  await page.getByRole("button", { name: "搜尋", exact: true }).click();
  await expect(page.getByRole("region", { name: "搜尋結果" }).getByRole("alert")).toHaveText("目前已達搜尋額度，請稍後再試。");
});
