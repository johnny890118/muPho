import { readFileSync } from "node:fs";
import { setTimeout as wait } from "node:timers/promises";
import { directionsSchema } from "../../lib/ai-lyrics";
import { findWorks } from "../../lib/providers/commons";

// Reuse saved model outputs so provider changes do not contaminate prompt comparisons.
async function main() {
  const file = process.argv[2];
  const contact = process.env.MUPHO_PROVIDER_CONTACT;
  if (!file || !contact || !/^https:\/\/[^\s]+$/.test(contact)) throw new Error("Supply a saved JSONL path and provider contact.");
  const raw = JSON.parse(readFileSync(file, "utf8").split("\n")[0]);
  const directions = directionsSchema.parse(raw.directions);
  console.log(JSON.stringify({ id: raw.id, model: raw.model, promptVersion: raw.promptVersion,
    directions, replay: true }));
  for (const media of ["photo", "illustration"] as const) {
    for (const [index, item] of directions.entries()) {
      const batch = await findWorks(item[media], media, 0, `MuPho/0.2 (${contact})`, new Set());
      console.log(JSON.stringify({ id: raw.id, media, direction: index + 1, q: item[media],
        count: batch.works.length, status: batch.status,
        top: batch.works.slice(0, 3).map(({ id, title, author, thumbnail, source, license }) =>
          ({ id, title, author, thumbnail, source, license })) }));
      await wait(1350);
    }
  }
}
void main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Image replay failed");
  process.exitCode = 1;
});
