import { normalize, type AnalysisMode, type Media, type Track } from "./search-types";

type SongIntent = readonly [title: string, artist: string, photo: string, photoFallback: string, illustration: string, illustrationFallback: string];

export const songIntents: readonly SongIntent[] = [
  ["晴天", "周杰倫", "school corridor", "schoolyard", "school classroom", "school"],
  ["稻香", "周杰倫", "rice fields", "rice paddy", "rice field", "countryside"],
  ["夜曲", "周杰倫", "rainy street", "night street", "night city", "night street"],
  ["小幸運", "田馥甄", "school courtyard", "schoolyard", "classroom sketch", "schoolyard"],
  ["突然好想你", "五月天", "empty train platform", "train platform", "railway station", "train"],
  ["十年", "陳奕迅", "old city street", "old street", "old street", "street"],
  ["Space Oddity", "David Bowie", "astronaut spacewalk", "astronaut", "astronaut", "space station"],
  ["Here Comes the Sun", "The Beatles", "spring sunrise", "sunrise", "sunrise", "dawn landscape"],
  ["Fast Car", "Tracy Chapman", "highway at night", "night road", "night road", "road"],
  ["Dreams", "Fleetwood Mac", "rain clouds", "storm clouds", "storm clouds", "rain"],
  ["Dreams", "The Cranberries", "wildflower meadow", "meadow", "flower meadow", "flowers"],
  ["Clair de lune", "Claude Debussy", "moonlight lake", "moon at night", "moonlit landscape", "moonlight"],
  ["夜に駆ける", "YOASOBI", "night rooftops", "city at night", "night rooftop", "night city"],
  ["アイドル", "YOASOBI", "stage spotlight", "stage lights", "stage lights", "stage performance"],
  ["Lemon", "米津玄師", "lemon still life", "lemon", "lemon fruit", "citrus fruit"],
  ["桜坂", "福山雅治", "cherry blossom street", "cherry blossoms", "cherry blossom", "cherry tree"],
  ["First Love", "宇多田ヒカル", "snowy train window", "winter railway", "winter train", "snow landscape"],
  ["Summer", "久石譲", "green meadow", "meadow", "summer landscape", "meadow"],
  ["봄날", "BTS", "train in snow", "winter railway", "winter train", "snowy landscape"],
  ["밤편지", "IU", "handwritten letter", "candlelight", "handwritten letter", "letter"],
  ["Through the Night", "IU", "handwritten letter", "candlelight", "handwritten letter", "letter"],
  ["좋은 날", "IU", "flower market street", "spring garden", "flowers in sunlight", "flowers"],
  ["벚꽃 엔딩", "Busker Busker", "cherry blossom street", "cherry blossoms", "cherry blossom", "cherry tree"],
  ["Hype Boy", "NewJeans", "neon dance floor", "neon lights", "neon dance", "neon lights"],
];

const aliases: Record<string, string> = {
  "ye ni kakeru": "夜に駆ける", "yoru ni kakeru": "夜に駆ける", "spring day": "봄날",
  "bam pyeonji": "밤편지", "dao xiang": "稻香", "qing tian": "晴天", "夜に駆ける (racing into the night)": "夜に駆ける",
};
const artistAliases: Record<string, string> = {
  "jay chou": "周杰倫", "周杰伦": "周杰倫", "周傑倫": "周杰倫",
  "busker busker": "버스커 버스커",
};
const key = (value: string) => normalize(value).toLowerCase();
function name(value: string, names: Record<string, string>) {
  const lookup = key(value);
  return Object.hasOwn(names, lookup) ? names[lookup] : normalize(value);
}
const titleName = (value: string) => name(value, aliases);
const artistName = (value: string) => name(value, artistAliases);

function creditedQuery(title: string, artist: string) {
  const creditedArtist = artistName(artist);
  const creditedTitle = titleName(title);
  if (key(creditedTitle) === "through the night" && key(creditedArtist) === "iu") return `밤편지 — ${creditedArtist}`;
  return `${creditedTitle} — ${creditedArtist}`;
}

export function canonicalQuery(query: string) {
  const normalized = normalize(query);
  const explicit = normalized.match(/^(.+?)(?:\s*[—–]\s*|\s+-\s+)(.+)$/);
  if (explicit) return creditedQuery(explicit[1], explicit[2]);

  // Compact separators are ambiguous in arbitrary song titles. Recognize only known title–artist pairs.
  for (const separator of normalized.matchAll(/[ -]+/g)) {
    const title = titleName(normalized.slice(0, separator.index));
    const artist = artistName(normalized.slice(separator.index + separator[0].length));
    if (songIntents.some(([name, credit]) => key(name) === key(title) && key(artistName(credit)) === key(artist))) {
      return creditedQuery(title, artist);
    }
  }
  return titleName(normalized);
}

export type VisualIntent = { mode: AnalysisMode; query: string; fallback?: string; curated: boolean };

export function describeTrack(track: Track, media: Media = "photo"): VisualIntent {
  const credit = key(creditedQuery(track.title, track.artist));
  const intent = songIntents.find(([title, artist]) => key(creditedQuery(title, artist)) === credit);
  if (!intent) return { mode: "metadata_only", query: track.title, curated: false };
  const [, , photo, photoFallback, illustration, illustrationFallback] = intent;
  return {
    mode: "metadata_only",
    query: media === "illustration" ? illustration : photo,
    fallback: media === "illustration" ? illustrationFallback : photoFallback,
    curated: true,
  };
}
