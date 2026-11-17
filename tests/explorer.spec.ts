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
    if (params.get("page") === "9") return route.fulfill({ json: { works: [sunset, dusk], hasMore: false } });
    return route.fulfill({ json: { works: [sunset], hasMore: true, nextPage: 9 } });
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
  await page.getByRole("button", { name: "分享", exact: true }).click();
  await expect(page.getByRole("textbox", { name: "編輯分享文案" })).toHaveValue(/Dreams — Fleetwood Mac/);
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

test("song fallback, first-screen gallery and preview image recovery", async ({ page }, info) => {
  const photo = { ...sunset, title: "A long title for a schoolyard photograph ".repeat(4), previewUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/11/Unavailable.jpg" };
  await page.route("https://thumb.wikimedia.org/**", (route) => route.request().url() === photo.previewUrl
    ? route.fulfill({ status: 404 })
    : route.fulfill({ contentType: "image/svg+xml", body: '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400"><rect width="640" height="400" fill="#655746"/></svg>' }));
  const imageQueries: string[] = [];
  await page.route("**/api/search?**", async (route) => {
    const params = new URL(route.request().url()).searchParams;
    if (params.get("kind") === "tracks") {
      expect(params.get("q")).toBe("晴天-周杰倫");
      return route.fulfill({ json: { tracks: [
        { id: "1", title: "晴天", artist: "周杰倫", album: "葉惠美" },
        { id: "2", title: "晴天", artist: "張信哲" },
      ] } });
    }
    const q = params.get("q") ?? "";
    imageQueries.push(q);
    if (q === "school corridor") return route.fulfill({ json: { works: [], hasMore: false, status: "filtered" } });
    return route.fulfill({ json: { works: [photo, dusk], hasMore: false, status: "matched" } });
  });

  await page.goto("/");
  await page.getByRole("textbox", { name: "歌名" }).fill("晴天-周杰倫");
  await page.getByRole("button", { name: "搜尋", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(0);
  await page.getByRole("dialog").getByRole("button", { name: /晴天 — 周杰倫/ }).click();
  const trigger = page.getByRole("button", { name: /^預覽 A long title/ });
  await expect(trigger).toBeInViewport();
  expect(imageQueries).toEqual(["school corridor", "schoolyard"]);
  await expect(page.getByText("schoolyard", { exact: true })).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(info.project.use.viewport!.width);

  await trigger.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.locator("img")).toHaveAttribute("src", photo.thumbnail);
  await expect.poll(() => dialog.evaluate((element) => element.scrollWidth - element.clientWidth)).toBeLessThanOrEqual(1);
  if (info.project.use.hasTouch) {
    await dialog.locator("img").evaluate((image) => {
      const touch = (clientX: number) => new Touch({ identifier: 1, target: image, clientX, clientY: 120 });
      image.dispatchEvent(new TouchEvent("touchstart", { bubbles: true, touches: [touch(220)] }));
      image.dispatchEvent(new TouchEvent("touchend", { bubbles: true, changedTouches: [touch(100)] }));
    });
  } else {
    await page.keyboard.press("ArrowRight");
  }
  await expect(dialog.getByRole("heading")).toHaveText(dusk.title);
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();

  await page.getByRole("tab", { name: "圖片搜尋" }).click();
  await page.getByRole("textbox", { name: "圖片關鍵字" }).fill("sunset");
  await page.getByRole("button", { name: "搜尋", exact: true }).click();
  await expect(page.getByRole("heading", { name: "sunset" })).toBeVisible();
  await expect(page.getByText("依歌曲資料推薦", { exact: false })).toHaveCount(0);
  expect(imageQueries.at(-1)).toBe("sunset");
});

test("upstream outage, upstream rate limit and true empty results are distinct", async ({ page }) => {
  let response = { status: 503, json: { error: "offline" } } as { status: number; json: object };
  await page.route("**/api/search?**", (route) => route.fulfill(response));
  await page.goto("/");
  await page.getByRole("tab", { name: "圖片搜尋" }).click();
  await page.getByRole("textbox", { name: "圖片關鍵字" }).fill("sunset");
  await page.getByRole("button", { name: "搜尋", exact: true }).click();
  const region = page.getByRole("region", { name: "搜尋結果" });
  await expect(region.getByRole("alert")).toHaveText(/來源服務暫時無法回應/);
  response = { status: 429, json: { error: "upstream_limited" } };
  await page.getByRole("button", { name: "重試" }).click();
  await expect(region.getByRole("alert")).toHaveText(/來源正在限流/);
  response = { status: 200, json: { works: [], hasMore: false, status: "empty" } };
  await page.getByRole("button", { name: "搜尋", exact: true }).click();
  await expect(region.getByRole("heading", { name: "目前沒有相符的作品" })).toBeVisible();
});

test("provided lyrics stay in the browser and can be replaced with track metadata", async ({ page }) => {
  const requests: string[] = [];
  await page.route("https://thumb.wikimedia.org/**", (route) => route.abort());
  await page.route("**/api/search?**", (route) => {
    const params = new URL(route.request().url()).searchParams;
    requests.push(params.get("q") ?? "");
    return route.fulfill({ json: params.get("kind") === "tracks"
      ? { tracks: [{ id: "1", title: "晴天", artist: "周杰倫" }] }
      : { status: "matched", works: [sunset], hasMore: false } });
  });
  await page.goto("/");
  await page.getByRole("textbox", { name: "歌名" }).fill("晴天 — 周杰倫");
  await page.getByRole("button", { name: "搜尋", exact: true }).click();
  await expect(page.getByText("依歌曲資料推薦・未分析完整歌詞")).toBeVisible();
  await page.getByRole("button", { name: "提供歌詞" }).click();
  const lyrics = page.getByRole("textbox", { name: "你提供的歌詞" });
  await lyrics.fill("雨打在窗戶\n這是一段私密的測試文字");
  const apply = page.getByRole("button", { name: "用歌詞找圖" });
  await expect(apply).toBeDisabled();
  await page.getByRole("checkbox").check();
  await apply.click();
  await expect(page.getByText("依你提供的歌詞擷取意象")).toBeVisible();
  await expect.poll(() => requests).toEqual(["晴天 — 周杰倫", "school corridor", "rain window"]);
  await page.getByRole("button", { name: "提供歌詞" }).click();
  await expect(lyrics).toHaveValue("");
  await page.getByRole("button", { name: "回到歌曲資料推薦" }).click();
  await expect(page.getByText("依歌曲資料推薦・未分析完整歌詞")).toBeVisible();
});
