import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { SearchBudget, limits } from "../lib/search-budget";
import { SearchError, providerJson } from "../lib/providers/http";
import { findTracks } from "../lib/providers/musicbrainz";
import { toWork } from "../lib/providers/commons";
import { canonicalQuery, describeTrack, songIntents } from "../lib/song-intents";
import { searchSchema } from "../lib/search-types";
import { attribution, readFavorites, similarWorks } from "../lib/work-actions";

const record = {
  pageid: 21, title: "File:Sunset by the coast.jpg", categories: [{ title: "Category:Coastal photographs" }],
  imageinfo: [{
    mime: "image/jpeg", thumbwidth: 640, thumbheight: 400,
    thumburl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/11/Test.jpg/640px-Test.jpg",
    descriptionurl: "https://commons.wikimedia.org/wiki/File:Test.jpg",
    extmetadata: {
      Artist: { value: "<a href='/wiki/Artist'>An Artist</a>" },
      LicenseShortName: { value: "CC BY 4.0" },
      LicenseUrl: { value: "https://creativecommons.org/licenses/by/4.0" },
    },
  }],
};

test("Commons validates attribution, source hosts, media and take-downs", () => {
  const work = toWork(record, "photo", new Set());
  assert.ok(work);
  assert.match(attribution(work), /An Artist[\s\S]*creativecommons\.org/);
  assert.equal(toWork(record, "illustration", new Set()), undefined);
  assert.equal(toWork(record, "photo", new Set(["21"])), undefined);
  const changed = structuredClone(record);
  changed.imageinfo[0].extmetadata.LicenseShortName.value = "CC BY-SA 4.0";
  assert.equal(toWork(changed, "photo", new Set()), undefined);
  changed.imageinfo[0].extmetadata.LicenseShortName.value = "CC BY 4.0";
  changed.imageinfo[0].thumburl = "https://upload.wikimedia.org.evil.example/wikipedia/commons/Test.jpg";
  assert.equal(toWork(changed, "photo", new Set()), undefined);
  assert.equal(readFavorites(JSON.stringify([work, { ...work, source: "javascript:alert(1)" }])).length, 1);
  assert.deepEqual(similarWorks(work, [{ ...work, id: "22" }]).map(({ id }) => id), ["22"]);
  assert.deepEqual(similarWorks(work, [work]), []);
});

test("validates and normalizes user input and labels all 24 title-based intents", () => {
  assert.equal(canonicalQuery(" Ｑｉｎｇ　Ｔｉａｎ — 周杰倫 "), "晴天 — 周杰倫");
  assert.equal(canonicalQuery("Yoru ni Kakeru — YOASOBI"), "夜に駆ける — YOASOBI");
  assert.equal(canonicalQuery("Spring Day — BTS"), "봄날 — BTS");
  assert.equal(searchSchema.safeParse({kind: "images", q: "bad", media: "svg", page: 0}).success, false);
  assert.equal(searchSchema.safeParse({kind: "tracks", q: "x".repeat(101)}).success, false);
  assert.equal(songIntents.length, 24);
  for (const [title, artist, photo, photoFallback, drawing, drawingFallback] of songIntents) {
    const track = { id: "fixture", title, artist };
    assert.deepEqual(describeTrack(track), { mode: "metadata_only", query: photo, fallback: photoFallback, curated: true });
    assert.deepEqual(describeTrack(track, "illustration"), { mode: "metadata_only", query: drawing, fallback: drawingFallback, curated: true });
  }
  assert.equal(describeTrack({id: "fixture", title: "Dreams", artist: "Unlisted cover"}).curated, false);
});

test("recording adapter accepts absent lengths and keeps distinct recordings", async (t) => {
  t.mock.method(globalThis, "fetch", async () => Response.json({ records: [], recordings: [
    { id: "10cd3bf5-a37e-4532-b914-c6a59a730781", title: "Dreams", score: 100, length: null, "artist-credit": [{ name: "Fleetwood Mac" }] },
    { id: "70cd3bf5-a37e-4532-b914-c6a59a730781", title: "Dreams", score: 100, length: 120000, "artist-credit": [{ name: "The Cranberries" }] },
  ] }));
  const tracks = await findTracks("Dreams", "MuPho test");
  assert.deepEqual(tracks.map(({ artist }) => artist), ["Fleetwood Mac", "The Cranberries"]);
  assert.equal(tracks[0].milliseconds, undefined);
});

test("provider failures propagate a typed cooldown", async (t) => {
  const url = new URL("https://commons.wikimedia.org/w/api.php");
  const fetchMock = t.mock.method(globalThis, "fetch", async () => new Response(null, { status: 429, headers: { "Retry-After": "75" } }));
  await assert.rejects(providerJson(url, "MuPho test"), { code: "upstream_limited", retrySeconds: 75 });
  fetchMock.mock.mockImplementation(async () => new Response(null, { status: 503 }));
  await assert.rejects(providerJson(url, "MuPho test"), { code: "offline", retrySeconds: 30 });
  fetchMock.mock.mockImplementation(async () => { throw new DOMException("test timeout", "TimeoutError"); });
  await assert.rejects(providerJson(url, "MuPho test"), { code: "offline", retrySeconds: 30 });
});

