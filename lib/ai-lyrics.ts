import { z } from "zod";

export const lyricsMaxLength = 6000;
const keywords = z.string().trim().toLowerCase().max(42).regex(/^[a-z]+(?: [a-z]+){0,2}$/);
export const directionSchema = z.object({ photo: keywords, illustration: keywords }).strict();
export const directionsSchema = z.tuple([directionSchema, directionSchema]).refine(
  ([a, b]) => a.photo !== b.photo && a.illustration !== b.illustration,
);
export type Directions = z.infer<typeof directionsSchema>;
