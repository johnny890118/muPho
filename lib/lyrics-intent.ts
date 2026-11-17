import type { VisualIntent } from "./song-intents";

export const lyricsMaxLength = 6000;

// Search terms in this dictionary are curated and are the only lyric-derived data sent to the search API.
const concepts = [
  ["rain", /\b(?:rain(?:ing|y|fall)?|drizzle)\b|雨|비가|빗방울|빗소리/u],
  ["window", /\bwindows?\b|窗|窓|창문/u],
  ["night", /\b(?:night|midnight|nightfall)\b|夜|한밤|밤에/u],
  ["sunset", /\b(?:sunset|dusk|twilight)\b|日落|夕陽|黄昏|黃昏|夕焼け|노을/u],
  ["sunrise", /\b(?:sunrise|dawn)\b|日出|破曉|夜明け|새벽/u],
  ["ocean", /\b(?:ocean|sea|shore|beach)\b|海岸|大海|海邊|浜辺|바다/u],
  ["train", /\b(?:trains?|railway)\b|火車|列車|電車|기차|열차/u],
  ["snow", /\b(?:snow(?:fall|y|ing)?|blizzard)\b|雪|눈이 내|눈보라/u],
  ["forest", /\b(?:forests?|woods)\b|森林|樹林|森|숲/u],
  ["street", /\b(?:streets?|alley|sidewalk)\b|街道|街頭|路地|거리|골목/u],
  ["moonlight", /\b(?:moon|moonlight)\b|月光|月亮|月明かり|달빛/u],
  ["mountains", /\bmountains?\b|山脈|高山|山々|산맥/u],
  ["flowers", /\b(?:flowers?|blossoms?)\b|花朵|花瓣|꽃/u],
  ["candlelight", /\b(?:candles?|candlelight)\b|燭光|蠟燭|蝋燭|촛불/u],
] as const;

export function deriveLyricsIntent(lyrics: string): VisualIntent | undefined {
  if (lyrics.length > lyricsMaxLength || !lyrics.trim()) return;
  const lines = [...new Set(lyrics.normalize("NFKC").toLowerCase().split(/\r\n?|\n/u)
    .map((line) => line.trim()).filter(Boolean))];
  const ranked = concepts.map(([term, pattern]) => ({
    term, count: lines.filter((line) => pattern.test(line)).length,
  })).filter(({ count }) => count > 0).sort((a, b) => b.count - a.count);
  if (!ranked.length) return;
  const [primary, alternate] = ranked;
  return {
    mode: "user_provided_lyrics",
    curated: false,
    query: [primary.term, alternate?.term].filter(Boolean).join(" "),
    ...(alternate ? { fallback: primary.term } : {}),
  };
}
