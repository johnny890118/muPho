import { z } from "zod";

export type AnalysisMode = "full_lyrics" | "user_provided_lyrics" | "metadata_only" | "unavailable";
export const mediaSchema = z.enum(["photo", "illustration"]);
export type Media = z.infer<typeof mediaSchema>;
export const normalize = (text: string) => text.normalize("NFKC").trim().replace(/\s+/g, " ");
const term = z.string().max(240).transform(normalize).pipe(z.string().min(1).max(100));
export const searchSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("tracks"), q: term }),
  z.object({ kind: z.literal("images"), q: term, media: mediaSchema, page: z.coerce.number().int().min(0).max(9) }),
]);
export type Track = {
  id: string; title: string; artist: string; album?: string; milliseconds?: number; version?: string;
};
export type Work = {
  id: string; title: string; author: string; thumbnail: string; previewUrl?: string; source: string; width: number; height: number;
  license: "CC BY 4.0" | "CC0 1.0"; licenseUrl: string; checkedAt: string; media: Media; terms: string;
};
export type ImageBatch = { works: Work[]; hasMore: boolean; status: "matched" | "empty" | "filtered" };

export type SearchErrorCode = "disabled" | "invalid" | "limited" | "upstream_limited" | "busy" | "offline";
