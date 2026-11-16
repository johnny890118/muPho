import type { ImageBatch } from "./search-types";

export async function fetchImageBatch(
  query: string,
  fallback: string | undefined,
  request: (query: string) => Promise<ImageBatch>,
) {
  const first = await request(query);
  if (first.works.length || !fallback || fallback === query) return { ...first, query };

  const second = await request(fallback);
  return { ...second, query: fallback, status: second.status === "empty" && first.status === "filtered" ? "filtered" as const : second.status };
}
