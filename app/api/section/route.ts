import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { readSectionMarkdown, readContentMarkdown } from "@/lib/content/loader";

export const runtime = "nodejs";

/**
 * 根据科目、分类和内容项 ID 读取对应内容文件。
 *
 * 首屏由 page.tsx 直接调用 readContentMarkdown 做 SSR；此路由仅作客户端回退
 * （以及兼容旧版 ?chapterId&sectionId 调用）。
 *
 * 支持两种调用方式：
 * 1. 新版：?subjectId=probability&categoryId=detail&itemId=1.1
 * 2. 兼容旧版：?chapterId=ch01&sectionId=1.1
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const subjectId = searchParams.get("subjectId");
  const categoryId = searchParams.get("categoryId");
  const itemId = searchParams.get("itemId");

  // 新版多科路由
  if (subjectId && categoryId && itemId) {
    const content = readContentMarkdown(subjectId, categoryId, itemId);
    return NextResponse.json({ content });
  }

  // 兼容旧版路由
  const chapterId = searchParams.get("chapterId") ?? "";
  const sectionId = searchParams.get("sectionId") ?? "";
  const content = readSectionMarkdown(chapterId, sectionId);
  return NextResponse.json({ content });
}
