// [已废弃] 此端点已被内联流式方案取代。
// artifact 事件现在通过主 /api/chat SSE 流直接推送，不再需要独立 SSE 端点。
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json(
    { error: "This endpoint is deprecated. Artifact events are now inlined in /api/chat SSE stream." },
    { status: 410 },
  );
}
