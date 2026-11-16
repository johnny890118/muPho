import { z } from "zod";
import { normalize, type Track } from "@/lib/search-types";
import { songIntents } from "@/lib/song-intents";
import { providerJson, SearchError } from "./http";

const recording = z.object({
  id: z.guid(), title: z.string(), score: z.number(), length: z.number().nullish(),
  disambiguation: z.string().nullish(),
  "artist-credit": z.array(z.object({ name: z.string(), joinphrase: z.string().nullish() })),
  releases: z.array(z.object({ title: z.string() })).nullish(),
});
const responseSchema = z.object({ recordings: z.array(z.unknown()) });

export async function findTracks(query: string, agent: string): Promise<Track[]> {
  const [title, artist] = query.split(/\s+[—–-]\s+/, 2);
  const literal = (value: string) => value.replace(/[\\"]/g, "\\$&");
  const url = new URL("https://musicbrainz.org/ws/2/recording");
  const known = songIntents.filter(([name]) => name.toLowerCase() === title.toLowerCase()).map(([, name]) => name);
  const preferred = artist ? [] : known;
  const exactTitle = `recording:"${literal(title)}"`;
  const relevant = preferred.map((name) => `(${exactTitle} AND artist:"${literal(name)}")^12`);
  const expression = artist ? `${exactTitle} AND artist:"${literal(artist)}"` : [exactTitle, ...relevant].join(" OR ");
  url.search = new URLSearchParams({ query: expression, fmt: "json", limit: artist ? "18" : "60" }).toString();
  const result = responseSchema.safeParse(await providerJson(url, agent));
  if (!result.success) throw new SearchError("offline", 30);
  const recordings = result.data.recordings.flatMap((value) => {
    const parsed = recording.safeParse(value);
    return parsed.success ? [parsed.data] : [];
  });
  if (!recordings.length && result.data.recordings.length) throw new SearchError("offline", 30);
  const exact = (value: string) => Number(normalize(value).toLowerCase() === title.toLowerCase());
  const ordered = recordings.sort((a, b) =>
    exact(b.title) - exact(a.title) || b.score - a.score || (b.releases?.length ?? 0) - (a.releases?.length ?? 0)
  ).map((item) => ({
    id: item.id, title: item.title,
    artist: item["artist-credit"].map((credit) => credit.name + (credit.joinphrase ?? "")).join(""),
    album: item.releases?.[0]?.title, milliseconds: item.length ?? undefined, version: item.disambiguation ?? undefined,
  }));
  if (artist) return ordered;
  const credits = new Map<string, number>();
  return ordered.map((track) => {
    const key = normalize(track.artist).toLowerCase();
    const repetition = credits.get(key) ?? 0;
    credits.set(key, repetition + 1);
    return { track, repetition };
  }).sort((a, b) => exact(b.track.title) - exact(a.track.title) || a.repetition - b.repetition)
    .slice(0, 18).map(({ track }) => track);
}
