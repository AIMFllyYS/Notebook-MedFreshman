import { NextResponse, type NextRequest } from "next/server";
import { decideAiGate } from "@/lib/auth/aiGate";

/**
 * Next.js 16 request gate (formerly middleware.ts).
 * Blocks anonymous calls to paid AI routes. No desktop / BYOK bypass.
 * Matcher must be a compile-time literal — Next cannot parse spreads or imports.
 */
export const config = {
  matcher: [
    "/api/chat",
    "/api/chat-title",
    "/api/artifact",
    "/api/document",
    "/api/canvas-revise",
    "/api/follow-ups",
    "/api/image-gen",
    "/api/record",
  ],
};

export async function proxy(request: NextRequest) {
  const decision = await decideAiGate({
    pathname: request.nextUrl.pathname,
    method: request.method,
    headers: request.headers,
  });
  if (decision.action === "next") return NextResponse.next();
  return NextResponse.json(decision.body, {
    status: decision.status,
    headers: decision.headers,
  });
}

export default proxy;
