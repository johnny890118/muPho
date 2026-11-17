import assert from "node:assert/strict";
import { fork, type ChildProcess } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { test } from "node:test";
import { SearchBudget, limits } from "../lib/search-budget";

const hour = 3_600_000;
const timestamp = 12 * hour;

function worker(file: string, visitor: string, key: string, time: number, hold = false) {
  const child = fork(join(process.cwd(), "tests/fixtures/search-budget-worker.ts"), [
    file, visitor, key, String(time), String(hold),
  ], { execArgv: ["--import", "tsx"], stdio: ["ignore", "ignore", "inherit", "ipc"] });
  const started = new Promise<void>((resolve) => child.on("message", (message) => {
    if (message === "upstream") resolve();
  }));
  const messages: unknown[] = [];
  child.on("message", (message) => messages.push(message));
  const done = new Promise<unknown[]>((resolve, reject) => {
    child.once("error", reject);
    child.once("exit", (code, signal) => {
      if (code === 0) resolve(messages);
      else reject(new Error(`Worker ended with ${code ?? signal}`));
    });
  });
  return { child, started, done };
}

test("site and visitor limits are shared by independent SQLite processes", { timeout: 12_000 }, async () => {
  const directory = mkdtempSync(join(tmpdir(), "mupho-process-"));
  const children: ChildProcess[] = [];
  function start(file: string, visitor: string, key: string, time: number, hold = false) {
    const result = worker(file, visitor, key, time, hold);
    children.push(result.child);
    return result;
  }

  try {
    for (const [scope, cap] of [["site-hour", limits.images.site], ["visitor:same", limits.images.visitor]] as const) {
      const file = join(directory, `${cap}.sqlite`);
      new SearchBudget(file).close();
      const seed = new DatabaseSync(file);
      seed.prepare("INSERT INTO counts VALUES (?, ?, ?)").run(`images:${scope}:12`, 13 * hour, cap - 1);
      seed.close();

      const first = start(file, "same", "first", timestamp, true);
      await Promise.race([first.started, first.done.then(() => { throw new Error("Upstream lock was not acquired"); })]);
      const other = start(file, "same", "other", timestamp + 1_100);
      assert.deepEqual(await other.done, ["busy"]);
      first.child.send("release");
      assert.deepEqual(await first.done, ["upstream", "ok"]);

      const atLimit = start(file, scope === "site-hour" ? "different" : "same", "uncached", timestamp + 1_200);
      assert.deepEqual(await atLimit.done, ["limited"]);
      const cache = start(file, "same", "first", timestamp + 1_300);
      assert.deepEqual(await cache.done, ["ok"]);
      if (scope === "visitor:same") {
        const different = start(file, "different", "fresh", timestamp + 1_400);
        assert.deepEqual(await different.done, ["upstream", "ok"]);
      }
    }
  } finally {
    for (const child of children) if (child.exitCode === null && child.signalCode === null) {
      await new Promise<void>((resolve) => { child.once("exit", () => resolve()); child.kill(); });
    }
    rmSync(directory, { recursive: true, force: true });
  }
});
