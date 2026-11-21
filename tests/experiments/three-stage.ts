import { readFileSync } from "node:fs";
import { setTimeout as wait } from "node:timers/promises";
import { z } from "zod";
import samples from "../fixtures/lyrics-three-stage.json";
import { analyzeLyrics, groqKey, model } from "../../lib/providers/groq";
import { directionsSchema } from "../../lib/ai-lyrics";
import { findWorks } from "../../lib/providers/commons";

async function main() {
  const [version, id] = process.argv.slice(2);
  const sample = samples.find(s => s.id === id);
  const key = groqKey();
  if (!sample || !key || !["v1", "three", "diag-b768", "diag-b2048", "diag-simple"].includes(version)) throw Error("Invalid experiment configuration");
  const original = globalThis.fetch;
  let artifact: unknown;
  const string = { type: "string" };
  const view = { type: "object", required: ["scene", "photo", "illustration"], additionalProperties: false,
    properties: { scene: string, photo: string, illustration: string } };
  const schema = { type: "object", required: ["meaning", "primary", "secondary"], additionalProperties: false,
    properties: { meaning: string, primary: view, secondary: view } };
  globalThis.fetch = async (input, init) => {
    if (String(input) !== "https://api.groq.com/openai/v1/chat/completions") return original(input, init);
    const body = JSON.parse(String(init?.body));
    if (version === "three") {
      body.messages[0].content = readFileSync(new URL("./visual-three-stage.txt", import.meta.url), "utf8");
      body.response_format.json_schema.schema = schema;
      body.max_completion_tokens = 2048;
    } else if (version.startsWith("diag-b")) {
      body.messages[0].content = readFileSync(new URL("./visual-scenes-b.txt", import.meta.url), "utf8");
      body.max_completion_tokens = version === "diag-b768" ? 768 : 2048;
    } else if (version === "diag-simple") {
      body.messages[0].content = 'Return JSON primary and secondary, each photo and illustration. Set primary phrases to "rainy street" and secondary phrases to "empty station".';
    }
    const res = await original(input, { ...init, body: JSON.stringify(body) });
    if (!res.ok) {
      const data = await res.clone().json().catch(() => ({}));
      const failed = data.error?.failed_generation;
      let parseable = false;
      if (typeof failed === "string") { try { JSON.parse(failed); parseable = true; } catch {} }
      console.error(JSON.stringify({ id, version, status: res.status, code: data.error?.code,
        failedGenerationChars: typeof failed === "string" ? failed.length : undefined,
        failedGenerationJSON: parseable, budget: body.max_completion_tokens }));
    }
    if (res.ok && version === "three") {
      const data = await res.json();
      const result = z.object({ meaning: z.string().min(1).max(700), primary: z.object({ scene: z.string().min(1).max(300), photo: z.string(), illustration: z.string() }).strict(), secondary: z.object({ scene: z.string().min(1).max(300), photo: z.string(), illustration: z.string() }).strict() }).strict().parse(JSON.parse(data.choices[0].message.content));
      directionsSchema.parse([ {photo:result.primary.photo,illustration:result.primary.illustration}, {photo:result.secondary.photo,illustration:result.secondary.illustration} ]);
      artifact = result;
      data.choices[0].message.content = JSON.stringify({primary:{photo:result.primary.photo,illustration:result.primary.illustration},secondary:{photo:result.secondary.photo,illustration:result.secondary.illustration}});
      return new Response(JSON.stringify(data), {status:res.status, headers:res.headers});
    }
    return res;
  };
  let directions;
  try {
    directions = await analyzeLyrics(sample.lyrics, key, undefined, diagnostic => console.error(JSON.stringify({id,version,diagnostic})));
    console.log(JSON.stringify({id,version,model,expected:sample.expected,characters:sample.lyrics.length,artifact,directions}));
  } finally { globalThis.fetch = original; }
  if (version.startsWith("diag")) return;
  for (const media of ["photo", "illustration"] as const) for (const [i,d] of directions.entries()) {
    const batch = await findWorks(d[media],media,0,`MuPho/0.2 (${process.env.MUPHO_PROVIDER_CONTACT})`,new Set());
    console.log(JSON.stringify({id,version,media,direction:i+1,q:d[media],count:batch.works.length,status:batch.status,
      top:batch.works.slice(0,3).map(({id,title,author,thumbnail,source,license})=>({id,title,author,thumbnail,source,license}))}));
    await wait(1350);
  }
}
void main().catch((error:unknown)=> {console.error(error instanceof Error ? error.message : "Experiment failed");process.exitCode=1;});
