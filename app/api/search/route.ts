import { createHash, randomUUID } from "node:crypto";
import { setVisitor, visitorIdentity } from "@/lib/visitor-session";
import { isAbsolute } from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { blockedCommonsIds } from "@/lib/commons-policy";
import { SearchBudget } from "@/lib/search-budget";
import { canonicalQuery } from "@/lib/song-intents";
import { searchSchema } from "@/lib/search-types";
import { SearchError } from "@/lib/providers/http";
import { findTracks } from "@/lib/providers/musicbrainz";
import { findWorks } from "@/lib/providers/commons";

export const runtime = "nodejs";
let budget: SearchBudget | undefined;

const statuses = { disabled: 503, invalid: 400, limited: 429, upstream_limited: 429, busy: 429, offline: 503 };

export async function GET(request: NextRequest) {
  const headers = { "Cache-Control": "private, no-store" };
  try {
    if (request.headers.get("sec-fetch-site") === "cross-site") throw new SearchError("invalid");
    const parsed = searchSchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
    if (!parsed.success) throw new SearchError("invalid");
    const path = process.env.MUPHO_SEARCH_DB;
    const contact = process.env.MUPHO_PROVIDER_CONTACT;
    const secret = process.env.MUPHO_SESSION_SECRET;
    if (process.env.MUPHO_ENABLE_SEARCH !== "1" || !path || !isAbsolute(path) ||
        !secret || secret.length < 32 || !contact || !/^https:\/\/[^\s]+$/.test(contact)) throw new SearchError("disabled");
    budget ??= new SearchBudget(path);
    const params = parsed.data.kind === "tracks"
      ? { ...parsed.data, q: canonicalQuery(parsed.data.q) }
      : parsed.data;
    const { visitor, network } = visitorIdentity(request, secret);
    const blocked = new Set(blockedCommonsIds());
    const key = createHash("sha256").update(JSON.stringify([params.kind === "tracks" ? "v5" : "v10", params, [...blocked]])).digest("hex");
    const agent = `MuPho/0.2 (${contact})`;
    const data = await budget.run<object>(params.kind, visitor, key, randomUUID(), async () =>
      params.kind === "tracks"
        ? { tracks: await findTracks(params.q, agent) }
        : findWorks(params.q, params.media, params.page, agent, blocked),
      network,
    );
    return setVisitor(NextResponse.json(data, { headers }), request, visitor, secret);
  } catch (error) {
    const failure = error instanceof SearchError ? error : new SearchError("offline", 30);
    return NextResponse.json({ error: failure.code }, {
      status: statuses[failure.code],
      headers: { ...headers, ...(failure.retrySeconds ? { "Retry-After": String(failure.retrySeconds) } : {}) },
    });
  }
}
