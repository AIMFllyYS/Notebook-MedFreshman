import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { readSectionMarkdown } from "@/lib/content/loader";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const chapterId = searchParams.get("chapterId") ?? "";
  const sectionId = searchParams.get("sectionId") ?? "";
  const content = readSectionMarkdown(chapterId, sectionId);
  return NextResponse.json({ content });
}
