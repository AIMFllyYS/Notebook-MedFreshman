import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

export const runtime = "nodejs";

const EXAMPLES_ROOT = path.join(process.cwd(), "content", "examples");

export interface ExampleMeta {
  id: string;
  title: string;
  content: string;
}

/**
 * 列出某小节下的所有例题。
 *
 * 路由：GET /api/examples?chapterId=ch01&sectionId=1.1[&subjectId=chemistry]
 *
 * 路径规则（学科命名空间，防多科 chapterId 冲突）：
 * - 概率论（subjectId 缺省或为 probability）：content/examples/{chapterId}/{sectionId}/（兼容旧路径）
 * - 其他学科：content/examples/{subjectId}/{chapterId}/{sectionId}/
 *
 * 返回 [{ id, title, content }] 列表，按文件名排序。
 * title 提取规则：:::example{label=...} > 第一个 # 标题 > 文件名（去扩展名）。
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const chapterId = searchParams.get("chapterId") ?? "";
  const sectionId = searchParams.get("sectionId") ?? "";
  const subjectId = searchParams.get("subjectId") ?? "";

  if (!chapterId || !sectionId) {
    return NextResponse.json({ examples: [] });
  }

  const dir =
    subjectId && subjectId !== "probability"
      ? path.join(EXAMPLES_ROOT, subjectId, chapterId, sectionId)
      : path.join(EXAMPLES_ROOT, chapterId, sectionId);
  let files: string[] = [];
  try {
    files = fs
      .readdirSync(dir)
      .filter((f) => f.endsWith(".md"))
      .sort();
  } catch {
    // 目录不存在视为无例题
    return NextResponse.json({ examples: [] });
  }

  const examples: ExampleMeta[] = files.map((file) => {
    const fullPath = path.join(dir, file);
    const content = fs.readFileSync(fullPath, "utf8");
    // title 提取优先级：1) :::example{label=...} 的 label；2) 第一个 # 标题；3) 文件名
    let title: string;
    const exampleLabelMatch = content.match(/:::example\{label=([^}]+)\}/);
    const titleMatch = content.match(/^#\s+(.+)$/m);
    if (exampleLabelMatch) {
      title = exampleLabelMatch[1].trim();
    } else if (titleMatch) {
      title = titleMatch[1].trim();
    } else {
      title = file.replace(/\.md$/, "");
    }
    const id = file.replace(/\.md$/, "");
    return { id, title, content };
  });

  return NextResponse.json({ examples });
}