test("shared SQLite atomically caps calls across two connections and serves cache hits at the limit", async (t) => {
  const root = mkdtempSync(join(tmpdir(), "mupho-budget-"));
  const file = join(root, "shared.sqlite");
  const a = new SearchBudget(file);
  const b = new SearchBudget(file);
  t.after(() => { a.close(); b.close(); rmSync(root, { recursive: true, force: true }); });
  let now = 3_600_000;
  t.mock.method(Date, "now", () => now);
  let calls = 0;
  let release!: () => void;
  const wait = new Promise<void>((resolve) => { release = resolve; });
  const entry = a.run("tracks", "visitor", "first", "a", async () => { calls++; await wait; return 1; });
  try {
    await assert.rejects(b.run("tracks", "visitor", "first", "b", async () => { calls++; }), { code: "busy" });
  } finally {
    release();
  }
  assert.equal(await entry, 1);
  const perform = async () => ++calls;
  for (let index = 1; index < limits.tracks.site; index++) {
    now += 1200;
    const store = index % 2 ? a : b;
    if (index === limits.tracks.visitor) {
      await assert.rejects(store.run("tracks", "visitor", "over", "visitor", perform), { code: "limited" });
    }
    const visitor = index < limits.tracks.visitor ? "visitor" : String(index);
    await store.run("tracks", visitor, String(index), String(index), perform);
  }
  now += 1200;
  assert.equal(await b.run("tracks", "visitor", "first", "c", perform), 1);
  await assert.rejects(a.run("tracks", "other", "uncached", "d", perform), (error) => error instanceof SearchError && error.code === "limited");
  assert.equal(calls, limits.tracks.site);
});

test("known compact song credits share a canonical query without splitting arbitrary titles", () => {
  for (const input of ["晴天 — 周杰倫", "晴天-周杰倫", "晴天 周杰倫", "晴天－周杰伦", "晴天 — Jay Chou", "晴天—周傑倫"]) {
    assert.equal(canonicalQuery(input), "晴天 — 周杰倫");
  }
  assert.equal(canonicalQuery("晴天"), "晴天");
  assert.equal(canonicalQuery("Dreams"), "Dreams");
  assert.equal(canonicalQuery("T-Shirt"), "T-Shirt");
  assert.equal(canonicalQuery("constructor"), "constructor");
  assert.equal(canonicalQuery("Through the Night — IU"), "밤편지 — IU");
  assert.equal(canonicalQuery("Through the Night IU"), "밤편지 — IU");
  assert.equal(canonicalQuery("Through the Night — Other Artist"), "Through the Night — Other Artist");
  assert.equal(canonicalQuery("Through the Night"), "Through the Night");
  assert.equal(canonicalQuery("벚꽃 엔딩 — Busker Busker"), "벚꽃 엔딩 — 버스커 버스커");
  assert.equal(describeTrack({ id: "fixture", title: "벚꽃 엔딩", artist: "버스커 버스커" }).query, "cherry blossom street");
  assert.equal(canonicalQuery("Space Oddity — David Bowie"), "Space Oddity — David Bowie");
  assert.equal(canonicalQuery("夜に駆ける — YOASOBI"), "夜に駆ける — YOASOBI");
  assert.equal(canonicalQuery("봄날 — BTS"), "봄날 — BTS");
  const intent = describeTrack({ id: "fixture", title: "晴天", artist: "Jay Chou" });
  assert.equal(intent.query, "school corridor");
  assert.equal(intent.fallback, "schoolyard");
});

test("one fallback is allowed for an empty song image batch, not for upstream failure", async () => {
  const { fetchImageBatch } = await import("../lib/image-search");
  const photo = toWork(record, "photo", new Set());
  assert.ok(photo);
  const requested: string[] = [];
  const result = await fetchImageBatch("school corridor", "schoolyard", async (query) => {
    requested.push(query);
    return query === "schoolyard"
      ? { works: [photo], hasMore: true, status: "matched" }
      : { works: [], hasMore: false, status: "filtered" };
  });
  assert.deepEqual(requested, ["school corridor", "schoolyard"]);
  assert.equal(result.query, "schoolyard");
  assert.equal(result.works.length, 1);

  requested.length = 0;
  await assert.rejects(fetchImageBatch("school corridor", "schoolyard", async (query) => {
    requested.push(query);
    throw new SearchError("offline", 30);
  }), { code: "offline" });
  assert.deepEqual(requested, ["school corridor"]);
});

