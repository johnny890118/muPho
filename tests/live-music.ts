import { parseArgs } from "node:util";
import { setTimeout as wait } from "node:timers/promises";
import { findTracks } from "../lib/providers/musicbrainz";
import { canonicalQuery, describeTrack, songIntents } from "../lib/song-intents";

async function main() {
  const { values } = parseArgs({ options: { from: { type: "string" }, count: { type: "string" } } });
  const from = Number(values.from ?? 1);
  const count = Number(values.count ?? songIntents.length - from + 1);
  if (!Number.isInteger(from) || !Number.isInteger(count) || from < 1 || count < 1 || from + count - 1 > songIntents.length) {
    console.error("Usage: npm run test:live -- [--from <1–24>] [--count <remaining cases>]");
    process.exitCode = 2;
    return;
  }
  const selected = [...songIntents.entries()].slice(from - 1, from + count - 1);
  let passes = 0;
  for (const [index, [title, artist]] of selected) {
    const alternate = index === 0 ? "Qing Tian" : index === 12 ? "Yoru ni Kakeru" : index === 18 ? "Spring Day" : title;
    const query = canonicalQuery(`${alternate} — ${artist}`);
    try {
      const tracks = await findTracks(query, "MuPho/0.2 (https://github.com/johnny890118/muPho)");
      const equal = (a: string, b: string) => a.normalize("NFKC").toLowerCase() === b.normalize("NFKC").toLowerCase();
      const match = tracks.find((track) => equal(track.title, title) && equal(track.artist, artist));
      const mode = match && describeTrack(match);
      console.log(`${index + 1}. ${title} — ${artist}\t${match ? `match ${tracks.indexOf(match) + 1}/${tracks.length} ${mode?.mode}` : `MISS ${tracks.slice(0, 2).map((track) => `${track.title} / ${track.artist}`).join("; ")}`}`);
      if (match) passes++;
    } catch (error) {
      console.log(`${index + 1}. ${title} — ${artist}\t${error instanceof Error ? error.message : "error"}`);
      // Stop on upstream errors instead of continuing through a possible request limit.
      break;
    }
    await wait(1200);
  }
  console.log(`${passes}/${selected.length} (cases ${from}–${from + count - 1})`);
  process.exitCode = passes === selected.length ? 0 : 1;
}

void main();
