import type { Work } from "./search-types";

const stopWords = new Set(["a", "an", "at", "in", "of", "on", "the", "by", "for", "and"]);
function tokens(text: string) {
  return new Set((text.normalize("NFKC").toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [])
    .filter((word) => !stopWords.has(word))
    .map((word) => /^\p{Script=Latin}{4,}s$/u.test(word) ? word.slice(0, -1) : word));
}

export function matchesIllustrationSubject(query: string, labels: string) {
  const words = tokens(query);
  const evidence = tokens(labels);
  return [...words].every((word) => evidence.has(word)
    || (/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/u.test(word)
      && [...evidence].some((label) => label.includes(word))));
}

export function rankWorks(works: Work[], query: string) {
  const keywords = tokens(query);
  const relevance = works.map((work, index) => {
    const title = tokens(work.title);
    const terms = tokens(work.terms);
    const score = [...keywords].reduce((total, word) => total + (title.has(word) ? 3 : terms.has(word) ? 1 : 0), 0);
    return { work, score, index };
  }).sort((a, b) => b.score - a.score || a.index - b.index);

  const authors = new Map<string, number>();
  return relevance.map((item) => {
    const author = item.work.author.toLowerCase();
    const repeated = authors.get(author) ?? 0;
    authors.set(author, repeated + 1);
    return { ...item, score: item.score - Math.min(repeated, 2) };
  }).sort((a, b) => b.score - a.score).map(({ work }) => work);
}
