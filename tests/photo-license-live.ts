import { setTimeout as wait } from "node:timers/promises";
import { z } from "zod";
import { rankWorks } from "../lib/image-relevance";
import { findWorks } from "../lib/providers/commons";
import holdout from "./fixtures/photo-license-holdout.json";

const fixed = [
  "rainy window", "shoes at door", "stormy sea", "calm horizon", "open sea horizon",
  "dark harbor lights", "snowy train station", "snow on ticket", "empty alley streetlamp", "wet street friends",
];
const response = z.object({ query: z.object({ pages: z.array(z.object({
  pageid: z.number(), imageinfo: z.array(z.object({
    extmetadata: z.object({ ImageDescription: z.object({ value: z.string() }).optional() }),
  })).optional(),
})) }).optional() });

async function audit(q: string, agent: string) {
  const captions = new Map<string, string>();
  const upstream = globalThis.fetch;
  async function request(page: number, combined = false) {
    // This CLI executes sequentially. The interception is only for collecting captions
    // and testing category OR through the production validation pipeline.
    globalThis.fetch = async (input, init) => {
      const url = new URL(String(input));
      if (combined) {
        const search = url.searchParams.get("gsrsearch")!;
        url.searchParams.set("gsrsearch", search.replace("incategory:CC-BY-4.0", 'incategory:"CC-BY-4.0|CC-Zero"'));
      }
      const result = await upstream(url, init);
      if (result.ok) {
        const { query } = response.parse(await result.clone().json());
        for (const page of query?.pages ?? []) {
          const caption = page.imageinfo?.[0]?.extmetadata.ImageDescription?.value;
          if (caption) captions.set(String(page.pageid), caption.replace(/<[^>]*>/g, " ").replaceAll("&amp;", "&").replace(/\s+/g, " ").trim());
        }
      }
      return result;
    };
    try {
      const { works } = await findWorks(q, "photo", page, agent, new Set());
      await wait(1250);
      return works;
    } finally {
      globalThis.fetch = upstream;
    }
  }
  const by = await request(0);
  const cc0 = await request(9);
  const distinct = [...new Map([...by, ...cc0].map((work) => [work.id, work])).values()];
  const merged = rankWorks(distinct, q, captions);
  const union = await request(0, true);
  const summarize = (works: typeof by) => ({
    count: works.length,
    top: works.slice(0, 3).map(({ title, author, source, license, thumbnail }) => ({ title, author, source, license, thumbnail })),
  });
  return { by: summarize(by), cc0: summarize(cc0), merged: summarize(merged), union: summarize(union) };
}

async function main() {
  const suite = process.argv[2];
  if (suite !== "fixed" && suite !== "holdout") throw new Error("Choose fixed or holdout.");
  const contact = process.env.MUPHO_PROVIDER_CONTACT;
  if (!contact || !/^https:\/\/[^\s]+$/.test(contact)) throw new Error("Set MUPHO_PROVIDER_CONTACT to the HTTPS project or contact URL.");
  const rows = suite === "holdout" ? holdout : fixed.map((q) => ({ q }));
  const selected = process.argv[3] ? rows.filter(({ q }) => q === process.argv[3]) : rows;
  if (!selected.length) throw new Error("The query is not in the selected suite.");
  for (const row of selected) {
    console.log(JSON.stringify({ ...row, ...await audit(row.q, `MuPho/0.2 (${contact})`) }));
  }
}

void main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Photo audit failed");
  process.exitCode = 1;
});
