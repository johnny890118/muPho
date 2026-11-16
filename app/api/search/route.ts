import { createHash, randomUUID } from "node:crypto";
import { isAbsolute } from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { SearchBudget } from "@/lib/search-budget";
import { canonicalQuery } from "@/lib/song-intents";
import { searchSchema } from "@/lib/search-types";
import { SearchError } from "@/lib/providers/http";
import { findTracks } from "@/lib/providers/musicbrainz";
import { findWorks } from "@/lib/providers/commons";

export const runtime = "nodejs";
const cookieName = "mupho-session";
let budget: SearchBudget | undefined;

const statuses = { disabled: 503, invalid: 400, limited: 429, busy: 429, offline: 503 };

export async function GET(request: NextRequest) {
  const headers = { "Cache-Control": "private, no-store" };
  try {
    if (request.headers.get("sec-fetch-site") === "cross-site") throw new SearchError("invalid");
    const parsed = searchSchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
    if (!parsed.success) throw new SearchError("invalid");
    const path = process.env.MUPHO_SEARCH_DB;
    const contact = process.env.MUPHO_PROVIDER_CONTACT;
    if (process.env.MUPHO_ENABLE_SEARCH !== "1" || !path || !isAbsolute(path) ||
        !contact || !/^https:\/\/[^\s]+$/.test(contact)) throw new SearchError("disabled");
    budget ??= new SearchBudget(path);
    const params = parsed.data;
    const existing = request.cookies.get(cookieName)?.value;
    const visitor = existing && /^[a-f\d-]{36}$/.test(existing) ? existing : randomUUID();
    const blocked = new Set((process.env.MUPHO_BLOCKED_COMMONS_IDS ?? "").split(",").map((id) => id.trim()).filter(Boolean));
    const key = createHash("sha256").update(JSON.stringify(["v2", params, [...blocked]])).digest("hex");
    const agent = `MuPho/0.2 (${contact})`;
    const data = await budget.run<object>(params.kind, visitor, key, randomUUID(), async () =>
      params.kind === "tracks"
        ? { tracks: await findTracks(canonicalQuery(params.q), agent) }
        : findWorks(params.q, params.media, params.page, agent, blocked),
    );
    const response = NextResponse.json(data, { headers });
    response.cookies.set(cookieName, visitor, {
      httpOnly: true, sameSite: "lax", secure: request.nextUrl.protocol === "https:", path: "/", maxAge: 86400,
    });
    return response;
  } catch (error) {
    const failure = error instanceof SearchError ? error : new SearchError("offline", 30);
    return NextResponse.json({ error: failure.code }, {
      status: statuses[failure.code],
      headers: { ...headers, ...(failure.retrySeconds ? { "Retry-After": String(failure.retrySeconds) } : {}) },
    });
  }
}
