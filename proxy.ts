import { NextResponse, type NextRequest } from "next/server";
import { decideAiGate, PAID_AI_API_PATHS } from "@/lib/auth/aiGate";

/**
 * Next.js 16 request gate (formerly middleware.ts).
 * Blocks anonymous calls to paid AI routes. No desktop / BYOK bypass.
 */
export const config = {
  matcher: [...PAID_AI_API_PATHS],
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
