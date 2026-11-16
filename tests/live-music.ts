import { setTimeout as wait } from "node:timers/promises";
import { findTracks } from "../lib/providers/musicbrainz";
import { canonicalQuery, describeTrack, songIntents } from "../lib/song-intents";

async function main() {
  let passes = 0;
  for (const [index, [title, artist]] of songIntents.entries()) {
    const alternate = index === 0 ? "Qing Tian" : index === 12 ? "Yoru ni Kakeru" : index === 18 ? "Spring Day" : title;
    const query = canonicalQuery(`${alternate} — ${artist}`);
    try {
      const tracks = await findTracks(query, "MuPho/0.2 (https://github.com/johnny890118/muPho)");
      const equal = (a: string, b: string) => a.normalize("NFKC").toLowerCase() === b.normalize("NFKC").toLowerCase();
      const match = tracks.find((track) => equal(track.title, title) && equal(track.artist, artist));
      const mode = match && describeTrack(match);
      console.log(`${title} — ${artist}\t${match ? `match ${tracks.indexOf(match) + 1}/${tracks.length} ${mode?.mode}` : `MISS ${tracks.slice(0, 2).map((track) => `${track.title} / ${track.artist}`).join("; ")}`}`);
      if (match) passes++;
    } catch (error) {
      console.log(`${title} — ${artist}\t${error instanceof Error ? error.message : "error"}`);
      // Stop on upstream errors instead of continuing through a possible request limit.
      break;
    }
    await wait(1200);
  }
  console.log(`${passes}/${songIntents.length}`);
  process.exitCode = passes === songIntents.length ? 0 : 1;
}

void main();