test("Commons distinguishes no upstream candidates from candidates rejected by policy", async (t) => {
  const { findWorks } = await import("../lib/providers/commons");
  const mock = t.mock.method(globalThis, "fetch", async () => Response.json({ batchcomplete: true }));
  const result = await findWorks("school corridor", "photo", 0, "MuPho test", new Set());
  assert.equal(result.status, "empty");
  mock.mock.mockImplementation(async () => Response.json({ query: { pages: [record] } }));
  assert.equal((await findWorks("school corridor", "illustration", 0, "MuPho test", new Set())).status, "filtered");
  assert.equal((await findWorks("school corridor", "photo", 0, "MuPho test", new Set())).status, "matched");
});

test("shared cooldown preserves an upstream outage separately from visitor and site quotas", async (t) => {
  const root = mkdtempSync(join(tmpdir(), "mupho-cooldown-"));
  const file = join(root, "shared.sqlite");
  const a = new SearchBudget(file);
  const b = new SearchBudget(file);
  t.after(() => { a.close(); b.close(); rmSync(root, { recursive: true, force: true }); });
  await assert.rejects(a.run("images", "first", "one", "a", async () => { throw new SearchError("offline", 45); }), { code: "offline" });
  await assert.rejects(b.run("images", "second", "two", "b", async () => assert.fail("cooldown must stop upstream calls")), { code: "offline" });
});

test("authorized lyrics yield only fixed imagery terms across four languages", async () => {
  const { deriveLyricsIntent, lyricsMaxLength } = await import("../lib/lyrics-intent");
  assert.deepEqual(deriveLyricsIntent("雨落在窗前\n窗邊等一封信\n雨落在窗前\n私密原文"), {
    mode: "user_provided_lyrics", curated: false, query: "window rain", fallback: "window",
  });
  assert.equal(deriveLyricsIntent("At midnight I counted the stars\nThe last train left")?.query, "night train");
  assert.equal(deriveLyricsIntent("窓に雪が舞う")?.query, "window snow");
  assert.equal(deriveLyricsIntent("새벽에 기차를 기다려")?.query, "sunrise train");
  assert.equal(deriveLyricsIntent("抽象抒情文字"), undefined);
  assert.equal(deriveLyricsIntent("雨".repeat(lyricsMaxLength + 1)), undefined);
});

test("Commons can reach CC0 after a short CC BY page without querying empty intermediate pages", async (t) => {
  const { findWorks } = await import("../lib/providers/commons");
  const queries: string[] = [];
  const cc0 = structuredClone(record);
  cc0.imageinfo[0].extmetadata.LicenseShortName.value = "CC0 1.0";
  cc0.imageinfo[0].extmetadata.LicenseUrl.value = "https://creativecommons.org/publicdomain/zero/1.0/";
  t.mock.method(globalThis, "fetch", async (url: URL) => {
    const query = url.searchParams.get("gsrsearch") ?? "";
    queries.push(query);
    const item = query.endsWith("CC-Zero") ? cc0 : record;
    return Response.json({ query: { pages: [item] } });
  });
  const first = await findWorks("coast", "photo", 0, "MuPho test", new Set());
  assert.equal(first.nextPage, 9);
  assert.equal(first.works[0].license, "CC BY 4.0");
  const second = await findWorks("coast", "photo", first.nextPage, "MuPho test", new Set());
  assert.equal(second.hasMore, false);
  assert.equal(second.works[0].license, "CC0 1.0");
  assert.match(queries[0], /incategory:CC-BY-4\.0$/);
  assert.match(queries[1], /incategory:CC-Zero$/);
});

test("illustrations need subject labels and reject research figures, while works rank by title evidence", async (t) => {
  const { findWorks } = await import("../lib/providers/commons");
  const { rankWorks } = await import("../lib/image-relevance");
  const base = toWork(record, "photo", new Set());
  assert.ok(base);
  const off = { ...base, id: "99", title: "A research trip", terms: "rain clouds" };
  assert.deepEqual(rankWorks([off, { ...base, title: "Rain clouds along the coast" }], "rain clouds").map(({ id }) => id), ["21", "99"]);

  const illustration = { ...record, title: "File:Railway station digital illustration.png", categories: [{ title: "Category:Digital illustrations" }] };
  const irrelevant = { ...illustration, pageid: 22, title: "File:Train schedule drawing.png" };
  const research = { ...illustration, pageid: 23, title: "File:Railway station exoplanet illustration.png" };
  t.mock.method(globalThis, "fetch", async () => Response.json({ query: { pages: [irrelevant, research, illustration] } }));
  const result = await findWorks("railway station", "illustration", 0, "MuPho test", new Set());
  assert.deepEqual(result.works.map(({ id }) => id), ["21"]);

  const scannedPainting = { ...record, title: "File:Rain.jpg", categories: [{ title: "Category:Paintings by Vincent van Gogh" }] };
  assert.equal(toWork(scannedPainting, "photo", new Set()), undefined);
});
