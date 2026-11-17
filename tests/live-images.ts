import { parseArgs } from "node:util";
import { setTimeout as wait } from "node:timers/promises";
import { findWorks } from "../lib/providers/commons";
import { SearchError } from "../lib/providers/http";
import { describeTrack, songIntents } from "../lib/song-intents";
import type { Media } from "../lib/search-types";

async function main() {
  const { values } = parseArgs({ options: {
    media: { type: "string", default: "both" },
    from: { type: "string", default: "1" },
    count: { type: "string" },
    cases: { type: "string" },
  } });
  const from = Number(values.from);
  const count = Number(values.count ?? songIntents.length - from + 1);
  const selected = values.cases?.split(",").map(Number);
  const media: Media[] = values.media === "both" ? ["photo", "illustration"] :
    values.media === "photo" || values.media === "illustration" ? [values.media] : [];
  if (selected?.some((i) => !Number.isInteger(i) || i < 1 || i > songIntents.length) || !media.length || !Number.isInteger(from) || !Number.isInteger(count) || from < 1 || count < 1 || from + count - 1 > songIntents.length) {
    console.error("Usage: npm run test:images:live -- [--media both|photo|illustration] [--from 1–24] [--count N] [--cases 1,4,8]");
    process.exitCode = 2;
    return;
  }

  const cache = new Map<string, Awaited<ReturnType<typeof findWorks>>>();
  const agent = "MuPho/0.2 (https://github.com/johnny890118/muPho)";
  async function request(query: string, kind: Media) {
    const key = JSON.stringify([query, kind]);
    const cached = cache.get(key);
    if (cached) return cached;
    const result = await findWorks(query, kind, 0, agent, new Set());
    cache.set(key, result);
    await wait(1350);
    return result;
  }
  for (const [index, [title, artist]] of songIntents.entries()) {
    if (selected ? !selected.includes(index + 1) : index < from - 1 || index >= from + count - 1) continue;
    for (const kind of media) {
      try {
        const intent = describeTrack({ id: "audit", title, artist }, kind);
        const first = await request(intent.query, kind);
        const query = !first.works.length && intent.fallback ? intent.fallback : intent.query;
        const result = query === intent.query ? first : await request(query, kind);
        console.log(JSON.stringify({ index: index + 1, title, artist, media: kind, query,
          status: result.status, count: result.works.length, top: result.works.slice(0, 3).map(({ title, source, thumbnail }) => ({ title, source, thumbnail })) }));
      } catch (error) {
        console.error(JSON.stringify({ index: index + 1, title, media: kind,
          error: error instanceof SearchError ? error.code : "unexpected", retrySeconds: error instanceof SearchError ? error.retrySeconds : undefined }));
        process.exitCode = 1;
        return;
      }
    }
  }
}

void main();
