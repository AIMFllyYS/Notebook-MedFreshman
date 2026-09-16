import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { isSubjectId } from "@/lib/types/content";
import { clampSearchQuery } from "@/lib/search/globalSearch";
import { searchSubjectBody } from "@/lib/search/bodySearch";

export const runtime = "nodejs";

/**
 * 全局搜索正文分片：一次只扫一个科目，避免一次扫爆全库。
 * 客户端按学年优先顺序逐科请求，边搜边出结果。
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = clampSearchQuery(searchParams.get("q") ?? "");
  const subjectId = searchParams.get("subjectId") ?? "";
  if (!query) return NextResponse.json({ subjectId, hits: [] });
  if (!isSubjectId(subjectId)) {
    return NextResponse.json({ error: "invalid subjectId", hits: [] }, { status: 400 });
  }
  return NextResponse.json({ subjectId, hits: searchSubjectBody(subjectId, query) });
}
