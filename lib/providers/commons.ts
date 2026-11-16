import { z } from "zod";
import type { Media, Work } from "@/lib/search-types";
import { providerJson, SearchError } from "./http";

const pageSchema = z.object({
  pageid: z.number().int(), title: z.string(), index: z.number().optional(),
  categories: z.array(z.object({ title: z.string() })).default([]),
  imageinfo: z.array(z.object({
    mime: z.string(), thumburl: z.string(), thumbwidth: z.number().int().positive(), thumbheight: z.number().int().positive(),
    descriptionurl: z.string(), metadata: z.array(z.object({ name: z.string(), value: z.unknown() })).optional(), extmetadata: z.record(z.string(), z.object({ value: z.string() })),
  })),
});
const responseSchema = z.object({
  query: z.object({ pages: z.array(z.unknown()) }).optional(),
  error: z.object({ code: z.string(), lag: z.number().optional() }).optional(),
});
const strip = (value: string) => value.replace(/<[^>]*>/g, " ").replaceAll("&amp;", "&").replace(/\s+/g, " ").trim();
const illustration = /illustrat|drawings?|sketch|digital art|插畫|イラスト|일러스트/i;
const photo = /photo(?:graph)?|taken (?:with|on)|攝影|写真|사진/i;
const excludedArt = /oil painting|century painting|engravings?|coat of arms|logos?|icons?|ai.generated|midjourney|stable diffusion|dall.e|graphic symbols|infographics?|posters?|maps?|diagrams?|screenshots?|campaign|noirlab|technical drawing/i;
const licenses = {
  "CC BY 4.0": "https://creativecommons.org/licenses/by/4.0/",
  "CC0 1.0": "https://creativecommons.org/publicdomain/zero/1.0/",
} as const;
function cleanUrl(value: string, hosts: string[], prefix: string) {
  const url = URL.parse(value);
  if (!url || url.protocol !== "https:" || url.username || url.password || url.port ||
      !hosts.includes(url.hostname) || !url.pathname.startsWith(prefix)) return;
  url.search = "";
  url.hash = "";
  return url.href;
}

export function toWork(raw: unknown, media: Media, blocked: ReadonlySet<string>): Work | undefined {
  const page = pageSchema.safeParse(raw);
  if (!page.success) return;
  const { pageid, title, categories, imageinfo } = page.data;
  const image = imageinfo[0];
  if (!image || blocked.has(String(pageid)) || !["image/jpeg", "image/png", "image/webp"].includes(image.mime)) return;
  const meta = (key: string) => image.extmetadata[key]?.value ?? "";
  const license = meta("LicenseShortName");
  if (license !== "CC BY 4.0" && license !== "CC0 1.0") return;
  const licenseUrl = licenses[license];
  if (meta("LicenseUrl").replace(/\/?$/, "/") !== licenseUrl || meta("Restrictions").trim()) return;
  const author = strip(meta("Artist")).slice(0, 200);
  if (!author || /^(?:unknown|anonymous|n\/a|various|作者不明)$/i.test(author)) return;
  const name = title.replace(/^File:/, "");
  const terms = [name, strip(meta("ImageDescription")), ...categories.map((category) => category.title.slice(9))].join(" ");
  const camera = image.metadata?.some((item) => /^(?:Make|Model|LensModel|ExposureTime)$/i.test(item.name) && item.value);
  const evidence = photo.test(terms) || Boolean(camera);
  if (excludedArt.test(terms) || (media === "photo" ? !evidence || illustration.test(terms) : !illustration.test(terms) || evidence)) return;
  const thumbnail = cleanUrl(image.thumburl, ["upload.wikimedia.org", "thumb.wikimedia.org"], "/wikipedia/commons/");
  const source = cleanUrl(image.descriptionurl, ["commons.wikimedia.org"], "/wiki/File:");
  if (!thumbnail || !source) return;
  return { id: String(pageid), title: strip(meta("ObjectName") || name).slice(0, 180), author,
    thumbnail, source, width: image.thumbwidth, height: image.thumbheight, license, licenseUrl,
    checkedAt: new Date().toISOString(), media, terms: terms.slice(0, 320) };
}

const batchSize = 18;
export async function findWorks(query: string, media: Media, page: number, agent: string, blocked: ReadonlySet<string>) {
  const url = new URL("https://commons.wikimedia.org/w/api.php");
  const words = query.replace(/[^\p{L}\p{N}\s'-]/gu, " ").trim();
  if (!words) throw new SearchError("invalid");
  const medium = media === "photo" ? "" : "illustration";
  url.search = new URLSearchParams({
    action: "query", format: "json", formatversion: "2", generator: "search", maxlag: "5",
    gsrsearch: `${words} ${medium} filetype:bitmap incategory:${page === 9 ? "CC-Zero" : "CC-BY-4.0"}`, gsrnamespace: "6", gsrlimit: String(batchSize),
    gsroffset: String(page === 9 ? 0 : page * batchSize), prop: "imageinfo|categories", cllimit: "100",
    iiprop: "url|size|mime|metadata|extmetadata", iiurlwidth: "640",
    iiextmetadatafilter: "Artist|LicenseShortName|LicenseUrl|ObjectName|ImageDescription|Restrictions",
  }).toString();
  const result = responseSchema.safeParse(await providerJson(url, agent));
  if (!result.success || result.data.error) throw new SearchError("offline", 60);
  const raw = result.data.query?.pages ?? [];
  const pages = raw.map((item) => pageSchema.safeParse(item)).flatMap((item) => item.success ? [item.data] : []);
  const works = pages.sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
    .flatMap((item) => toWork(item, media, blocked) ?? []);
  const authors = new Map<string, number>();
  const ordered = works.map((work) => {
    const key = work.author.toLowerCase();
    const repetition = authors.get(key) ?? 0;
    authors.set(key, repetition + 1);
    return { work, repetition };
  }).sort((a, b) => a.repetition - b.repetition);
  return { works: ordered.map(({ work }) => work), hasMore: page === 8 || (raw.length === batchSize && page < 9) };
}
