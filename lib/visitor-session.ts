import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { isIP } from "node:net";
import type { NextRequest, NextResponse } from "next/server";

const cookieName = "mupho-session";

function sign(secret: string, value: string) {
  return createHmac("sha256", secret).update(value).digest("hex");
}

function getVisitor(existing: string | undefined, secret: string) {
  const [id, signature] = existing?.split(".") ?? [];
  if (id && signature && /^[a-f\d-]{36}$/.test(id) && /^[a-f\d]{64}$/.test(signature) &&
      timingSafeEqual(Buffer.from(signature, "hex"), Buffer.from(sign(secret, id), "hex"))) return id;
  return randomUUID();
}

export function visitorIdentity(request: NextRequest, secret: string) {
  const visitor = getVisitor(request.cookies.get(cookieName)?.value, secret);
  const proxyHeader = process.env.MUPHO_TRUSTED_IP_HEADER;
  const ip = proxyHeader ? request.headers.get(proxyHeader) : null;
  return { visitor, network: ip && isIP(ip) ? sign(secret, `ip:${ip}`) : undefined };
}

export function setVisitor(response: NextResponse, request: NextRequest, visitor: string, secret: string) {
  response.cookies.set(cookieName, `${visitor}.${sign(secret, visitor)}`, {
    httpOnly: true, sameSite: "lax", secure: request.nextUrl.protocol === "https:", path: "/", maxAge: 86400,
  });
  return response;
}
