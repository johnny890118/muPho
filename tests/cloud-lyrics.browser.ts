import { expect, test } from "@playwright/test";

test("preselects a recording and searches independent AI directions only after consent", async ({ page }, info) => {
  const lyrics = "完整歌詞測試：起初心事重重。雨停時，我走到門前看見光。";
  const inputs: unknown[] = [];
  const images: string[] = [];
  let lastImageSearch = -Infinity;
  await page.route("https://thumb.wikimedia.org/**", (route) => route.fulfill({
    contentType: "image/svg+xml",
    body: '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400"><rect width="640" height="400" fill="#5c5143"/></svg>',
  }));
  await page.route("**/api/search?**", (route) => {
    const query = new URL(route.request().url()).searchParams;
    if (query.get("kind") === "tracks") return route.fulfill({ json: { tracks: [
      { id: "1", title: "晴天", artist: "周杰倫" }, { id: "2", title: "晴天", artist: "試作藝人" },
    ] } });
    const now = performance.now();
    if (now - lastImageSearch < 1000) return route.fulfill({ status: 429, json: { error: "busy" } });
    lastImageSearch = now;
    const q = query.get("q")!;
    const media = query.get("media")!;
    images.push(q);
    return route.fulfill({ json: { status: "matched", hasMore: false, works: [{
      id: q, title: q, author: "Fixture artist", media, license: "CC BY 4.0", width: 640, height: 400,
      checkedAt: "2026-11-18T00:00:00Z", terms: q, thumbnail: "https://thumb.wikimedia.org/wikipedia/commons/Fixture.jpg",
      source: "https://commons.wikimedia.org/wiki/File:Fixture.jpg",
      licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
    }] } });
  });
  await page.route("**/api/lyrics", (route) => {
    inputs.push(route.request().postDataJSON());
    return route.fulfill({ json: { directions: [
      { photo: "rain window", illustration: "rain" }, { photo: "porch light", illustration: "doorway" },
    ] } });
  });
  await page.goto("/");
  await page.getByRole("textbox", { name: "歌名" }).fill("晴天 — 周杰倫");
  await page.getByRole("button", { name: "搜尋", exact: true }).click();
  await expect(page.getByRole("heading", { name: /^晴天.*周杰倫/ })).toBeVisible();
  await page.getByRole("button", { name: "更換歌曲" }).click();
  await expect(page.getByRole("button", { name: /晴天 — 試作藝人/ })).toBeVisible();
  await page.keyboard.press("Escape");
  await page.getByRole("textbox", { name: "你提供的歌詞" }).fill(lyrics);
  const submit = page.getByRole("button", { name: "用 AI 找圖" });
  await expect(submit).toBeDisabled();
  expect(inputs).toEqual([]);
  expect(images).toEqual([]);
  await page.getByRole("checkbox").check();
  await page.screenshot({ path: info.outputPath("cloud-consent.png") });
  await submit.click();
  await expect(page.getByRole("button", { name: "預覽 rain window" })).toBeVisible();
  expect(inputs).toEqual([{ lyrics, authorized: true }]);
  expect(images).toEqual(["rain window", "porch light"]);
  await page.getByRole("tab", { name: "插畫" }).click();
  const card = page.getByRole("button", { name: "預覽 doorway" });
  await expect(card).toBeVisible();
  expect(images).toEqual(["rain window", "porch light", "rain", "doorway"]);
  expect(inputs).toHaveLength(1);
  await card.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(card).toBeFocused();
  await page.screenshot({ path: info.outputPath("cloud-results.png") });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
