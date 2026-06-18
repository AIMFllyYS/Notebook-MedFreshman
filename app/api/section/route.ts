import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { readSectionMarkdown } from "@/lib/content/loader";
import type { SubjectId, CategoryId } from "@/lib/types/content";
import fs from "node:fs";
import path from "node:path";

export const runtime = "nodejs";

const CONTENT_ROOT = path.join(process.cwd(), "content", "chapters");

/**
 * 根据科目、分类和内容项 ID 读取对应内容文件。
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
    const content = readContentFile(
      subjectId as SubjectId,
      categoryId as CategoryId,
      itemId,
    );
    return NextResponse.json({ content });
  }

  // 兼容旧版路由
  const chapterId = searchParams.get("chapterId") ?? "";
  const sectionId = searchParams.get("sectionId") ?? "";
  const content = readSectionMarkdown(chapterId, sectionId);
  return NextResponse.json({ content });
}

/**
 * 根据科目、分类和内容项 ID 读取对应的 markdown 文件。
 * 
 * 对于 probability/detail 分类，映射到 content/chapters/ 下的文件。
 * 其他科目/分类暂返回 null，后续可扩展。
 */
function readContentFile(
  subjectId: SubjectId,
  categoryId: CategoryId,
  itemId: string,
): string | null {
  // 概率论详解：复用现有的 chapters 目录结构
  if (subjectId === "probability" && categoryId === "detail") {
    // itemId 如 "1.1" 需要映射到 chapterId 如 "ch01"
    const chapterMatch = itemId.match(/^(\d+)\./);
    if (chapterMatch) {
      const chapterNum = parseInt(chapterMatch[1]);
      const chapterId = `ch${String(chapterNum).padStart(2, "0")}`;
      return readSectionMarkdown(chapterId, itemId);
    }
    // 可能是章级别 id 如 "ch01"
    const chapterFile = path.join(CONTENT_ROOT, itemId, "index.md");
    try {
      return fs.readFileSync(chapterFile, "utf8");
    } catch {
      return null;
    }
  }

  // 其他科目/分类：尝试从 content/{subjectId}/{categoryId}/{itemId}.md 读取
  const genericPath = path.join(
    process.cwd(),
    "content",
    subjectId,
    categoryId,
    `${itemId}.md`,
  );
  try {
    return fs.readFileSync(genericPath, "utf8");
  } catch {
    return null;
  }
}
