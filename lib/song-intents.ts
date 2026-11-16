import { normalize, type Track } from "./search-types";

export const songIntents = [
  ["晴天", "周杰倫", "sunlight school bicycle"],
  ["稻香", "周杰倫", "rice fields sunset"],
  ["夜曲", "周杰倫", "night city shadows"],
  ["小幸運", "田馥甄", "schoolyard golden light"],
  ["突然好想你", "五月天", "empty train station"],
  ["十年", "陳奕迅", "old city street"],
  ["Space Oddity", "David Bowie", "moon space astronaut"],
  ["Here Comes the Sun", "The Beatles", "sunrise spring"],
  ["Fast Car", "Tracy Chapman", "night highway car"],
  ["Dreams", "Fleetwood Mac", "rain clouds"],
  ["Dreams", "The Cranberries", "wind meadow"],
  ["Clair de lune", "Claude Debussy", "moonlight lake"],
  ["夜に駆ける", "YOASOBI", "night rooftops city"],
  ["アイドル", "YOASOBI", "stage lights silhouette"],
  ["Lemon", "米津玄師", "lemon window light"],
  ["桜坂", "福山雅治", "cherry blossoms street"],
  ["First Love", "宇多田ヒカル", "train window snow"],
  ["Summer", "久石譲", "summer meadow sky"],
  ["봄날", "BTS", "winter train snow"],
  ["밤편지", "IU", "handwritten letter night"],
  ["Through the Night", "IU", "handwritten letter night"],
  ["좋은 날", "IU", "sunny street flowers"],
  ["벚꽃 엔딩", "Busker Busker", "cherry blossoms breeze"],
  ["Hype Boy", "NewJeans", "neon night dance"],
] as const;

const aliases: Record<string, string> = {
  "ye ni kakeru": "夜に駆ける", "yoru ni kakeru": "夜に駆ける", "spring day": "봄날",
  "bam pyeonji": "밤편지", "dao xiang": "稻香", "qing tian": "晴天", "夜に駆ける (racing into the night)": "夜に駆ける",
};
export function canonicalQuery(query: string) {
  const normalized = normalize(query);
  const [title, artist] = normalized.split(/\s+[—–-]\s+/, 2);
  const mapped = aliases[title.toLowerCase()] ?? title;
  return artist ? `${mapped} — ${artist}` : mapped;
}

export function describeTrack(track: Track) {
  const key = (value: string) => normalize(value).toLowerCase();
  const intents = songIntents.find(([title, artist]) => key(title) === key(track.title) && key(artist) === key(track.artist));
  return {
    mode: "metadata_only" as const,
    query: intents?.[2] ?? track.title,
    curated: Boolean(intents),
  };
}
