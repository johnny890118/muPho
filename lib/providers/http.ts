import type { SearchErrorCode } from "@/lib/search-types";

export class SearchError extends Error {
  constructor(readonly code: SearchErrorCode, readonly retrySeconds?: number) {
    super(code);
  }
}

export async function providerJson(url: URL, agent: string): Promise<unknown> {
  try {
    const response = await fetch(url, {
      headers: { "User-Agent": agent, Accept: "application/json" },
      cache: "no-store", redirect: "error", signal: AbortSignal.timeout(7500),
    });
    if (response.status === 429 || response.status >= 500) {
      const value = response.headers.get("retry-after");
      const seconds = value && /^\d+$/.test(value) ? Number(value) : value ? (Date.parse(value) - Date.now()) / 1000 : 0;
      throw new SearchError(response.status === 429 ? "limited" : "offline", Math.max(30, Math.ceil(seconds) || 0));
    }
    if (!response.ok) throw new SearchError("offline", 30);
    return await response.json();
  } catch (error) {
    if (error instanceof SearchError) throw error;
    throw new SearchError("offline", 30);
  }
}
