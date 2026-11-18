import { randomUUID } from "node:crypto";
import { isAbsolute } from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { lyricsMaxLength } from "@/lib/ai-lyrics";
import { analyzeLyrics, cloudLyricsOrigin, groqKey } from "@/lib/providers/groq";
import { SearchError } from "@/lib/providers/http";
import { SearchBudget } from "@/lib/search-budget";
import { setVisitor, visitorIdentity } from "@/lib/visitor-session";

export const runtime = "nodejs";
const form = z.object({ lyrics: z.string().trim().min(1).max(lyricsMaxLength), authorized: z.literal(true) }).strict();
let budget: SearchBudget | undefined;

async function readLyrics(request: NextRequest) {
  const reader = request.body?.getReader();
  if (!reader) return;
  const decoder = new TextDecoder("utf-8", { fatal: true });
  let bytes = 0;
  let text = "";
  let expired = false;
  const timer = setTimeout(() => { expired = true; void reader.cancel().catch(() => {}); }, 4000);
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) return expired ? undefined : form.safeParse(JSON.parse(text + decoder.decode()));
      bytes += value.byteLength;
      if (bytes > 25_000) return;
      text += decoder.decode(value, { stream: true });
    }
  } finally {
    clearTimeout(timer);
    void reader.cancel().catch(() => {});
  }
}

export async function POST(request: NextRequest) {
  const headers = { "Cache-Control": "private, no-store" };
  const fail = (error: string, status: number) => NextResponse.json({ error }, { status, headers });
  const token = groqKey();
  const path = process.env.MUPHO_SEARCH_DB;
  const secret = process.env.MUPHO_SESSION_SECRET;
  if (!token || !path || !isAbsolute(path) || !secret || secret.length < 32) return fail("disabled", 503);
  if (request.headers.get("origin") !== cloudLyricsOrigin() || request.headers.get("sec-fetch-site") !== "same-origin" ||
      !/^application\/json(?:;|$)/i.test(request.headers.get("content-type") ?? "")) return fail("invalid", 400);
  const { visitor, network } = visitorIdentity(request, secret);
  const parsed = await readLyrics(request).catch(() => undefined);
  if (!parsed?.success) return fail("invalid", 400);
  try {
    budget ??= new SearchBudget(path);
    const directions = await budget.run("lyrics", visitor, null, randomUUID(),
      () => analyzeLyrics(parsed.data.lyrics, token, request.signal), network);
    return setVisitor(NextResponse.json({ directions }, { headers }), request, visitor, secret);
  } catch (error) {
    const code = error instanceof SearchError ? error.code : "offline";
    return setVisitor(fail(code, ["upstream_limited", "limited", "busy"].includes(code) ? 429 : 503), request, visitor, secret);
  }
}
