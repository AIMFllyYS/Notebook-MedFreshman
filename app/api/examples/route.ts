import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { readExamples, type ExampleMeta } from "@/lib/content/loader";

export const runtime = "nodejs";

// 类型对外保持原导出位置，避免破坏既有 import。
export type { ExampleMeta };

/**
 * 列出某小节下的所有例题。
 *
 * 路由：GET /api/examples?chapterId=ch01&sectionId=1.1[&subjectId=chemistry]
 *
 * 注意：例题现已在 page.tsx 服务端 SSR 预读（见 lib/content/loader.readExamples），
 * 本路由仅作为客户端回退 / 旧版兼容入口，读取逻辑与 SSR 完全共用。
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const chapterId = searchParams.get("chapterId") ?? "";
  const sectionId = searchParams.get("sectionId") ?? "";
  const subjectId = searchParams.get("subjectId") ?? "";

  const examples: ExampleMeta[] = readExamples(subjectId, chapterId, sectionId);
  return NextResponse.json({ examples });
}
