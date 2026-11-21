import { readFileSync } from "node:fs";
import { setTimeout as wait } from "node:timers/promises";
import { z } from "zod";
import { findWorks, toWork } from "../../lib/providers/commons";

const record = z.object({ version: z.string(), id: z.string(), output: z.array(z.unknown()) });
const saved = z.array(record).parse(JSON.parse(readFileSync("docs/verification/data/visual-prompt-experiment.json", "utf8")));
const output = z.object({ directions: z.array(z.object({photo:z.string()})).length(2) });
async function main() {
  const contact = process.env.MUPHO_PROVIDER_CONTACT;
  if (!contact || !/^https:\/\/[^\s]+$/.test(contact)) throw Error("Provider contact required");
  const original = globalThis.fetch;
  // These two complete lyrics were never used to change production ranking. Reuse V1 terms.
  for (const id of ["final-zh", "final-ja"]) {
    const sample = saved.find(x=>x.version === "v1" && x.id === id);
    const {directions} = output.parse(sample?.output[0]);
    for (const [index, direction] of directions.entries()) {
      let candidates: unknown[] = [];
      globalThis.fetch = async (input, init) => {
        const response = await original(input, init);
        if (String(input).startsWith("https://commons.wikimedia.org/w/api.php")) {
          const raw = await response.clone().json();
          candidates = raw.query?.pages ?? [];
        }
        return response;
      };
      try {
        const batch = await findWorks(direction.photo,"photo",0,`MuPho/0.2 (${contact})`,new Set());
        console.log(JSON.stringify({id,media:"photo",direction:index+1,q:direction.photo,works:batch.works,
          candidates:candidates.map(raw=>({raw, eligible: Boolean(toWork(raw,"photo",new Set()))}))},
          (key, value) => key === "metadata" && Array.isArray(value)
            ? value.filter((item: {name?: string}) => /^(?:LensModel|ExposureTime)$/i.test(item.name ?? "")) : value));
      } finally { globalThis.fetch=original; }
      await wait(1350);
    }
  }
}
void main().catch((error:unknown)=>{console.error(error instanceof Error ? error.message : "Pool audit failed");process.exitCode=1;});
