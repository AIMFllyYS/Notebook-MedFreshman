import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { readQuiz } from "@/lib/content/loader";

export const runtime = "nodejs";

/**
 * 读取某章节的题目测试数据。
 *
 * 路由：GET /api/quiz?subjectId=modern-history&chapterId=ch01
 *
 * - 命中：{ quiz: QuizData }
 * - 该章节未生成题目：404 { quiz: null }
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const subjectId = searchParams.get("subjectId") ?? "";
  const chapterId = searchParams.get("chapterId") ?? "";

  const quiz = readQuiz(subjectId, chapterId);
  if (!quiz) {
    return NextResponse.json({ quiz: null }, { status: 404 });
  }
  return NextResponse.json({ quiz });
}
