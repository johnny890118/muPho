import { z } from "zod";
import { normalize, type Track } from "@/lib/search-types";
import { songIntents } from "@/lib/song-intents";
import { providerJson, SearchError } from "./http";

const responseSchema = z.object({
  recordings: z.array(z.object({
    id: z.uuid(), title: z.string(), score: z.number(), length: z.number().optional(),
    disambiguation: z.string().optional(),
    "artist-credit": z.array(z.object({ name: z.string(), joinphrase: z.string().optional() })),
    releases: z.array(z.object({ title: z.string() })).optional(),
  })),
});

export async function findTracks(query: string, agent: string): Promise<Track[]> {
  const [title, artist] = query.split(/\s+[—–-]\s+/, 2);
  const literal = (value: string) => value.replace(/[\\"]/g, "\\$&");
  const url = new URL("https://musicbrainz.org/ws/2/recording");
  const known = songIntents.filter(([name]) => name.toLowerCase() === title.toLowerCase()).map(([, name]) => name);
  const preferred = artist ? [] : known;
  const exactTitle = `recording:"${literal(title)}"`;
  const relevant = preferred.map((name) => `(${exactTitle} AND artist:"${literal(name)}")^12`);
  const expression = artist ? `${exactTitle} AND artist:"${literal(artist)}"` : [exactTitle, ...relevant].join(" OR ");
  url.search = new URLSearchParams({ query: expression, fmt: "json", limit: "18" }).toString();
  const result = responseSchema.safeParse(await providerJson(url, agent));
  if (!result.success) throw new SearchError("offline", 30);
  return result.data.recordings.sort((a, b) => {
    const exact = (value: string) => Number(normalize(value).toLowerCase() === title.toLowerCase());
    return exact(b.title) - exact(a.title) || b.score - a.score || (b.releases?.length ?? 0) - (a.releases?.length ?? 0);
  }).map((item) => ({
    id: item.id, title: item.title,
    artist: item["artist-credit"].map((credit) => credit.name + (credit.joinphrase ?? "")).join(""),
    album: item.releases?.[0]?.title, milliseconds: item.length, version: item.disambiguation,
  }));
}
