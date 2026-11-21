import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { setTimeout as wait } from "node:timers/promises";

// Explicit finite matrix. Each condition is one call, including failures. No retries.
const matrix = [
  ["diag-b768", "long-en"], ["diag-b2048", "long-en"], ["diag-simple", "long-en"],
  ["v1", "long-en"], ["three", "long-en"], ["v1", "turn-ja"], ["three", "turn-ja"],
  ["v1", "fresh-zh"], ["three", "fresh-zh"], ["v1", "fresh-ko"], ["three", "fresh-ko"],
];
async function main() {
  const [output] = process.argv.slice(2);
  if (!output) throw Error("Provide a new evidence directory; configure Free/ZDR environment first");
  const directory = resolve(output);
  // Refuse to overwrite a prior run or accidentally repeat its calls.
  mkdirSync(directory);
  for (const [version, id] of matrix) {
    const result = spawnSync(process.execPath, ["--import", "tsx", "tests/experiments/three-stage.ts", version, id],
      { env: process.env, encoding: "utf8", timeout: 120_000 });
    writeFileSync(resolve(directory, `${version}-${id}.jsonl`), result.stdout ?? "");
    writeFileSync(resolve(directory, `${version}-${id}.err`), result.stderr ?? "");
    console.log(JSON.stringify({version,id,status:result.status,error:result.error?.name}));
    await wait(32_000);
  }
}
void main().catch((error:unknown)=>{console.error(error instanceof Error ? error.message : "Experiment runner failed");process.exitCode=1;});
