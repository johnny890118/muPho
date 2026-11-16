import { z } from "zod";
import { mediaSchema, type Track, type Work } from "./search-types";

const licenseUrls = {
  "CC BY 4.0": "https://creativecommons.org/licenses/by/4.0/",
  "CC0 1.0": "https://creativecommons.org/publicdomain/zero/1.0/",
} as const;

const favorite = z.object({
  id: z.string().regex(/^\d+$/), title: z.string().max(180), author: z.string().min(1).max(200),
  thumbnail: z.string().regex(/^https:\/\/(?:thumb|upload)\.wikimedia\.org\/wikipedia\/commons\//),
  source: z.string().regex(/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/),
  width: z.number().int().positive(), height: z.number().int().positive(),
  license: z.enum(["CC BY 4.0", "CC0 1.0"]), licenseUrl: z.string(),
  checkedAt: z.iso.datetime(), media: mediaSchema, terms: z.string().max(320),
}).refine((work) => licenseUrls[work.license] === work.licenseUrl);

export function readFavorites(raw: string | null) {
  const list: unknown = JSON.parse(raw ?? "[]");
  if (!Array.isArray(list)) return [];
  return list.slice(0, 200).flatMap((data) => {
    const parsed = favorite.safeParse(data);
    return parsed.success ? [parsed.data] : [];
  });
}

export function attribution(work: Work) {
  return `「${work.title}」\n📷 ${work.author} · Wikimedia Commons\n${work.source}\n${work.license} ${work.licenseUrl}\n作品未修改`;
}

export function shareText(work: Work, track?: Track) {
  return (track ? `🎧 ${track.title} — ${track.artist}\n\n` : "") + attribution(work);
}

const generic = new Set("photograph photo image jpg jpeg png webp digital illustration category commons pictures taken files license version the and with from that this were have".split(" "));
function tokens(work: Work) {
  return new Set((`${work.title} ${work.terms}`.toLowerCase().match(/[\p{L}]{3,}/gu) ?? []).filter((part) => !generic.has(part)));
}

export function similarWorks(reference: Work, works: Work[]) {
  const referenceTerms = tokens(reference);
  return works.filter((work) => work.id !== reference.id && work.media === reference.media)
    .map((work) => {
      const words = tokens(work);
      const shared = [...words].filter((term) => referenceTerms.has(term)).length;
      const aspect = Math.abs(Math.log(work.width / work.height / (reference.width / reference.height)));
      return { work, shared, score: shared / Math.sqrt(Math.max(1, words.size * referenceTerms.size)) - Math.min(aspect, 2) * 0.03 };
    })
    .filter(({ shared }) => shared > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ work }) => work);
}
