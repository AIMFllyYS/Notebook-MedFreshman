import { notFound } from "next/navigation";
import type { SubjectId, CategoryId } from "@/lib/types/content";
import { getContentItem, getSubject, getCategory } from "@/content";
import { readContentMarkdown } from "@/lib/content/loader";
import ContentPageClient from "./ContentPageClient";

interface PageProps {
  params: Promise<{ subject: string; category: string; id: string }>;
}

const VALID_SUBJECTS = new Set<string>([
  "probability",
  "physics",
  "chemistry",
  "modern-history",
  "maogai",
  "other",
]);

const VALID_CATEGORIES = new Set<string>([
  "textbook",
  "detail",
  "recording",
  "summary",
]);

export default async function ContentPage({ params }: PageProps) {
  const { subject, category, id } = await params;

  // 校验科目与分类是否合法
  if (!VALID_SUBJECTS.has(subject) || !VALID_CATEGORIES.has(category)) {
    notFound();
  }

  const subjectData = getSubject(subject as SubjectId);
  const categoryData = getCategory(subject as SubjectId, category as CategoryId);
  const item = getContentItem(subject as SubjectId, category as CategoryId, id);

  // 内容项不存在时显示占位
  if (!subjectData || !categoryData) {
    notFound();
  }

  // 服务端直接读取正文做首屏 SSR，消除「客户端挂载后再 fetch /api/section」的瀑布与骨架闪烁。
  const initialContent = readContentMarkdown(subject, category, id);

  return (
    <ContentPageClient
      subjectId={subject as SubjectId}
      categoryId={category as CategoryId}
      itemId={id}
      initialContent={initialContent}
      itemTitle={item?.title ?? ""}
      itemSummary={item?.summary ?? ""}
      subjectName={subjectData.name}
      categoryName={categoryData.name}
      itemStatus={item?.status ?? "stub"}
    />
  );
}
