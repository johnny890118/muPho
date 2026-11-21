import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { DatabaseSync } from "node:sqlite";
import { NextRequest } from "next/server";
import { POST } from "../app/api/lyrics/route";
import { analyzeLyrics, type LyricsDiagnostic } from "../lib/providers/groq";

const result = { primary: { photo: "rain window", illustration: "rain" }, secondary: { photo: "porch light", illustration: "lit doorway" } };
const choice = (content: object) => Response.json({ choices: [{ finish_reason: "stop", message: { content: JSON.stringify(content) } }] });

test("Groq output is data-only and rejects invalid or duplicate phrases without retries", async (t) => {
  const mock = t.mock.method(globalThis, "fetch", async (url: string, init: RequestInit) => {
    assert.equal(url, "https://api.groq.com/openai/v1/chat/completions");
    assert.equal(init.redirect, "error");
    const body = JSON.parse(String(init.body));
    assert.equal(body.model, "openai/gpt-oss-20b");
    assert.equal(body.include_reasoning, false);
    assert.equal(body.response_format.json_schema.strict, true);
    assert.deepEqual(JSON.parse(body.messages[1].content), { lyrics: "fixture lyrics" });
    return choice(result);
  });
  const diagnostics: LyricsDiagnostic[] = [];
  assert.deepEqual(await analyzeLyrics("fixture lyrics", "key", undefined, (event) => diagnostics.push(event)),
    [result.primary, result.secondary]);
  assert.equal(diagnostics[0].status, 200);
  assert.equal(diagnostics[1].finishReason, "stop");
  assert.ok(!JSON.stringify(diagnostics).includes("fixture lyrics"));
  mock.mock.mockImplementation(async () => choice({ ...result, secondary: { ...result.secondary, photo: "the rainy glass window" } }));
  await assert.rejects(analyzeLyrics("fixture lyrics", "key"), { code: "offline" });
  mock.mock.mockImplementation(async () => new Response(null, { status: 429, headers: { "Retry-After": "75" } }));
  await assert.rejects(analyzeLyrics("fixture lyrics", "key"), { code: "upstream_limited", retrySeconds: 75 });
  assert.equal(mock.mock.callCount(), 3);
});

test("lyrics requests require opt-in and shared hard quota, without persisting input or output", async (t) => {
  const dir = mkdtempSync(join(tmpdir(), "mupho-groq-test-"));
  const path = join(dir, "budget.sqlite");
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const names = { MUPHO_ENABLE_SEARCH: "1", MUPHO_GROQ_FREE_ZDR: "1", GROQ_API_KEY: "gsk_fixture", MUPHO_GROQ_ORIGIN: "http://127.0.0.1:3174", MUPHO_SEARCH_DB: path,
    MUPHO_SESSION_SECRET: "secret-with-at-least-thirty-two-characters" };
  for (const [name, value] of Object.entries(names)) {
    const old = process.env[name];
    t.after(() => { if (old === undefined) delete process.env[name]; else process.env[name] = old; });
    process.env[name] = value;
  }
  const origin = "http://127.0.0.1:3174";
  const request = (lyrics: string, authorized = true, from = origin, cookie = "") => new NextRequest(origin + "/api/lyrics", {
    method: "POST", headers: { origin: from, "sec-fetch-site": "same-origin", "content-type": "application/json", cookie },
    body: JSON.stringify({ lyrics, authorized }),
  });
  const upstream = t.mock.method(globalThis, "fetch", async () => choice(result));
  assert.equal((await POST(request("valid", false))).status, 400);
  assert.equal((await POST(request("valid", true, "https://foreign.example"))).status, 400);
  assert.equal((await POST(request("🙂".repeat(15_000)))).status, 400);
  let now = 3_600_000;
  t.mock.method(Date, "now", () => now);
  const first = await POST(request("authorized private lyrics"));
  assert.equal(first.status, 200);
  assert.equal(first.headers.get("cache-control"), "private, no-store");
  assert.deepEqual(await first.json(), { directions: [result.primary, result.secondary] });
  const cookie = first.headers.get("set-cookie")!.split(";")[0];
  for (let index = 1; index < 12; index++) {
    now += 60_000;
    assert.equal((await POST(request("authorized private lyrics", true, origin, index === 1 ? cookie : ""))).status, 200);
    if (index === 1) {
      now += 60_000;
      assert.equal((await POST(request("private", true, origin, cookie))).status, 429);
    }
  }
  now += 60_000;
  assert.equal((await POST(request("private"))).status, 429);
  assert.equal(upstream.mock.callCount(), 12);
  const db = new DatabaseSync(path, { readOnly: true });
  assert.equal(db.prepare("SELECT count(*) AS total FROM cache").get()?.total, 0);
  db.close();
});
