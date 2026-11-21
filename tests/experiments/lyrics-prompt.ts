import { readFileSync } from "node:fs";
import { setTimeout as wait } from "node:timers/promises";
import development from "../fixtures/lyrics-holdout.json";
import final from "../fixtures/lyrics-final.json";
import { analyzeLyrics, groqKey, model, promptVersion } from "../../lib/providers/groq";
import { findWorks } from "../../lib/providers/commons";

async function main() {
  const [suite, version, id] = process.argv.slice(2);
  const samples = suite === "development" ? development : suite === "final" ? final : undefined;
  const sample = samples?.find((item) => item.id === id);
  const token = groqKey();
  const contact = process.env.MUPHO_PROVIDER_CONTACT;
  if (!sample || !token || !contact || !/^https:\/\/[^\s]+$/.test(contact) || !["v1", "a", "b"].includes(version)) {
    throw new Error("Set Free/ZDR configuration and contact, then choose development|final v1|a|b case-id.");
  }
  const productionFetch = globalThis.fetch;
  const prompt = version !== "v1"
    ? readFileSync(new URL(`./visual-scenes-${version}.txt`, import.meta.url), "utf8").trim() : undefined;
  // Only this CLI can substitute the prompt. The application has no experiment switch.
  globalThis.fetch = async (input, init) => {
    if (String(input) !== "https://api.groq.com/openai/v1/chat/completions") return productionFetch(input, init);
    const body = JSON.parse(String(init?.body));
    if (prompt) body.messages[0].content = prompt;
    const response = await productionFetch(input, { ...init, body: JSON.stringify(body) });
    if (!response.ok) {
      const data = await response.clone().json().catch(() => undefined);
      const code = data?.error?.code;
      if (typeof code === "string" && /^[a-zA-Z0-9_-]{1,80}$/.test(code)) {
        console.error(JSON.stringify({ id, version, providerError: code }));
      }
    }
    return response;
  };
  let directions;
  try {
    const started = performance.now();
    directions = await analyzeLyrics(sample.lyrics, token, undefined,
      (diagnostic) => console.error(JSON.stringify({ id, version, diagnostic })));
    console.log(JSON.stringify({ id, version, model, productionPrompt: promptVersion,
      expected: sample.expected, elapsedMs: Math.round(performance.now() - started), directions }));
  } finally {
    globalThis.fetch = productionFetch;
  }
  for (const media of ["photo", "illustration"] as const) {
    for (const [index, direction] of directions.entries()) {
      const batch = await findWorks(direction[media], media, 0, `MuPho/0.2 (${contact})`, new Set());
      console.log(JSON.stringify({ id, version, media, direction: index + 1, q: direction[media],
        count: batch.works.length, status: batch.status,
        top: batch.works.slice(0, 3).map(({ id, title, author, thumbnail, source, license }) =>
          ({ id, title, author, thumbnail, source, license })) }));
      await wait(1350);
    }
  }
}

void main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Experiment failed");
  process.exitCode = 1;
});
