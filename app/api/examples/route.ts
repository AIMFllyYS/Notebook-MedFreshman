import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { readExamplesMeta, readExampleById, type ExampleListItem } from "@/lib/content/loader";

export type { ExampleListItem, ExampleDetail, ExampleMeta } from "@/lib/content/loader";

export const runtime = "nodejs";

/**
 * 列出某小节下的所有例题，或按 id 读取单题正文。
 *
 * GET /api/examples?chapterId=ch01&sectionId=1.1[&subjectId=chemistry][&id=ex-01]
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const chapterId = searchParams.get("chapterId") ?? "";
  const sectionId = searchParams.get("sectionId") ?? "";
  const subjectId = searchParams.get("subjectId") ?? "";
  const exampleId = searchParams.get("id");

  if (exampleId) {
    const example = readExampleById(subjectId, chapterId, sectionId, exampleId);
    if (!example) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    return NextResponse.json({ example });
  }

  const examples: ExampleListItem[] = readExamplesMeta(subjectId, chapterId, sectionId);
  return NextResponse.json({ examples });
}
